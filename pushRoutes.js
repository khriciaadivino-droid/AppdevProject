const express = require('express');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const DeviceToken = require('./DeviceToken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

const parseFirebaseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    } catch {
      return null;
    }
  }
};

const ensureFirebaseAdmin = () => {
  if (admin.apps.length) return true;
  const serviceAccount = parseFirebaseServiceAccount();
  if (!serviceAccount) return false;
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return true;
  } catch {
    return false;
  }
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.post('/push/register', requireAuth, async (req, res) => {
  try {
    const { token, platform } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'token is required' });
    }

    const normalizedPlatform = typeof platform === 'string' ? platform : 'unknown';

    const existing = await DeviceToken.findOne({ where: { token } });
    if (existing) {
      existing.userId = Number(req.userId);
      existing.platform = normalizedPlatform;
      existing.lastSeenAt = new Date();
      await existing.save();
    } else {
      await DeviceToken.create({
        userId: Number(req.userId),
        token,
        platform: normalizedPlatform,
        createdAt: new Date(),
        lastSeenAt: new Date(),
      });
    }

    return res.status(200).json({ success: true, message: 'Device token registered' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Register failed' });
  }
});

router.post('/push/test', requireAuth, async (req, res) => {
  try {
    const ok = ensureFirebaseAdmin();
    if (!ok) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT_KEY missing/invalid)',
      });
    }

    const { title, body } = req.body || {};
    const finalTitle = typeof title === 'string' && title.trim() ? title.trim() : 'Divino';
    const finalBody =
      typeof body === 'string' && body.trim()
        ? body.trim()
        : 'Test push notification (FCM) ✅';

    const tokens = await DeviceToken.findAll({ where: { userId: Number(req.userId) } });
    if (!tokens.length) {
      return res.status(404).json({
        success: false,
        message: 'No device tokens registered for this user yet.',
      });
    }

    const sendResults = await Promise.all(
      tokens.map(async (row) => {
        try {
          const message = {
            token: row.token,
            notification: {
              title: finalTitle,
              body: finalBody,
            },
            data: {
              type: 'test',
            },
            android: {
              priority: 'high',
              notification: { channelId: 'default' },
            },
          };

          const messageId = await admin.messaging().send(message);
          row.lastSeenAt = new Date();
          await row.save();
          return { token: row.token, ok: true, messageId };
        } catch (err) {
          return { token: row.token, ok: false, error: err.message || String(err) };
        }
      })
    );

    return res.status(200).json({ success: true, results: sendResults });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Push test failed' });
  }
});

module.exports = router;


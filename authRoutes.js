const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { broadcast } = require('./websocket');

const User = require('./User');

// Initialize Firebase Admin (if not already initialized)
// DEBUG: Check if FIREBASE_SERVICE_ACCOUNT_KEY is loaded
console.log('DEBUG ENV KEY:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Loaded' : 'Missing');
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.log('⚠️ Firebase Admin not initialized - Google login verification will be limited');
  }
}

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '7d';

const createToken = userId => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const sanitizeUser = userDoc => ({
  id: userDoc.id,
  email: userDoc.email,
  name: userDoc.name,
  roles: userDoc.roles,
  status: userDoc.status,
  createdAt: userDoc.createdAt,
  lastLoginAt: userDoc.lastLoginAt,
});

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roles: ['ROLE_USER'],
      status: 'active',
      createdAt: new Date(),
    });

    const token = createToken(String(user.id));

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.scope('withPassword').findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Support both hashed and legacy plain-text passwords.
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const passwordValue = String(password);
    const passwordMatches = user.password.startsWith('$2')
      ? await bcrypt.compare(passwordValue, user.password)
      : passwordValue === user.password;

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = createToken(String(user.id));

    user.lastLoginAt = new Date();
    await user.save();

    broadcast({
      type: 'notification',
      data: {
        id: Date.now(),
        action: 'LOGIN',
        target_data: null,
        username: user.name,
        role: (user.roles || [])[0] || 'ROLE_USER',
        timestamp: new Date().toISOString(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

// Google Sign-In endpoint (verifies Google ID token)
const { OAuth2Client } = require('google-auth-library');

// Use the same web client ID as the frontend for Google token verification
const GOOGLE_CLIENT_ID = '189109871383-06n3v0a3hamnd8rkk71u3tke1uen6r95.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/auth/google-login', async (req, res) => {
  try {
    console.log('🟡 /auth/google-login request body:', req.body);
    const { idToken, email, name, photoURL, googleId } = req.body || {};

    if (!idToken) {
      console.log('🔴 No idToken provided');
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    // Verify Google ID token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
      console.log('🟢 Google ID token verified. Payload:', payload);
    } catch (err) {
      console.log('🔴 Google ID token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid Google ID token.' });
    }

    const normalizedEmail = String(payload.email).trim().toLowerCase();

    // Check if user exists
    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (user) {
      if (photoURL && !user.photoURL) {
        console.log('ℹ️ Ignoring photoURL because local table does not store it yet');
      }
    } else {
      // Create new user from Google login
      user = await User.create({
        name: String(name || email).trim(),
        email: normalizedEmail,
        password: null, // Google users don't have passwords
        roles: ['ROLE_USER'],
        status: 'active',
      });
      console.log('✅ New Google user created:', normalizedEmail);
    }

    const token = createToken(String(user.id));

    const responseUser = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: responseUser,
    });
  } catch (error) {
    console.error('🔴 Google login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Google login failed',
    });
  }
});

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

router.post('/auth/logout', requireAuth, (_req, res) => {
  return res.status(200).json({ success: true, message: 'Logout successful' });
});

router.get('/auth/verify', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Token verification failed',
    });
  }
});

module.exports = router;

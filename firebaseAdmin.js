const admin = require('firebase-admin');

const parseFirebaseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  const candidates = [String(raw).trim().replace(/^\uFEFF/, '')];

  if (candidates[0].startsWith("'") && candidates[0].endsWith("'")) {
    candidates.push(candidates[0].slice(1, -1));
  }
  if (candidates[0].startsWith('"') && candidates[0].endsWith('"')) {
    candidates.push(candidates[0].slice(1, -1));
  }

  // Railway sometimes stores JSON with literal \n instead of newlines
  candidates.push(candidates[0].replace(/\\n/g, '\n'));

  for (const value of candidates) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.type === 'service_account') {
        return parsed;
      }
    } catch {
      /* try next */
    }
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.type === 'service_account') {
        return parsed;
      }
    } catch {
      /* try next */
    }
  }
  return null;
};

const initFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin;
  }

  const serviceAccount = parseFirebaseServiceAccount();
  if (serviceAccount) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('✅ Firebase Admin initialized');
      return admin;
    } catch (error) {
      console.log('⚠️ Firebase Admin init failed:', error.message);
      return null;
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log(
      '⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid service-account JSON (or base64 JSON).'
    );
    console.log(
      '💡 In Railway: paste the full Firebase JSON key file as one line, or base64-encode it.'
    );
  }

  return null;
};

module.exports = { admin, initFirebaseAdmin, parseFirebaseServiceAccount };

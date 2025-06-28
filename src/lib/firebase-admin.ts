
import * as admin from 'firebase-admin';

// This function safely parses the base64 encoded service account key.
const getServiceAccount = () => {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!serviceAccountKey) {
    return undefined;
  }
  try {
    return JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
  } catch (e) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64:", e);
    return undefined;
  }
};

const serviceAccount = getServiceAccount();

if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
    }
  } else {
    console.warn(`
      ACTION REQUIRED: Firebase Admin SDK not initialized.
      The Paddle webhook for new user creation will not work without it.
      Please create a service account in your Firebase project settings,
      generate a new private key (JSON file), base64 encode it, and
      add it to your .env file as FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.
    `);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;


import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (serviceAccountKey) {
    // Priority 1: Use the provided service account key from environment variables (for local dev or Vercel)
    console.log("[Firebase Admin] Initializing with service account key from environment variable.");
    try {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error("[Firebase Admin] FATAL: Failed to parse or initialize with FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.", e);
      // Fall through to try the default credential
    }
  }
  
  // If initialization with key failed or key wasn't provided, try default credentials
  if (!app) {
     // Priority 2: Use Application Default Credentials (for deployed GCP/Firebase environments)
    console.log("[Firebase Admin] Service account key not found or failed. Attempting to initialize with Application Default Credentials.");
    try {
        app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        console.log("[Firebase Admin] Successfully initialized with Application Default Credentials.");
    } catch(e) {
        console.error("[Firebase Admin] FATAL: Could not initialize with Application Default Credentials.", e);
        console.warn(`
        ACTION REQUIRED: Firebase Admin SDK could not be initialized.
        - For local development, ensure FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is set correctly in your .env file.
        - For deployed environments (Vercel, etc.), ensure the service account environment variable is set.
        - For Firebase/GCP environments, ensure the runtime service account has necessary permissions (e.g., "Firebase Admin SDK Administrator Service Agent").
        The Paddle webhook and other admin features WILL NOT WORK.
        `);
    }
  }
} else {
    app = admin.apps[0];
}


export const adminAuth = app ? admin.auth() : null;
export const adminDb = app ? admin.firestore() : null;

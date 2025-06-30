
'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { UserData } from './firebaseUserActions'; // reuse type
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const generateReferralCode = (length = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toUpperCase();
};

/**
 * Updates a user's plan in Firestore using their Firebase UID.
 * This is the primary and most reliable method for updating user data after a purchase.
 * It's also the function you would use if you wanted to grant a plan to a user manually from a server environment.
 * 
 * To manually grant a plan to a user from the Firebase Console:
 * 1. Go to your Firebase Console -> Firestore Database.
 * 2. Find the 'users' collection.
 * 3. Find the document corresponding to the user's UID.
 * 4. Edit the 'plan' field and set its value to "monthly" or "yearly".
 * 
 * This function is designed to be resilient to race conditions where the user document might not exist yet.
 * @param uid The user's Firebase UID.
 * @param newPlan The plan they purchased or are being granted.
 * @returns { success: boolean, message: string }
 */
export async function updateUserPlanByUID(
  uid: string,
  newPlan: 'monthly' | 'yearly'
): Promise<{ success: boolean; message: string }> {
  console.log(`[Admin Action] Attempting to update plan for UID: ${uid} to new plan: ${newPlan}`);
  
  if (!adminDb || !adminAuth) {
    const errorMessage = 'Firebase Admin SDK is not initialized. Ensure server environment variables are set. Cannot process purchase.';
    console.error(`[Admin Action] ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!uid) {
    console.error('[Admin Action] updateUserPlanByUID called with no UID. Aborting.');
    return { success: false, message: 'UID is required.' };
  }

  try {
    const userRef = adminDb.collection('users').doc(uid);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
      // User document exists, just update the plan.
      await userRef.update({
        plan: newPlan,
        updatedAt: Timestamp.now(),
        // Reset usage data upon upgrade
        dailyGenerationsUsed: 0,
      });
      console.log(`[Admin Action] Updated plan for existing user UID: ${uid} to ${newPlan}`);
    } else {
      // User document does NOT exist. Create it. This handles the race condition.
      console.warn(`[Admin Action] User document for UID ${uid} not found. Creating it now.`);
      const userRecord = await adminAuth.getUser(uid); // Get auth record to find email
      const email = userRecord.email;

      const newUserDoc: UserData = {
        uid: uid,
        email: email || null,
        displayName: userRecord.displayName || email?.split('@')[0] || 'SageUser',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        plan: newPlan, // Set their purchased plan
        referralCode: generateReferralCode(),
        referralsMade: 0,
        dailyGenerationsUsed: 0, // Set to 0 for new paid user
      };
      await userRef.set(newUserDoc);
      console.log(`[Admin Action] Created new user document for UID: ${uid} with plan ${newPlan}`);
    }

    return { success: true, message: `Successfully set plan for user ${uid}.` };
  } catch (error: any) {
    console.error(`[Admin Action] Error processing plan update for user UID ${uid}:`, error);
    return { success: false, message: `Failed to update plan for user ${uid}: ${error.message}` };
  }
}


/**
 * Finds a user by email. If they exist, updates their plan.
 * If they don't exist, creates a new Firebase Auth user and a corresponding
 * Firestore document with the purchased plan.
 * This is a FALLBACK method for when a UID is not available in the webhook.
 * @param email The customer's email from Paddle.
 * @param newPlan The plan they purchased.
 * @returns { success: boolean, message: string }
 */
export async function findOrCreateUserForPurchase(
  email: string,
  newPlan: 'monthly' | 'yearly'
): Promise<{ success: boolean; message: string }> {
  console.log(`[Admin Action] Attempting findOrCreateUserForPurchase | email: ${email}, plan: ${newPlan}`);

  if (!adminAuth || !adminDb) {
    const errorMessage = 'Firebase Admin SDK is not initialized. Ensure server environment variables are set. Cannot process purchase.';
    console.error(`[Admin Action] ${errorMessage}`);
    return {
      success: false,
      message: errorMessage,
    };
  }
  if (!email) {
    console.error('[Admin Action] findOrCreateUserForPurchase called with no email. Aborting.');
    return { success: false, message: 'Email is required.' };
  }

  try {
    // 1. Check if user exists in Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    // User exists in Auth, use the robust updateUserPlanByUID to handle Firestore doc.
    console.log(`[Admin Action] User found by email. UID: ${userRecord.uid}. Proceeding with plan update.`);
    return await updateUserPlanByUID(userRecord.uid, newPlan);

  } catch (error: any) {
    // 3. User does not exist, create them
    if (error.code === 'auth/user-not-found') {
      try {
        console.log(`[Admin Action] User with email ${email} not found. Creating new auth user.`);
        const newUserRecord = await adminAuth.createUser({
          email: email,
          emailVerified: true, // Since they paid, we can assume email is valid
        });

        const userRef = adminDb.collection('users').doc(newUserRecord.uid);

        const newUserDoc: UserData = {
          uid: newUserRecord.uid,
          email: email,
          displayName: email.split('@')[0] || 'New Sage User',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          plan: newPlan, // Start them on their purchased plan
          referralCode: generateReferralCode(),
          referralsMade: 0,
          dailyGenerationsUsed: 0, // Set to 0 for new paid user
        };

        await userRef.set(newUserDoc);
        
        // In a real app, you would use a service like SendGrid or Resend
        // to send a welcome email with a password setup link.
        const passwordResetLink = await adminAuth.generatePasswordResetLink(email);
        console.log(`
          [Admin Action] ACTION REQUIRED: A new user signed up via Paddle!
          Email: ${email}
          Plan: ${newPlan}
          To complete setup, send them this password reset link: ${passwordResetLink}
        `);

        return { success: true, message: `Created new user ${email} with plan ${newPlan}.` };

      } catch (creationError: any) {
        console.error('[Admin Action] Error creating new user after purchase:', creationError);
        return { success: false, message: `Failed to create new user: ${creationError.message}` };
      }
    }

    // Handle other errors
    console.error(`[Admin Action] Error in findOrCreateUserForPurchase for email ${email}:`, error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}

export const checkAndIncrementUsage = async (userId: string): Promise<{ canProceed: boolean; error?: string }> => {
  if (!adminDb) {
      console.error(`
        *****************************************************************
        *           CRITICAL WARNING: USAGE CHECKING DISABLED           *
        *****************************************************************
        * Firebase Admin SDK is not initialized.                        *
        * ALL USERS WILL HAVE UNLIMITED USAGE.                          *
        * To fix this, set FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 in your  *
        * server's environment variables.                               *
        *****************************************************************
      `);
      return { canProceed: true }; // Allow the action but with a server warning
  }
  if (!userId) {
      return { canProceed: false, error: "User not authenticated." };
  }

  const userRef = adminDb.collection('users').doc(userId);
  
  try {
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
          return { canProceed: false, error: "User data not found. Please re-login." };
      }

      const userData = userSnap.data() as UserData;

      if (userData.plan !== 'free') {
          return { canProceed: true };
      }

      const DAILY_GENERATION_LIMIT = 6;
      const now = new Date();
      // Get the start of today in UTC
      const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();

      let lastGenTime = 0;
      if (userData.lastGenerationDate) {
        const lastGenDate = userData.lastGenerationDate.toDate();
        // Get the start of the last generation day in UTC
        lastGenTime = new Date(Date.UTC(lastGenDate.getUTCFullYear(), lastGenDate.getUTCMonth(), lastGenDate.getUTCDate())).getTime();
      }

      let dailyGenerationsUsed = userData.dailyGenerationsUsed || 0;
      let updates: {[key: string]: any} = {};

      // If the last generation was before the start of today, it's a new day.
      if (lastGenTime < todayUTCStart) {
          dailyGenerationsUsed = 0; // Reset count for the check
          updates.dailyGenerationsUsed = 1; // It will become 1 after this generation
          updates.lastGenerationDate = Timestamp.now();
      } else {
          // Same day, just increment
          updates.dailyGenerationsUsed = FieldValue.increment(1);
      }
      
      if (dailyGenerationsUsed >= DAILY_GENERATION_LIMIT) {
          return { canProceed: false, error: `USAGE_LIMIT_EXCEEDED:You've used all ${DAILY_GENERATION_LIMIT} of your free daily generations. Please upgrade for unlimited access.` };
      }

      // If the check passes, perform the update
      updates.updatedAt = Timestamp.now();
      await userRef.update(updates);

      return { canProceed: true };
  } catch (error: any) {
       console.error(`[checkAndIncrementUsage] Error for UID ${userId}:`, error);
       return { canProceed: false, error: "An error occurred while checking your usage data." };
  }
};

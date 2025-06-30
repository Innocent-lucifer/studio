
'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { UserData } from './firebaseUserActions'; // reuse type
import { Timestamp } from 'firebase-admin/firestore';

const generateReferralCode = (length = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toUpperCase();
};

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
      await userRef.update({
        plan: newPlan,
        updatedAt: Timestamp.now(),
        dailyGenerationsUsed: 0,
      });
      console.log(`[Admin Action] Updated plan for existing user UID: ${uid} to ${newPlan}`);
    } else {
      console.warn(`[Admin Action] User document for UID ${uid} not found. Creating it now.`);
      const userRecord = await adminAuth.getUser(uid);
      const email = userRecord.email;

      const newUserDoc: UserData = {
        uid: uid,
        email: email || null,
        displayName: userRecord.displayName || email?.split('@')[0] || 'SageUser',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        plan: newPlan,
        referralCode: generateReferralCode(),
        referralsMade: 0,
        dailyGenerationsUsed: 0,
        lastGenerationDate: Timestamp.now(),
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
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log(`[Admin Action] User found by email. UID: ${userRecord.uid}. Proceeding with plan update.`);
    return await updateUserPlanByUID(userRecord.uid, newPlan);

  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      try {
        console.log(`[Admin Action] User with email ${email} not found. Creating new auth user.`);
        const newUserRecord = await adminAuth.createUser({
          email: email,
          emailVerified: true,
        });

        const userRef = adminDb.collection('users').doc(newUserRecord.uid);

        const newUserDoc: UserData = {
          uid: newUserRecord.uid,
          email: email,
          displayName: email.split('@')[0] || 'New Sage User',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          plan: newPlan,
          referralCode: generateReferralCode(),
          referralsMade: 0,
          dailyGenerationsUsed: 0,
          lastGenerationDate: Timestamp.now(),
        };

        await userRef.set(newUserDoc);
        
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

    console.error(`[Admin Action] Error in findOrCreateUserForPurchase for email ${email}:`, error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}

export const checkAndIncrementUsage = async (userId: string): Promise<{ canProceed: boolean; error?: string }> => {
  if (!adminDb) {
    console.error("CRITICAL WARNING: USAGE CHECKING DISABLED. Firebase Admin SDK is not initialized.");
    return { canProceed: true };
  }
  if (!userId) {
    return { canProceed: false, error: "User not authenticated." };
  }

  const userRef = adminDb.collection('users').doc(userId);

  try {
    const status = await adminDb.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        console.warn(`[checkAndIncrementUsage] User document not found for UID: ${userId}.`);
        return { canProceed: false, error: "User data not found. Please re-login." };
      }

      const userData = userSnap.data() as UserData;

      if (userData.plan === 'monthly' || userData.plan === 'yearly') {
        return { canProceed: true };
      }

      const DAILY_GENERATION_LIMIT = 6;
      const now = new Date();
      const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();
      
      let lastGenTime = 0;
      if (userData.lastGenerationDate) {
        const lastGenDate = userData.lastGenerationDate.toDate();
        lastGenTime = new Date(Date.UTC(lastGenDate.getUTCFullYear(), lastGenDate.getUTCMonth(), lastGenDate.getUTCDate())).getTime();
      }
      
      let dailyGenerationsUsed = userData.dailyGenerationsUsed || 0;

      if (lastGenTime < todayUTCStart) {
        dailyGenerationsUsed = 0;
      }
      
      if (dailyGenerationsUsed >= DAILY_GENERATION_LIMIT) {
        return { canProceed: false, error: "USAGE_LIMIT_EXCEEDED" };
      }

      transaction.update(userRef, {
        dailyGenerationsUsed: dailyGenerationsUsed + 1,
        lastGenerationDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { canProceed: true };
    });
    return status;
  } catch (error: any) {
    console.error(`[checkAndIncrementUsage] Transaction Error for UID ${userId}:`, error);
    return { canProceed: false, error: "An error occurred while checking your usage data." };
  }
};

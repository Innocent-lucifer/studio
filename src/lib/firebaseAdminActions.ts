
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

export const checkTrialAndSubscription = async (userId: string): Promise<{ canProceed: boolean; error?: string }> => {
  if (!adminDb) {
    console.error("CRITICAL WARNING: USAGE CHECKING DISABLED. Firebase Admin SDK is not initialized.");
    return { canProceed: true };
  }
  if (!userId) {
    return { canProceed: false, error: "User not authenticated." };
  }

  const userRef = adminDb.collection('users').doc(userId);

  try {
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn(`[checkTrialAndSubscription] User document not found for UID: ${userId}.`);
      return { canProceed: false, error: "User data not found. Please re-login." };
    }

    const userData = userSnap.data() as UserData;

    // Paid users always have access.
    if (userData.plan === 'monthly' || userData.plan === 'yearly') {
      return { canProceed: true };
    }

    // Free users are on a 3-day trial.
    if (!userData.createdAt) {
      console.error(`[checkTrialAndSubscription] User ${userId} is on free plan but has no createdAt timestamp.`);
      return { canProceed: false, error: "Account creation date not found. Please contact support." };
    }

    const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
    const trialEndDate = userData.createdAt.toMillis() + threeDaysInMillis;
    const now = Date.now();

    if (now > trialEndDate) {
      return { canProceed: false, error: "TRIAL_EXPIRED" };
    }

    // If trial is still active
    return { canProceed: true };

  } catch (error: any) {
    console.error(`[checkTrialAndSubscription] Transaction Error for UID ${userId}:`, error);
    return { canProceed: false, error: "An error occurred while checking your subscription status." };
  }
};

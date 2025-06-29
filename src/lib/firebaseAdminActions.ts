
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

/**
 * Updates a user's plan in Firestore using their Firebase UID.
 * This is the primary and most reliable method for updating user data after a purchase.
 * This version is resilient to race conditions where the user document might not exist yet.
 * @param uid The user's Firebase UID.
 * @param newPlan The plan they purchased.
 * @returns { success: boolean, message: string }
 */
export async function updateUserPlanByUID(
  uid: string,
  newPlan: 'monthly' | 'yearly'
): Promise<{ success: boolean; message: string }> {
  console.log(`[Admin Action] Attempting to update plan for UID: ${uid} to new plan: ${newPlan}`);
  
  if (!adminDb || !adminAuth) {
    const errorMessage = 'Firebase Admin SDK is not initialized. Cannot process purchase.';
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

    if (docSnap.exists) { // Corrected: .exists is a property on the snapshot
      // User document exists, just update the plan.
      await userRef.update({
        plan: newPlan,
        updatedAt: Timestamp.now(),
        // Reset trial data upon upgrade
        generationsUsed: 0,
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
        generationsUsed: 0, // Set to 0 for new paid user
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
    const errorMessage = 'Firebase Admin SDK is not initialized. Cannot process purchase.';
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
          generationsUsed: 0, // Set to 0 for new paid user
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

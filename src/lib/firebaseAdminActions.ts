
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
 * Finds a user by email. If they exist, updates their plan.
 * If they don't exist, creates a new Firebase Auth user and a corresponding
 * Firestore document with the purchased plan.
 * THIS MUST ONLY BE CALLED FROM A SECURE SERVER ENVIRONMENT (e.g., a webhook).
 * @param email The customer's email from Paddle.
 * @param newPlan The plan they purchased.
 * @returns { success: boolean, message: string }
 */
export async function findOrCreateUserForPurchase(
  email: string,
  newPlan: 'monthly' | 'yearly'
): Promise<{ success: boolean; message: string }> {
  if (!adminAuth || !adminDb) {
    const errorMessage = 'Firebase Admin SDK is not initialized. Cannot process purchase.';
    console.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  try {
    // 1. Check if user exists in Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    const userRef = adminDb.collection('users').doc(userRecord.uid);
    
    // 2. User exists, update their plan
    await userRef.update({
      plan: newPlan,
      updatedAt: Timestamp.now(),
    });

    console.log(`Updated plan for existing user: ${email} to ${newPlan}`);
    return { success: true, message: `Updated plan for existing user ${email}.` };

  } catch (error: any) {
    // 3. User does not exist, create them
    if (error.code === 'auth/user-not-found') {
      try {
        const newUserRecord = await adminAuth.createUser({
          email: email,
          emailVerified: true, // Since they paid, we can assume email is valid
        });

        const userRef = adminDb.collection('users').doc(newUserRecord.uid);

        const newUserDoc: UserData = {
          uid: newUserRecord.uid,
          email: email,
          displayName: email.split('@')[0],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          plan: newPlan, // Start them on their purchased plan
          referralCode: generateReferralCode(),
          referralsMade: 0,
        };

        await userRef.set(newUserDoc);
        
        // TODO: In a real app, send a welcome email with a password setup link.
        // For now, we log it.
        const passwordResetLink = await adminAuth.generatePasswordResetLink(email);
        console.log(`
          ACTION REQUIRED: A new user signed up via Paddle!
          Email: ${email}
          Plan: ${newPlan}
          To complete setup, send them this password reset link: ${passwordResetLink}
        `);

        return { success: true, message: `Created new user ${email} with plan ${newPlan}.` };

      } catch (creationError: any) {
        console.error('Error creating new user after purchase:', creationError);
        return { success: false, message: `Failed to create new user: ${creationError.message}` };
      }
    }

    // Handle other errors
    console.error('Error in findOrCreateUserForPurchase:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}

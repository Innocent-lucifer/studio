
import { app, auth } from '@/lib/firebase';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { User as FirebaseAuthUser } from 'firebase/auth';

const db = getFirestore(app);

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  // credits?: number; // Temporarily disabled
  // plan?: 'free' | 'starter' | 'infinity'; // Temporarily disabled
  // lastLogin?: Timestamp; // Temporarily disabled
  // lastFreeCreditResetTimestamp?: Timestamp; // Temporarily disabled
  // monthlyCreditsProvisionedTimestamp?: Timestamp; // Temporarily disabled
  // creditHistory?: CreditTransaction[]; // Temporarily disabled
  createdAt: Timestamp;
  referralCode?: string; // For referring others
  referredBy?: string; // UID of the user who referred this user
  referralsMade?: number; // Count of successful referrals
}

/* // Temporarily disabled
export interface CreditTransaction {
  id: string;
  type: CreditTransactionType;
  amount: number;
  reason: string;
  timestamp: Timestamp;
  relatedFlow?: string; // e.g., 'generateTwitterPosts', 'imageToPost'
}

export enum CreditTransactionType {
  INITIAL_SIGNUP = 'INITIAL_SIGNUP',
  PURCHASE = 'PURCHASE',
  FEATURE_USE_QUICK_POST = 'FEATURE_USE_QUICK_POST',
  FEATURE_USE_SMART_CAMPAIGN_ANGLES = 'FEATURE_USE_SMART_CAMPAIGN_ANGLES',
  FEATURE_USE_SMART_CAMPAIGN_SERIES = 'FEATURE_USE_SMART_CAMPAIGN_SERIES',
  FEATURE_USE_IMAGE_TO_POST = 'FEATURE_USE_IMAGE_TO_POST',
  FEATURE_USE_AI_EDIT = 'FEATURE_USE_AI_EDIT',
  FEATURE_USE_TREND_EXPLORER = 'FEATURE_USE_TREND_EXPLORER',
  REGENERATE_POST = 'REGENERATE_POST',
  ADMIN_ADJUSTMENT_ADD = 'ADMIN_ADJUSTMENT_ADD',
  ADMIN_ADJUSTMENT_DEDUCT = 'ADMIN_ADJUSTMENT_DEDUCT',
  FREE_TIER_RESET = 'FREE_TIER_RESET',
  STARTER_PACK_MONTHLY = 'STARTER_PACK_MONTHLY',
  REFERRAL_BONUS_AWARDED = 'REFERRAL_BONUS_AWARDED', // For the referrer
  REFERRAL_BONUS_RECEIVED = 'REFERRAL_BONUS_RECEIVED', // For the new user
}

export const CREDIT_COSTS = {
  QUICK_POST_GENERATION: 20,
  REGENERATE_POST: 5,
  AI_EDIT: 5,
  SMART_CAMPAIGN_ANGLES: 25,
  SMART_CAMPAIGN_SERIES: 30, // Per platform series
  IMAGE_TO_POST: 60,
  TREND_EXPLORER_FETCH: 2, // Example cost
  INITIAL_SIGNUP_CREDITS: 40,
  FREE_TIER_BIWEEKLY_CREDITS: 40,
  STARTER_PACK_MONTHLY_CREDITS: 700,
  REFERRAL_BONUS_CREDITS: 50, // Credits for both referrer and new user
};
*/

const generateReferralCode = (length = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toUpperCase();
};

export const createUserDocument = async (
  user: FirebaseAuthUser,
  referredByCode?: string
): Promise<UserData | null> => {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid) as DocumentReference<UserData>;
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'SageUser',
      // credits: CREDIT_COSTS.INITIAL_SIGNUP_CREDITS, // Temporarily disabled
      // plan: 'free', // Temporarily disabled
      createdAt: serverTimestamp() as Timestamp,
      // lastLogin: serverTimestamp() as Timestamp, // Temporarily disabled
      // lastFreeCreditResetTimestamp: serverTimestamp() as Timestamp, // Temporarily disabled
      referralCode: generateReferralCode(),
      referralsMade: 0,
    };
/* // Temporarily disabled
    // Handle referral if code provided
    if (referredByCode) {
      const q = query(collection(db, 'users'), where('referralCode', '==', referredByCode.toUpperCase()));
      const referrerSnap = await getDocs(q);
      if (!referrerSnap.empty) {
        const referrerDoc = referrerSnap.docs[0];
        const referrerId = referrerDoc.id;
        userData.referredBy = referrerId;
        userData.credits = (userData.credits || 0) + CREDIT_COSTS.REFERRAL_BONUS_CREDITS; // Bonus for new user

        // Award bonus to referrer (handled in a transaction for safety if needed)
        const referrerUserRef = doc(db, 'users', referrerId) as DocumentReference<UserData>;
        await updateDoc(referrerUserRef, {
          credits: increment(CREDIT_COSTS.REFERRAL_BONUS_CREDITS),
          referralsMade: increment(1),
          // creditHistory: arrayUnion(
          //   createTransactionObject(
          //     CREDIT_COSTS.REFERRAL_BONUS_CREDITS,
          //     CreditTransactionType.REFERRAL_BONUS_AWARDED,
          //     `Referral bonus for ${user.email || user.uid}`
          //   )
          // ),
        });
        console.log(`Referral bonus awarded to ${referrerId} for referring ${user.uid}`);
      } else {
        console.warn(`Referral code ${referredByCode} not found.`);
      }
    }

    // userData.creditHistory = [
    //   createTransactionObject(
    //     CREDIT_COSTS.INITIAL_SIGNUP_CREDITS,
    //     CreditTransactionType.INITIAL_SIGNUP,
    //     'Initial signup credits'
    //   ),
    //   ...(userData.referredBy ? [createTransactionObject(
    //       CREDIT_COSTS.REFERRAL_BONUS_CREDITS,
    //       CreditTransactionType.REFERRAL_BONUS_RECEIVED,
    //       `Bonus for being referred by ${userData.referredBy}`
    //     )] : [])
    // ];
*/
    try {
      await setDoc(userRef, userData);
      console.log(`User document created for ${user.uid} with initial data.`);
      return userData;
    } catch (error) {
      console.error('Error creating user document:', error);
      return null;
    }
  } else {
    // User document exists, update lastLogin
    // try { // Temporarily disabled
    //   await updateDoc(userRef, { lastLogin: serverTimestamp() as Timestamp });
    // } catch (error) {
    //   console.error('Error updating lastLogin:', error);
    // }
    return userSnap.data();
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.warn(`No user data found for UID: ${uid}. Attempting to create one if auth user exists.`);
      // This case might happen if auth exists but Firestore doc creation failed or was delayed
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        return await createUserDocument(currentUser); // Try to create it now
      }
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/* // Temporarily disabled
const createTransactionObject = (
  amount: number,
  type: CreditTransactionType,
  reason: string,
  relatedFlow?: string
): CreditTransaction => {
  return {
    id: doc(collection(db, 'dummy')).id, // Generate a unique ID
    amount,
    type,
    reason,
    timestamp: serverTimestamp() as Timestamp,
    ...(relatedFlow && { relatedFlow }),
  };
};

export const deductCredits = async (
  uid: string,
  amountToDeduct: number,
  reason: string,
  transactionType: CreditTransactionType,
  relatedFlow?: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  if (!uid || amountToDeduct <= 0) {
    return { success: false, error: 'Invalid input for credit deduction.' };
  }
  console.log(`[deductCredits] User: ${uid}, Amount: ${amountToDeduct}, Reason: ${reason}, Type: ${transactionType}`);

  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;

  try {
    const userData = await getDoc(userRef);
    if (!userData.exists()) {
      return { success: false, error: 'User data not found for credit deduction.' };
    }

    const currentData = userData.data();
    if (currentData.plan === 'infinity') {
      console.log(`[deductCredits] User ${uid} is on infinity plan. No credits deducted for ${reason}.`);
      // Optionally record the "free" transaction for tracking feature usage
      // await recordTransaction(uid, 0, transactionType, `Feature use (Infinity Plan): ${reason}`, relatedFlow);
      return { success: true, newBalance: Infinity }; // Or currentData.credits if you prefer
    }

    if ((currentData.credits || 0) < amountToDeduct) {
      return { success: false, error: 'Insufficient credits.' };
    }

    const newBalance = (currentData.credits || 0) - amountToDeduct;
    const transaction = createTransactionObject(-amountToDeduct, transactionType, reason, relatedFlow);

    await updateDoc(userRef, {
      credits: increment(-amountToDeduct),
      creditHistory: arrayUnion(transaction),
    });
    console.log(`[deductCredits] Successfully deducted ${amountToDeduct} credits from user ${uid}. New balance: ${newBalance}`);
    return { success: true, newBalance };
  } catch (error: any) {
    console.error(`Error deducting credits for user ${uid}:`, error);
    return { success: false, error: error.message || 'Failed to deduct credits due to a server error.' };
  }
};

export const addCredits = async (
  uid: string,
  amountToAdd: number,
  reason: string,
  transactionType: CreditTransactionType,
  relatedFlow?: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  if (!uid || amountToAdd <= 0) {
    return { success: false, error: 'Invalid input for adding credits.' };
  }
  console.log(`[addCredits] User: ${uid}, Amount: ${amountToAdd}, Reason: ${reason}, Type: ${transactionType}`);

  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userData = await getDoc(userRef);
    if (!userData.exists()) {
      // This shouldn't happen if user creation is robust, but handle it.
      // Potentially create the user here or return error. For now, error.
      return { success: false, error: 'User data not found for adding credits.' };
    }
    
    const currentCredits = userData.data()?.credits || 0;
    const newBalance = currentCredits + amountToAdd;
    const transaction = createTransactionObject(amountToAdd, transactionType, reason, relatedFlow);

    await updateDoc(userRef, {
      credits: increment(amountToAdd),
      creditHistory: arrayUnion(transaction),
    });
    console.log(`[addCredits] Successfully added ${amountToAdd} credits to user ${uid}. New balance: ${newBalance}`);
    return { success: true, newBalance };
  } catch (error: any) {
    console.error(`Error adding credits for user ${uid}:`, error);
    return { success: false, error: error.message || 'Failed to add credits due to a server error.' };
  }
};


export const recordTransaction = async (
  uid: string,
  amount: number, // Can be positive or negative
  type: CreditTransactionType,
  reason: string,
  relatedFlow?: string
): Promise<void> => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  const transaction = createTransactionObject(amount, type, reason, relatedFlow);
  try {
    await updateDoc(userRef, {
      creditHistory: arrayUnion(transaction),
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
  }
};

// --- Scheduled Functions (to be triggered by Cloud Scheduler) ---

// Resets credits for all free-tier users if it's been 2 weeks
export const resetFreeTierCredits = async (): Promise<void> => {
  console.log('[resetFreeTierCredits] Starting bi-weekly credit reset for free users.');
  const twoWeeksAgo = Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
  
  const q = query(
    collection(db, 'users') as collectionReference<UserData>,
    where('plan', '==', 'free'),
    where('lastFreeCreditResetTimestamp', '<=', twoWeeksAgo)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('[resetFreeTierCredits] No free users found needing a credit reset.');
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach(userDocSnap => {
      const userRef = doc(db, 'users', userDocSnap.id) as DocumentReference<UserData>;
      const newTransaction = createTransactionObject(
        CREDIT_COSTS.FREE_TIER_BIWEEKLY_CREDITS,
        CreditTransactionType.FREE_TIER_RESET,
        'Bi-weekly free credits'
      );
      batch.update(userRef, {
        credits: CREDIT_COSTS.FREE_TIER_BIWEEKLY_CREDITS, // Reset to 40, not increment
        lastFreeCreditResetTimestamp: serverTimestamp() as Timestamp,
        creditHistory: arrayUnion(newTransaction),
      });
    });

    await batch.commit();
    console.log(`[resetFreeTierCredits] Successfully reset credits for ${querySnapshot.size} free users.`);
  } catch (error) {
    console.error('[resetFreeTierCredits] Error resetting free tier credits:', error);
  }
};

// Provisions monthly credits for starter pack users and handles expiry
export const provisionStarterPackMonthlyCredits = async (): Promise<void> => {
  console.log('[provisionStarterPackMonthlyCredits] Starting monthly credit provisioning for starter pack users.');
  // This logic assumes a subscription management system (e.g., Stripe) handles actual subscription status.
  // This function would typically be called after confirming an active subscription renewal.

  const oneMonthAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // Approx

  const q = query(
    collection(db, 'users') as collectionReference<UserData>,
    where('plan', '==', 'starter'),
    // This condition means they haven't received credits this month yet,
    // or their last provision was over a month ago.
    where('monthlyCreditsProvisionedTimestamp', '<=', oneMonthAgo) 
  );
  
  try {
    const querySnapshot = await getDocs(q);
     if (querySnapshot.empty) {
      console.log('[provisionStarterPackMonthlyCredits] No starter pack users found needing credit provisioning.');
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach(userDocSnap => {
      // IMPORTANT: In a real system, you'd verify their subscription is still active via your payment provider
      // before provisioning credits. This is a simplified example.
      const userRef = doc(db, 'users', userDocSnap.id) as DocumentReference<UserData>;
      const newTransaction = createTransactionObject(
        CREDIT_COSTS.STARTER_PACK_MONTHLY_CREDITS,
        CreditTransactionType.STARTER_PACK_MONTHLY,
        'Monthly starter pack credits'
      );
      batch.update(userRef, {
        credits: CREDIT_COSTS.STARTER_PACK_MONTHLY_CREDITS, // Set to 700 (expires old ones)
        monthlyCreditsProvisionedTimestamp: serverTimestamp() as Timestamp,
        creditHistory: arrayUnion(newTransaction),
      });
    });
    
    await batch.commit();
    console.log(`[provisionStarterPackMonthlyCredits] Successfully provisioned monthly credits for ${querySnapshot.size} starter pack users.`);
  } catch (error) {
    console.error('[provisionStarterPackMonthlyCredits] Error provisioning starter pack credits:', error);
  }
};
*/
export const awardReferralBonuses = async (referrerUid: string, newReferredUserUid: string, newReferredUserEmail?: string | null): Promise<void> => {
  /* // Temporarily disabled
  console.log(`[awardReferralBonuses] Attempting to award bonuses. Referrer: ${referrerUid}, New User: ${newReferredUserUid}`);
  if (!referrerUid || !newReferredUserUid) {
    console.error('[awardReferralBonuses] Missing referrerUID or newReferredUserUID.');
    return;
  }

  const batch = writeBatch(db);

  // Award referrer
  const referrerRef = doc(db, 'users', referrerUid) as DocumentReference<UserData>;
  const referrerBonusTransaction = createTransactionObject(
    CREDIT_COSTS.REFERRAL_BONUS_CREDITS,
    CreditTransactionType.REFERRAL_BONUS_AWARDED,
    `Referral bonus for new user: ${newReferredUserEmail || newReferredUserUid}`
  );
  batch.update(referrerRef, {
    credits: increment(CREDIT_COSTS.REFERRAL_BONUS_CREDITS),
    referralsMade: increment(1),
    creditHistory: arrayUnion(referrerBonusTransaction)
  });

  // Award new referred user (they already get initial signup + referral bonus during createUserDocument if referredBy was set)
  // This function is more about ensuring the referrer gets their part.
  // If the new user's `referredBy` wasn't set at creation, this could be a place to correct that,
  // but ideally, `createUserDocument` handles the new user's side of the bonus.

  try {
    await batch.commit();
    console.log(`[awardReferralBonuses] Successfully awarded referral bonuses. Referrer: ${referrerUid} incremented credits and referralsMade count.`);
  } catch (error) {
    console.error('[awardReferralBonuses] Error committing batch for referral bonuses:', error);
  }
  */
};

    
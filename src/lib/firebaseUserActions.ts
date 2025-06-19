
import { app, auth } from '@/lib/firebase';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  // increment, // Temporarily disabled
  arrayUnion,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  // where, // Temporarily disabled for credit/plan features
  getDocs,
  // writeBatch, // Temporarily disabled
  DocumentReference,
  // DocumentData, // Temporarily disabled
  deleteDoc,
  addDoc,
  orderBy,
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
  // creditHistory?: CreditTransaction[]; // Temporarily disabled - Will be re-enabled with credit system
  createdAt: Timestamp;
  referralCode?: string; // For referring others
  referredBy?: string; // UID of the user who referred this user
  referralsMade?: number; // Count of successful referrals
}

/* // Temporarily disabled - Will be re-enabled with credit system
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

export interface Draft {
  id?: string; // Firestore ID, optional when creating
  userId: string;
  platform: 'twitter' | 'linkedin' | 'visual';
  content: string;
  topic?: string; // Optional topic context for the draft
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CampaignDraft {
  id?: string; // Firestore ID
  userId: string;
  campaignTopic: string;
  selectedAngle: { // Store the chosen angle's details
    title: string;
    explanation: string;
  };
  twitterSeries?: string[];
  linkedinSeries?: string[];
  twitterRepurposingIdeas?: string[];
  linkedinRepurposingIdeas?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


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
  referredByCode?: string // Temporarily not used for credit logic
): Promise<UserData | null> => {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid) as DocumentReference<UserData>;
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'SageUser',
      createdAt: serverTimestamp() as Timestamp,
      referralCode: generateReferralCode(),
      referralsMade: 0,
    };

    if (referredByCode) {
        // Placeholder for future logic when credits are re-enabled
        // For now, just store referredBy if applicable
        // const q = query(collection(db, 'users'), where('referralCode', '==', referredByCode.toUpperCase()));
        // const referrerSnap = await getDocs(q);
        // if (!referrerSnap.empty) {
        //   const referrerDoc = referrerSnap.docs[0];
        //   userData.referredBy = referrerDoc.id;
        // }
        console.log(`User referred by code: ${referredByCode} - referral logic temporarily adjusted.`);
    }

    try {
      await setDoc(userRef, userData);
      console.log(`User document created for ${user.uid} with initial data.`);
      return userData;
    } catch (error) {
      console.error('Error creating user document:', error);
      return null;
    }
  } else {
    // User document exists, could update lastLogin if that field is re-enabled
    // try {
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
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        return await createUserDocument(currentUser);
      }
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/* // Temporarily disabled - Credit system logic will be re-enabled later

const createTransactionObject = (
  amount: number,
  type: CreditTransactionType,
  reason: string,
  relatedFlow?: string
): CreditTransaction => {
  return {
    id: doc(collection(db, 'dummy')).id, 
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
  console.log(`[Credit System Disabled] Attempted to deduct ${amountToDeduct} credits from ${uid} for ${reason}`);
  // Bypass actual deduction
  // const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  // try {
  //   const userDataSnap = await getDoc(userRef);
  //   if (!userDataSnap.exists()) {
  //     return { success: false, error: 'User data not found for credit deduction.' };
  //   }
  //   const currentCredits = userDataSnap.data()?.credits || 0;
  //   const plan = userDataSnap.data()?.plan;
  //   if (plan === 'infinity') {
  //       console.log(`User ${uid} on infinity plan. No credits deducted for ${reason}.`);
  //       return { success: true, newBalance: Infinity };
  //   }
  //   if (currentCredits < amountToDeduct) {
  //     return { success: false, error: 'Insufficient credits.' };
  //   }
  //   const newBalance = currentCredits - amountToDeduct;
  //   const transaction = createTransactionObject(-amountToDeduct, transactionType, reason, relatedFlow);
  //   await updateDoc(userRef, {
  //     credits: increment(-amountToDeduct),
  //     creditHistory: arrayUnion(transaction),
  //   });
  //   console.log(`Successfully deducted ${amountToDeduct} credits from user ${uid}. New balance: ${newBalance}`);
  //   return { success: true, newBalance };
  // } catch (error: any) {
  //   console.error(`Error deducting credits for user ${uid}:`, error);
  //   return { success: false, error: error.message || 'Failed to deduct credits due to a server error.' };
  // }
  return { success: true, newBalance: undefined }; // Simulate success
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
  console.log(`[Credit System Disabled] Attempted to add ${amountToAdd} credits to ${uid} for ${reason}`);
  // Bypass actual addition
  // const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  // try {
  //   const userDataSnap = await getDoc(userRef);
  //   if (!userDataSnap.exists()) {
  //     return { success: false, error: 'User data not found for adding credits.' };
  //   }
  //   const currentCredits = userDataSnap.data()?.credits || 0;
  //   const newBalance = currentCredits + amountToAdd;
  //   const transaction = createTransactionObject(amountToAdd, transactionType, reason, relatedFlow);
  //   await updateDoc(userRef, {
  //     credits: increment(amountToAdd),
  //     creditHistory: arrayUnion(transaction),
  //   });
  //   console.log(`Successfully added ${amountToAdd} credits to user ${uid}. New balance: ${newBalance}`);
  //   return { success: true, newBalance };
  // } catch (error: any) {
  //   console.error(`Error adding credits for user ${uid}:`, error);
  //   return { success: false, error: error.message || 'Failed to add credits due to a server error.' };
  // }
  return { success: true, newBalance: undefined }; // Simulate success
};

export const recordTransaction = async (
  uid: string,
  amount: number,
  type: CreditTransactionType,
  reason: string,
  relatedFlow?: string
): Promise<void> => {
  if (!uid) return;
  console.log(`[Credit System Disabled] Attempted to record transaction for ${uid}: ${amount}, ${type}, ${reason}`);
  // const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  // const transaction = createTransactionObject(amount, type, reason, relatedFlow);
  // try {
  //   await updateDoc(userRef, {
  //     creditHistory: arrayUnion(transaction),
  //   });
  // } catch (error) {
  //   console.error('Error recording transaction:', error);
  // }
};

export const resetFreeTierCredits = async (): Promise<void> => {
  console.log('[Credit System Disabled] resetFreeTierCredits called.');
};

export const provisionStarterPackMonthlyCredits = async (): Promise<void> => {
  console.log('[Credit System Disabled] provisionStarterPackMonthlyCredits called.');
};

export const awardReferralBonuses = async (referrerUid: string, newReferredUserUid: string, newReferredUserEmail?: string | null): Promise<void> => {
  console.log(`[Credit System Disabled] awardReferralBonuses called for referrer: ${referrerUid}, new user: ${newReferredUserUid}`);
};
*/

// --- Draft Functions ---
export const saveDraft = async (
  userId: string,
  draftData: Omit<Draft, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Draft | null> => {
  if (!userId) {
    console.error("User ID is required to save a draft.");
    return null;
  }
  try {
    const draftsCollectionRef = collection(db, 'users', userId, 'drafts');
    const newDraftData: Omit<Draft, 'id'> = {
      ...draftData,
      userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    const docRef = await addDoc(draftsCollectionRef, newDraftData);
    return { ...newDraftData, id: docRef.id };
  } catch (error) {
    console.error('Error saving draft:', error);
    return null;
  }
};

export const getDrafts = async (userId: string): Promise<Draft[]> => {
  if (!userId) {
    console.error("User ID is required to fetch drafts.");
    return [];
  }
  try {
    const draftsCollectionRef = collection(db, 'users', userId, 'drafts');
    const q = query(draftsCollectionRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Draft));
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
};

export const updateDraftContent = async (
  userId: string,
  draftId: string,
  newContent: string
): Promise<boolean> => {
  if (!userId || !draftId) {
    console.error("User ID and Draft ID are required to update a draft.");
    return false;
  }
  try {
    const draftRef = doc(db, 'users', userId, 'drafts', draftId);
    await updateDoc(draftRef, {
      content: newContent,
      updatedAt: serverTimestamp() as Timestamp,
    });
    return true;
  } catch (error) {
    console.error('Error updating draft:', error);
    return false;
  }
};

export const deleteDraft = async (userId: string, draftId: string): Promise<boolean> => {
  if (!userId || !draftId) {
    console.error("User ID and Draft ID are required to delete a draft.");
    return false;
  }
  try {
    const draftRef = doc(db, 'users', userId, 'drafts', draftId);
    await deleteDoc(draftRef);
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};

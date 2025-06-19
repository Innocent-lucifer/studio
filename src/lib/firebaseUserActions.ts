
import { app, auth } from '@/lib/firebase';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  getDocs,
  DocumentReference,
  deleteDoc,
  addDoc,
  orderBy,
} from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { ContentAngle } from '@/ai/flows/suggest-content-angles';


const db = getFirestore(app);

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp;
  referralCode?: string;
  referredBy?: string;
  referralsMade?: number;
  // Credit system fields
  plan: 'free' | 'starter' | 'infinity';
  credits: number;
  lastCreditReset?: Timestamp; // For future use with scheduled functions
  freeQuickPostUsed?: boolean;
  freeImageToPostUsed?: boolean;
  freeSmartCampaignAnglesUsed?: boolean;
  freeAiEditUsed?: boolean; // Plan specified "Edit with AI: 5 credits" without mentioning a free one. Assuming no free AI edit.
}

export interface Draft {
  id?: string;
  userId: string;
  platform: 'twitter' | 'linkedin' | 'visual';
  content: string;
  topic?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CampaignDraft {
  id?: string;
  userId: string;
  campaignTopic: string;
  researchedContext: string;
  selectedAngle: ContentAngle;
  twitterSeries?: string[];
  linkedinSeries?: string[];
  twitterRepurposingIdeas?: string[];
  linkedinRepurposingIdeas?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const CREDIT_COSTS = {
  QUICK_POST: 20,
  QUICK_POST_REGENERATE: 5,
  IMAGE_TO_POST: 60,
  SMART_CAMPAIGN_SUGGEST_ANGLE: 25, // This is per angle suggested. The flow will multiply by numAngles.
  AI_EDIT: 5,
  TREND_EXPLORER_FETCH: 0, // Free
};

export enum CreditTransactionType {
  FEATURE_USE_QUICK_POST = 'feature_use_quick_post',
  FEATURE_USE_QUICK_POST_REGENERATE = 'feature_use_quick_post_regenerate',
  FEATURE_USE_IMAGE_TO_POST = 'feature_use_image_to_post',
  FEATURE_USE_SMART_CAMPAIGN_SUGGEST_ANGLES = 'feature_use_smart_campaign_suggest_angles',
  FEATURE_USE_AI_EDIT = 'feature_use_ai_edit',
  INITIAL_CREDITS = 'initial_credits_free_plan',
  // More types can be added for plan purchases, admin adjustments, etc.
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
      createdAt: serverTimestamp() as Timestamp,
      referralCode: generateReferralCode(),
      referralsMade: 0,
      // Initialize credit system fields for new users
      plan: 'free',
      credits: 40, // Starting credits for free plan
      freeQuickPostUsed: false,
      freeImageToPostUsed: false,
      freeSmartCampaignAnglesUsed: false,
      // lastCreditReset: serverTimestamp() as Timestamp, // Set on actual reset by a backend process
    };

    if (referredByCode) {
        console.log(`User referred by code: ${referredByCode} - referral logic temporarily adjusted.`);
    }

    try {
      await setDoc(userRef, userData);
      // Log initial credit grant - for future auditing if needed
      // await logCreditTransaction(user.uid, CreditTransactionType.INITIAL_CREDITS, 40, "Initial free plan credits");
      console.log(`User document created for ${user.uid} with initial data and 40 free credits.`);
      return userData;
    } catch (error) {
      console.error('Error creating user document:', error);
      return null;
    }
  } else {
    // If user document exists, ensure credit fields are present, add if not (migration path)
    const existingData = userSnap.data();
    let needsUpdate = false;
    const updates: Partial<UserData> = {};
    if (existingData.plan === undefined) { updates.plan = 'free'; needsUpdate = true; }
    if (existingData.credits === undefined) { updates.credits = 40; needsUpdate = true; } // Or 0 if they should not get free ones retroactively
    if (existingData.freeQuickPostUsed === undefined) { updates.freeQuickPostUsed = false; needsUpdate = true; }
    if (existingData.freeImageToPostUsed === undefined) { updates.freeImageToPostUsed = false; needsUpdate = true; }
    if (existingData.freeSmartCampaignAnglesUsed === undefined) { updates.freeSmartCampaignAnglesUsed = false; needsUpdate = true; }

    if (needsUpdate) {
      try {
        await updateDoc(userRef, updates);
        console.log(`User document for ${user.uid} updated with default credit system fields.`);
        return { ...existingData, ...updates };
      } catch (error) {
        console.error('Error updating existing user document with credit fields:', error);
        return existingData; // Return existing data even if update fails
      }
    }
    return existingData;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      // Ensure required credit fields exist, providing defaults if not (simple migration for existing users)
      const data = userSnap.data();
      return {
        plan: 'free', // Default if not present
        credits: 0,   // Default if not present
        freeQuickPostUsed: false,
        freeImageToPostUsed: false,
        freeSmartCampaignAnglesUsed: false,
        ...data,     // Spread existing data, which will overwrite defaults if fields exist
      };
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

export const deductCredits = async (
  userId: string,
  featureKey: keyof typeof CREDIT_COSTS,
  isRegeneration: boolean = false, // Specific to Quick Post for now
  numUnits: number = 1 // For features like suggesting multiple angles
): Promise<{ success: boolean; error?: string; newCredits?: number; freePostUsedThisTime?: boolean }> => {
  if (!userId) return { success: false, error: "User ID not provided." };

  const userData = await getUserData(userId);
  if (!userData) return { success: false, error: "User data not found." };

  if (userData.plan === 'infinity') {
    return { success: true, newCredits: userData.credits, freePostUsedThisTime: false }; // Infinity plan has unlimited access
  }

  const userRef = doc(db, 'users', userId) as DocumentReference<UserData>;
  let cost = 0;
  let freePostUsedThisTime = false;
  const updates: Partial<UserData> = {};

  // Handle Free Post Bonus
  if (!isRegeneration) { // Free posts don't apply to regenerations
    if (featureKey === 'QUICK_POST' && !userData.freeQuickPostUsed) {
      updates.freeQuickPostUsed = true;
      freePostUsedThisTime = true;
    } else if (featureKey === 'IMAGE_TO_POST' && !userData.freeImageToPostUsed) {
      updates.freeImageToPostUsed = true;
      freePostUsedThisTime = true;
    } else if (featureKey === 'SMART_CAMPAIGN_SUGGEST_ANGLE' && !userData.freeSmartCampaignAnglesUsed) {
      updates.freeSmartCampaignAnglesUsed = true;
      freePostUsedThisTime = true;
    }
    // AI_EDIT does not have a free post as per the plan
  }

  if (freePostUsedThisTime) {
    // Free post was used, no credit cost
    try {
      await updateDoc(userRef, updates);
      // console.log(`User ${userId} used free post for ${featureKey}.`);
      return { success: true, newCredits: userData.credits, freePostUsedThisTime: true };
    } catch (error: any) {
      console.error(`Error updating free post status for ${userId}:`, error);
      return { success: false, error: "Error updating free post status." };
    }
  }

  // Calculate actual cost if not a free post
  if (featureKey === 'QUICK_POST' && isRegeneration) {
    cost = CREDIT_COSTS.QUICK_POST_REGENERATE;
  } else {
    cost = CREDIT_COSTS[featureKey] * numUnits;
  }
  
  if (cost === 0) { // For free features like Trend Explorer
     return { success: true, newCredits: userData.credits, freePostUsedThisTime: false };
  }

  if (userData.credits < cost) {
    return { success: false, error: "Insufficient credits." };
  }

  updates.credits = userData.credits - cost;

  try {
    await updateDoc(userRef, updates);
    // Log transaction (optional, for auditing)
    // await logCreditTransaction(userId, transactionTypeMap[featureKey], cost, `Used ${featureKey}`);
    // console.log(`User ${userId} deducted ${cost} credits for ${featureKey}. New balance: ${updates.credits}`);
    return { success: true, newCredits: updates.credits, freePostUsedThisTime: false };
  } catch (error: any) {
    console.error(`Error deducting credits for ${userId}:`, error);
    return { success: false, error: "Error deducting credits." };
  }
};


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

// --- Campaign Draft Functions ---
export const saveCampaignDraft = async (
  userId: string,
  campaignCoreData: {
    campaignTopic: string;
    researchedContext: string;
    selectedAngle: ContentAngle;
    twitterSeries?: string[];
    linkedinSeries?: string[];
    twitterRepurposingIdeas?: string[];
    linkedinRepurposingIdeas?: string[];
  }
): Promise<CampaignDraft | null> => {
  if (!userId) {
    console.error("User ID is required to save a campaign draft.");
    return null;
  }
  try {
    const campaignDraftsCollectionRef = collection(db, 'users', userId, 'campaignDrafts');
    const newCampaignDraftData: Omit<CampaignDraft, 'id'> = {
      ...campaignCoreData,
      userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    const docRef = await addDoc(campaignDraftsCollectionRef, newCampaignDraftData);
    return { ...newCampaignDraftData, id: docRef.id };
  } catch (error) {
    console.error('Error saving campaign draft:', error);
    return null;
  }
};

export const getCampaignDrafts = async (userId: string): Promise<CampaignDraft[]> => {
  if (!userId) {
    console.error("User ID is required to fetch campaign drafts.");
    return [];
  }
  try {
    const campaignDraftsCollectionRef = collection(db, 'users', userId, 'campaignDrafts');
    const q = query(campaignDraftsCollectionRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CampaignDraft));
  } catch (error) {
    console.error('Error fetching campaign drafts:', error);
    return [];
  }
};

export const getCampaignDraftById = async (userId: string, campaignDraftId: string): Promise<CampaignDraft | null> => {
  if (!userId || !campaignDraftId) {
    console.error("User ID and Campaign Draft ID are required.");
    return null;
  }
  try {
    const campaignDraftRef = doc(db, 'users', userId, 'campaignDrafts', campaignDraftId) as DocumentReference<CampaignDraft>;
    const docSnap = await getDoc(campaignDraftRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching campaign draft by ID:', error);
    return null;
  }
};

export const deleteCampaignDraft = async (userId: string, campaignDraftId: string): Promise<boolean> => {
  if (!userId || !campaignDraftId) {
    console.error("User ID and Campaign Draft ID are required to delete.");
    return false;
  }
  try {
    const campaignDraftRef = doc(db, 'users', userId, 'campaignDrafts', campaignDraftId);
    await deleteDoc(campaignDraftRef);
    return true;
  } catch (error) {
    console.error('Error deleting campaign draft:', error);
    return false;
  }
};

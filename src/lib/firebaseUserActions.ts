
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
  freeAiEditUsed?: boolean;
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
  SMART_CAMPAIGN_SUGGEST_ANGLE: 25, // This was SMART_CAMPAIGN_ANGLES
  AI_EDIT: 5,
  TREND_EXPLORER_FETCH: 0,
};

export enum CreditTransactionType {
  FEATURE_USE_QUICK_POST = 'feature_use_quick_post',
  FEATURE_USE_QUICK_POST_REGENERATE = 'feature_use_quick_post_regenerate',
  FEATURE_USE_IMAGE_TO_POST = 'feature_use_image_to_post',
  FEATURE_USE_SMART_CAMPAIGN_SUGGEST_ANGLES = 'feature_use_smart_campaign_suggest_angles',
  FEATURE_USE_AI_EDIT = 'feature_use_ai_edit',
  INITIAL_CREDITS = 'initial_credits_free_plan',
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
  
  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'SageUser',
        createdAt: serverTimestamp() as Timestamp,
        referralCode: generateReferralCode(),
        referralsMade: 0,
        plan: 'free',
        credits: 1000, 
        freeQuickPostUsed: false,
        freeImageToPostUsed: false,
        freeSmartCampaignAnglesUsed: false,
        freeAiEditUsed: false,
      };

      if (referredByCode) {
          console.log(`User referred by code: ${referredByCode} - referral logic temporarily adjusted.`);
      }

      await setDoc(userRef, userData);
      console.log(`User document created for ${user.uid} with initial data and 1000 free credits.`);
      return userData;
    } else {
      console.log(`User document for ${user.uid} already existed when createUserDocument was called. Ensuring fields are up-to-date.`);
      const existingData = userSnap.data() as UserData; // Cast to ensure type safety
      let needsUpdate = false;
      const updates: Partial<UserData> = {};
      
      // Initialize missing fields with defaults from the free plan
      if (existingData.plan === undefined) { updates.plan = 'free'; needsUpdate = true; }
      if (existingData.credits === undefined) { updates.credits = 1000; needsUpdate = true; }
      if (existingData.freeQuickPostUsed === undefined) { updates.freeQuickPostUsed = false; needsUpdate = true; }
      if (existingData.freeImageToPostUsed === undefined) { updates.freeImageToPostUsed = false; needsUpdate = true; }
      if (existingData.freeSmartCampaignAnglesUsed === undefined) { updates.freeSmartCampaignAnglesUsed = false; needsUpdate = true; }
      if (existingData.freeAiEditUsed === undefined) { updates.freeAiEditUsed = false; needsUpdate = true; }


      if (needsUpdate) {
        await updateDoc(userRef, updates);
        console.log(`User document for ${user.uid} updated with default credit system fields during createUserDocument call.`);
        return { ...existingData, ...updates };
      }
      return existingData;
    }
  } catch (error) {
    console.error('Detailed error from createUserDocument (setDoc/updateDoc failed):', error);
    throw error; 
  }
};

export const getUserData = async (uid: string, userForCreation?: FirebaseAuthUser): Promise<UserData | null> => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const migratedData: UserData = {
        plan: 'free', 
        credits: 1000, 
        freeQuickPostUsed: false,
        freeImageToPostUsed: false,
        freeSmartCampaignAnglesUsed: false,
        freeAiEditUsed: false,
        ...data, 
      };
      if (migratedData.plan === undefined) migratedData.plan = 'free';
      if (migratedData.credits === undefined) migratedData.credits = 1000;
      if (migratedData.freeQuickPostUsed === undefined) migratedData.freeQuickPostUsed = false;
      if (migratedData.freeImageToPostUsed === undefined) migratedData.freeImageToPostUsed = false;
      if (migratedData.freeSmartCampaignAnglesUsed === undefined) migratedData.freeSmartCampaignAnglesUsed = false;
      if (migratedData.freeAiEditUsed === undefined) migratedData.freeAiEditUsed = false;
      
      return migratedData;
    } else {
      if (userForCreation && userForCreation.uid === uid) {
        console.warn(`No user data found for UID: ${uid}. Attempting to create using provided user object.`);
        return await createUserDocument(userForCreation); 
      } else {
        console.warn(`No user data found for UID: ${uid}. No user object provided for creation or UID mismatch.`);
        return null;
      }
    }
  } catch (error: any) {
    console.error('Detailed error from getUserData:', error);
    if (error.code === 'unavailable' || (typeof error.message === 'string' && error.message.toLowerCase().includes('offline'))) {
      throw new Error("Could not connect to the database. Please check your internet connection and try again.");
    }
    throw error; 
  }
};


export const deductCredits = async (
  userId: string,
  featureKey: keyof typeof CREDIT_COSTS,
  isRegeneration: boolean = false,
  numUnits: number = 1
): Promise<{ success: boolean; error?: string; newCredits?: number; freePostUsedThisTime?: boolean }> => {
  if (!userId) return { success: false, error: "User ID not provided." };

  let userData;
  try {
    userData = await getUserData(userId);
  } catch (error: any) {
    return { success: false, error: `Failed to retrieve user data for credit deduction: ${error.message}` };
  }

  if (!userData) return { success: false, error: "User data not found for credit deduction." };


  if (userData.plan === 'infinity') {
    return { success: true, newCredits: userData.credits, freePostUsedThisTime: false };
  }

  const userRef = doc(db, 'users', userId) as DocumentReference<UserData>;
  let cost = 0;
  let freePostUsedThisTime = false;
  const updates: Partial<UserData> = {};

  if (!isRegeneration) {
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
  }


  if (freePostUsedThisTime) {
    try {
      await updateDoc(userRef, updates); 
      return { success: true, newCredits: userData.credits, freePostUsedThisTime: true };
    } catch (error: any) {
      console.error(`Error updating free post status for ${userId}:`, error);
      return { success: false, error: "Error updating free post status." };
    }
  }

  if (featureKey === 'QUICK_POST' && isRegeneration) {
    cost = CREDIT_COSTS.QUICK_POST_REGENERATE;
  } else {
    cost = CREDIT_COSTS[featureKey] * numUnits;
  }
  
  if (cost === 0) {
     return { success: true, newCredits: userData.credits, freePostUsedThisTime: false };
  }

  if (userData.credits < cost) {
    return { success: false, error: "Insufficient credits." };
  }

  updates.credits = userData.credits - cost; 

  try {
    await updateDoc(userRef, updates); 
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
  campaignData: Omit<CampaignDraft, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<CampaignDraft | null> => {
  if (!userId) {
    console.error("User ID is required to save a campaign draft.");
    return null;
  }
  try {
    const campaignDraftsCollectionRef = collection(db, 'users', userId, 'campaignDrafts');
    const newCampaignDraftData: Omit<CampaignDraft, 'id'> = {
      userId,
      campaignTopic: campaignData.campaignTopic,
      researchedContext: campaignData.researchedContext,
      selectedAngle: campaignData.selectedAngle,
      twitterSeries: campaignData.twitterSeries || undefined,
      linkedinSeries: campaignData.linkedinSeries || undefined,
      twitterRepurposingIdeas: campaignData.twitterRepurposingIdeas || undefined,
      linkedinRepurposingIdeas: campaignData.linkedinRepurposingIdeas || undefined,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    const docRef = await addDoc(campaignDraftsCollectionRef, newCampaignDraftData);
    // Construct the full CampaignDraft object to return, including the generated ID and timestamps
    const savedData: CampaignDraft = {
      id: docRef.id,
      userId: newCampaignDraftData.userId,
      campaignTopic: newCampaignDraftData.campaignTopic,
      researchedContext: newCampaignDraftData.researchedContext,
      selectedAngle: newCampaignDraftData.selectedAngle,
      twitterSeries: newCampaignDraftData.twitterSeries,
      linkedinSeries: newCampaignDraftData.linkedinSeries,
      twitterRepurposingIdeas: newCampaignDraftData.twitterRepurposingIdeas,
      linkedinRepurposingIdeas: newCampaignDraftData.linkedinRepurposingIdeas,
      // Note: serverTimestamp() returns a sentinel. Actual Timestamps are resolved by Firestore.
      // For the return object, we might want to fetch the doc again if exact server timestamps are needed immediately,
      // or accept that these are client-side sentinels if used right away.
      // For simplicity here, we'll return with the sentinels or undefined if not set.
      createdAt: newCampaignDraftData.createdAt, // This will be a sentinel object
      updatedAt: newCampaignDraftData.updatedAt, // This will be a sentinel object
    };
    return savedData;
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


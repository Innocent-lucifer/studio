
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
  freeSmartCampaignResearchTopicUsed?: boolean;
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
  IMAGE_TO_POST_REGENERATE: 5,
  SMART_CAMPAIGN_RESEARCH_TOPIC: 30,
  SMART_CAMPAIGN_ADDITIONAL_ANGLE: 10,
  AI_EDIT: 5,
  TREND_EXPLORER_FETCH: 0,
};

export const FEATURE_DESCRIPTIONS: Record<keyof typeof CREDIT_COSTS, string> = {
  QUICK_POST: "Quick Post research & generation",
  QUICK_POST_REGENERATE: "Quick Post regeneration",
  IMAGE_TO_POST: "Image to Post generation",
  IMAGE_TO_POST_REGENERATE: "Image to Post regeneration (e.g., tone change)",
  SMART_CAMPAIGN_RESEARCH_TOPIC: "Smart Campaign topic research",
  SMART_CAMPAIGN_ADDITIONAL_ANGLE: "Smart Campaign (new angle post generation)",
  AI_EDIT: "AI-powered post editing",
  TREND_EXPLORER_FETCH: "exploring trends",
};


export enum CreditTransactionType {
  FEATURE_USE_QUICK_POST = 'feature_use_quick_post',
  FEATURE_USE_QUICK_POST_REGENERATE = 'feature_use_quick_post_regenerate',
  FEATURE_USE_IMAGE_TO_POST = 'feature_use_image_to_post',
  FEATURE_USE_IMAGE_TO_POST_REGENERATE = 'feature_use_image_to_post_regenerate',
  FEATURE_USE_SMART_CAMPAIGN_RESEARCH_TOPIC = 'feature_use_smart_campaign_research_topic',
  FEATURE_USE_SMART_CAMPAIGN_ADDITIONAL_ANGLE = 'feature_use_smart_campaign_additional_angle',
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

  // Default plan and credits for any new user
  const defaultPlan: UserData['plan'] = 'free';
  const defaultCredits = 40;

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
        plan: defaultPlan,
        credits: defaultCredits,
        freeQuickPostUsed: false,
        freeImageToPostUsed: false,
        freeSmartCampaignAnglesUsed: false,
        freeSmartCampaignResearchTopicUsed: false,
      };

      if (referredByCode) {
          console.log(`User referred by code: ${referredByCode} - referral logic temporarily adjusted.`);
      }

      await setDoc(userRef, userData);
      console.log(`User document created for ${user.uid} with plan: ${userData.plan} and credits: ${userData.credits}.`);
      return userData;
    } else {
      console.log(`User document for ${user.uid} already existed. Ensuring fields are up-to-date.`);
      const existingData = userSnap.data() as UserData;
      let needsUpdate = false;
      const updates: Partial<UserData> = {};

      if (existingData.plan === undefined) {
        updates.plan = defaultPlan; // Ensure it defaults to 'free'
        needsUpdate = true;
      }
      if (existingData.credits === undefined) {
        // Use the plan that will be set (either existing or the new default)
        const planForCreditCalc = updates.plan || existingData.plan || defaultPlan;
        updates.credits = planForCreditCalc === 'free' ? 40 :
                          planForCreditCalc === 'starter' ? 700 : // Assuming starter if not free and not infinity
                          planForCreditCalc === 'infinity' ? 999999 : 40; // Fallback to free credits
        needsUpdate = true;
      }

      if (existingData.freeQuickPostUsed === undefined) { updates.freeQuickPostUsed = false; needsUpdate = true; }
      if (existingData.freeImageToPostUsed === undefined) { updates.freeImageToPostUsed = false; needsUpdate = true; }
      if (existingData.freeSmartCampaignAnglesUsed === undefined) { updates.freeSmartCampaignAnglesUsed = false; needsUpdate = true; }
      if (existingData.freeSmartCampaignResearchTopicUsed === undefined) { updates.freeSmartCampaignResearchTopicUsed = false; needsUpdate = true; }


      if (needsUpdate) {
        await updateDoc(userRef, updates);
        console.log(`User document for ${user.uid} updated with new/default fields during ensureUserDocument.`);
        return { ...existingData, ...updates };
      }
      return existingData;
    }
  } catch (error) {
    console.error('Original Firestore error in createUserDocument:', error);
    throw error;
  }
};

export const getUserData = async (uid: string, userForCreation?: FirebaseAuthUser): Promise<UserData | null> => {
  console.log(`[getUserData] Attempting to fetch data for UID: '${uid}'. Is userForCreation present: ${!!userForCreation}`);
  if (!uid) {
     console.error("[getUserData] UID is null or undefined. Cannot fetch user data.");
     return null;
  }
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      // console.log(`[getUserData] Document found for UID: '${uid}'. Data:`, JSON.stringify(data).substring(0, 200) + "...");

      const planToUse = data.plan || 'free';
      const creditsToUse = data.credits ?? (planToUse === 'free' ? 40 : (planToUse === 'starter' ? 700 : (planToUse === 'infinity' ? 999999 : 40)));

      const migratedData: UserData = {
        ...data, // Spread existing data first
        plan: planToUse,
        credits: creditsToUse,
        freeQuickPostUsed: data.freeQuickPostUsed ?? false,
        freeImageToPostUsed: data.freeImageToPostUsed ?? false,
        freeSmartCampaignAnglesUsed: data.freeSmartCampaignAnglesUsed ?? false,
        freeSmartCampaignResearchTopicUsed: data.freeSmartCampaignResearchTopicUsed ?? false,
      };

      // Further safety checks for undefined fields even after spread
      if (migratedData.plan === undefined) migratedData.plan = 'free';
      if (migratedData.credits === undefined) migratedData.credits = (migratedData.plan === 'free' ? 40 : 700); // Default to starter if plan isn't free and credits missing
      if (migratedData.freeQuickPostUsed === undefined) migratedData.freeQuickPostUsed = false;
      if (migratedData.freeImageToPostUsed === undefined) migratedData.freeImageToPostUsed = false;
      if (migratedData.freeSmartCampaignAnglesUsed === undefined) migratedData.freeSmartCampaignAnglesUsed = false;
      if (migratedData.freeSmartCampaignResearchTopicUsed === undefined) migratedData.freeSmartCampaignResearchTopicUsed = false;

      return migratedData;
    } else {
      // console.warn(`[getUserData] No user data found for UID: '${uid}'. Attempting creation if userForCreation object is provided.`);
      if (userForCreation && userForCreation.uid === uid) {
        return await createUserDocument(userForCreation);
      } else if (userForCreation && userForCreation.uid !== uid) {
        console.error(`[getUserData] UID mismatch: function called with '${uid}', but userForCreation has UID '${userForCreation.uid}'.`);
        return null;
      } else {
        // console.warn(`[getUserData] No user object provided for creation for UID: '${uid}'. Returning null.`);
        return null;
      }
    }
  } catch (error: any) {
    console.error(`[getUserData] >>> CRITICAL Firestore Error for UID ${uid} <<< :`, error);
    // console.error(`[getUserData] Full error object for Firestore exception:`, JSON.stringify(error));
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
): Promise<{ success: boolean; error?: string; newCredits?: number; freePostUsedThisTime?: boolean; creditsSpent?: number }> => {
  // console.log(`[deductCredits] Attempting for user: ${userId}, feature: ${featureKey}, isRegen (context): ${isRegeneration}, units: ${numUnits}`);
  if (!userId) return { success: false, error: "User ID not provided." };

  let userData;
  try {
    userData = await getUserData(userId);
  } catch (error: any) {
    console.error(`[deductCredits] Failed to retrieve user data for UID ${userId}:`, error);
    return { success: false, error: `Failed to retrieve user data for credit deduction: ${error.message}` };
  }

  if (!userData) {
    console.error(`[deductCredits] User data not found for UID ${userId}.`);
    return { success: false, error: "User data not found for credit deduction." };
  }


  if (userData.plan === 'infinity') {
    // console.log(`[deductCredits] User ${userId} is on infinity plan. No credits deducted for ${featureKey}.`);
    return { success: true, newCredits: userData.credits, freePostUsedThisTime: false, creditsSpent: 0 };
  }

  const userRef = doc(db, 'users', userId) as DocumentReference<UserData>;
  let cost = 0;
  let freePostUsedThisTime = false;
  const updates: Partial<UserData> = {};


  if (featureKey === 'QUICK_POST' && !isRegeneration && !userData.freeQuickPostUsed) {
    updates.freeQuickPostUsed = true;
    freePostUsedThisTime = true;
    // console.log(`[deductCredits] Using free Quick Post for user ${userId}.`);
  } else if (featureKey === 'IMAGE_TO_POST' && !userData.freeImageToPostUsed) {
    updates.freeImageToPostUsed = true;
    freePostUsedThisTime = true;
    // console.log(`[deductCredits] Using free Image to Post (initial) for user ${userId}.`);
  } else if (featureKey === 'SMART_CAMPAIGN_RESEARCH_TOPIC' && !userData.freeSmartCampaignResearchTopicUsed) {
    updates.freeSmartCampaignResearchTopicUsed = true;
    freePostUsedThisTime = true;
    // console.log(`[deductCredits] Using free Smart Campaign Research for user ${userId}.`);
  }


  if (freePostUsedThisTime) {
    try {
      await updateDoc(userRef, updates);
      // console.log(`[deductCredits] Successfully updated free use flag for user ${userId}. Feature: ${featureKey}`);
      return { success: true, newCredits: userData.credits, freePostUsedThisTime: true, creditsSpent: 0 };
    } catch (error: any)      {
      console.error(`[deductCredits] Error updating free post status for user ${userId}:`, error);
      return { success: false, error: "Error updating free post status. Please try again." };
    }
  }

  if (featureKey === 'QUICK_POST' && isRegeneration) {
    cost = CREDIT_COSTS.QUICK_POST_REGENERATE * numUnits;
  } else {
    cost = CREDIT_COSTS[featureKey] * numUnits;
  }

  // console.log(`[deductCredits] Calculated cost for user ${userId}, feature ${featureKey}: ${cost}`);

  if (cost === 0 && featureKey !== 'TREND_EXPLORER_FETCH') {
    //  console.warn(`[deductCredits] Warning: Cost for feature ${featureKey} is 0. This might be unintentional unless it's a free feature like Trend Explorer.`);
  }

  if (featureKey === 'TREND_EXPLORER_FETCH') {
    // console.log(`[deductCredits] Feature ${featureKey} is free for user ${userId}. No credits deducted.`);
    return { success: true, newCredits: userData.credits, freePostUsedThisTime: false, creditsSpent: 0 };
  }


  if (userData.credits < cost) {
    // console.log(`[deductCredits] User ${userId} has insufficient credits. Has: ${userData.credits}, Needs: ${cost}`);
    return { success: false, error: `Insufficient credits. You need ${cost} credits, but have ${userData.credits}.` };
  }

  updates.credits = userData.credits - cost;

  try {
    await updateDoc(userRef, updates);
    // console.log(`[deductCredits] Successfully deducted ${cost} credits from user ${userId}. New balance: ${updates.credits}`);
    return { success: true, newCredits: updates.credits, freePostUsedThisTime: false, creditsSpent: cost };
  } catch (error: any) {
    console.error(`[deductCredits] Error deducting credits for user ${userId}:`, error);
    return { success: false, error: "Error deducting credits. Please try again." };
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
      createdAt: newCampaignDraftData.createdAt,
      updatedAt: newCampaignDraftData.updatedAt,
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


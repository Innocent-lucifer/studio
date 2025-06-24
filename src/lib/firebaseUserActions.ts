
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
          // Future referral logic can be implemented here
      }

      await setDoc(userRef, userData);
      return userData;
    } else {
      const existingData = userSnap.data() as UserData;
      const updates: Partial<UserData> = {};
      let needsUpdate = false;

      if (existingData.plan === undefined) {
        updates.plan = defaultPlan;
        needsUpdate = true;
      }
      if (existingData.credits === undefined) {
        const planForCreditCalc = updates.plan || existingData.plan || defaultPlan;
        updates.credits = planForCreditCalc === 'free' ? 40 : 999999;
        needsUpdate = true;
      }
      
      // Add other field checks as necessary
      if (needsUpdate) {
        await updateDoc(userRef, updates);
        return { ...existingData, ...updates };
      }
      
      return existingData;
    }
  } catch (error) {
    console.error('Error in createUserDocument:', error);
    throw error;
  }
};

export const getUserData = async (uid: string, userForCreation?: FirebaseAuthUser): Promise<UserData | null> => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      if (userForCreation && userForCreation.uid === uid) {
        return await createUserDocument(userForCreation);
      }
      return null;
    }
  } catch (error: any) {
    console.error(`[getUserData] Firestore Error for UID ${uid}:`, error);
     if (error.code === 'unavailable' || (typeof error.message === 'string' && error.message.toLowerCase().includes('offline'))) {
      throw new Error("Could not connect to the database. Please check your internet connection.");
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
  // Credits system is temporarily disabled for the beta. All actions are permitted.
  return { success: true, newCredits: 9999, freePostUsedThisTime: false, creditsSpent: 0 };
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
  if (!userId) return [];
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
  if (!userId || !draftId) return false;
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
  if (!userId || !draftId) return false;
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
  if (!userId) return null;
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
      ...newCampaignDraftData,
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
  if (!userId) return [];
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
  if (!userId || !campaignDraftId) return null;
  try {
    const campaignDraftRef = doc(db, 'users', userId, 'campaignDrafts', campaignDraftId) as DocumentReference<CampaignDraft>;
    const docSnap = await getDoc(campaignDraftRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error fetching campaign draft by ID:', error);
    return null;
  }
};

export const deleteCampaignDraft = async (userId: string, campaignDraftId: string): Promise<boolean> => {
  if (!userId || !campaignDraftId) return false;
  try {
    const campaignDraftRef = doc(db, 'users', userId, 'campaignDrafts', campaignDraftId);
    await deleteDoc(campaignDraftRef);
    return true;
  } catch (error) {
    console.error('Error deleting campaign draft:', error);
    return false;
  }
};

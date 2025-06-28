
import { app, isFirebaseConfigured } from '@/lib/firebase';
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
  where,
  type Firestore,
} from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { ContentAngle } from '@/ai/flows/suggest-content-angles';
import type { RepurposingIdea } from '@/ai/flows/suggest-repurposing-ideas';


let db: Firestore | null = null;
if (isFirebaseConfigured && app) {
    try {
        db = getFirestore(app);
    } catch (e) {
        console.error("Firestore initialization error:", e);
    }
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  referralCode?: string;
  referredBy?: string;
  referralsMade?: number;
  plan: 'free' | 'monthly' | 'yearly';
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
  twitterRepurposingIdeas?: RepurposingIdea[];
  linkedinRepurposingIdeas?: RepurposingIdea[];
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
  referredByCode?: string
): Promise<UserData | null> => {
  if (!db) {
    console.warn("Firestore is not configured. Skipping createUserDocument.");
    return null;
  }
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid) as DocumentReference<UserData>;

  const defaultPlan: UserData['plan'] = 'free';

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'SageUser',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        referralCode: generateReferralCode(),
        referralsMade: 0,
        plan: defaultPlan,
      };

      if (referredByCode) {
          // Future referral logic can be implemented here
      }

      await setDoc(userRef, userData);
      return userData;
    } else {
      const existingData = userSnap.data() as UserData;
      // This is a crucial check for backward compatibility.
      // If an old user logs in who doesn't have a `plan` field, set it to 'free'.
      if (!existingData.plan) {
        const updates: Partial<UserData> = {
          plan: 'free',
          updatedAt: serverTimestamp() as Timestamp
        };
        await updateDoc(userRef, updates);
        return { ...existingData, ...updates } as UserData;
      }
      return existingData;
    }
  } catch (error) {
    console.error('Error in createUserDocument:', error);
    throw error;
  }
};


export const getUserData = async (uid: string, userForCreation?: FirebaseAuthUser): Promise<UserData | null> => {
  if (!db) {
    console.warn("Firestore is not configured. Skipping getUserData.");
    return null;
  }
  if (!uid) return null;
  const userRef = doc(db, 'users', uid) as DocumentReference<UserData>;
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
       const existingData = userSnap.data();
       // Backward compatibility: if a user exists but has no plan, set them to free
       if (!existingData.plan) {
         await updateDoc(userRef, { plan: 'free', updatedAt: serverTimestamp() });
         return { ...existingData, plan: 'free' } as UserData;
       }
      return existingData;
    } else {
      // If the user doesn't exist, create them with a default 'free' plan.
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


// This function is no longer needed as the admin SDK handles it, but we keep it for reference.
export const updateUserPlanByEmail = async (email: string, newPlan: 'monthly' | 'yearly'): Promise<boolean> => {
  if (!db) {
    console.error("Firestore is not configured. Cannot update user plan.");
    return false;
  }
  if (!email) {
    console.error("Email is required to update a user's plan.");
    return false;
  }
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No user found with email: ${email}`);
      return false;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);

    await updateDoc(userRef, {
      plan: newPlan,
      updatedAt: serverTimestamp() as Timestamp,
    });
    console.log(`Successfully updated plan for ${email} to ${newPlan}`);
    return true;
  } catch (error) {
    console.error(`Error updating plan for user with email ${email}:`, error);
    return false;
  }
};


// --- Draft Functions ---
export const saveDraft = async (
  userId: string,
  draftData: Omit<Draft, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Draft | null> => {
  if (!db) {
    console.warn("Firestore is not configured. Skipping saveDraft.");
    return null;
  }
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
  if (!db) {
    console.warn("Firestore is not configured. Skipping getDrafts.");
    return [];
  }
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
  if (!db) {
    console.warn("Firestore is not configured. Skipping updateDraftContent.");
    return false;
  }
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
  if (!db) {
    console.warn("Firestore is not configured. Skipping deleteDraft.");
    return false;
  }
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
  campaignData: Omit<CampaignDraft, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  existingCampaignId?: string | null
): Promise<{ id: string } | null> => {
  if (!db) {
    console.warn("Firestore is not configured. Skipping saveCampaignDraft.");
    return null;
  }
  if (!userId) return null;

  const dataPayload = {
    userId,
    campaignTopic: campaignData.campaignTopic,
    researchedContext: campaignData.researchedContext,
    selectedAngle: campaignData.selectedAngle,
    twitterSeries: campaignData.twitterSeries || [],
    linkedinSeries: campaignData.linkedinSeries || [],
    twitterRepurposingIdeas: campaignData.twitterRepurposingIdeas || [],
    linkedinRepurposingIdeas: campaignData.linkedinRepurposingIdeas || [],
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingCampaignId) {
      const draftRef = doc(db, 'users', userId, 'campaignDrafts', existingCampaignId);
      await updateDoc(draftRef, dataPayload);
      return { id: existingCampaignId };
    } else {
      const createPayload = { ...dataPayload, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, 'users', userId, 'campaignDrafts'), createPayload);
      return { id: docRef.id };
    }
  } catch (error) {
    console.error('Error saving/updating campaign draft:', error);
    return null;
  }
};


export const getCampaignDrafts = async (userId: string): Promise<CampaignDraft[]> => {
  if (!db) {
    console.warn("Firestore is not configured. Skipping getCampaignDrafts.");
    return [];
  }
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
  if (!db) {
    console.warn("Firestore is not configured. Skipping getCampaignDraftById.");
    return null;
  }
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
  if (!db) {
    console.warn("Firestore is not configured. Skipping deleteCampaignDraft.");
    return false;
  }
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

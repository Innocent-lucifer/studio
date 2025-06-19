
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
    };

    if (referredByCode) {
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

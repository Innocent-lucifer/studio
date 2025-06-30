
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  AuthError,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, app, isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { getUserData, createUserDocument, type UserData } from '@/lib/firebaseUserActions';
import { getFirestore, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<User | null>;
  logIn: (email: string, pass: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  logOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: AuthError | null }>;
  sendEmailSignInLink: (email: string) => Promise<{ success: boolean; error?: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !app) {
        setLoading(false);
        return;
    }

    let unsubscribeFromFirestore: Unsubscribe | null = null;

    const unsubscribeFromAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Unsubscribe from previous user's data listener
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
        unsubscribeFromFirestore = null;
      }
      
      setUser(currentUser);

      if (currentUser) {
        setLoading(true);
        // Set up a real-time listener for the new user's data
        const db = getFirestore(app);
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeFromFirestore = onSnapshot(userDocRef, 
          async (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data() as UserData);
            } else {
              // If the doc doesn't exist, it means this is a new sign-up
              // or a login for a user whose doc hasn't been created yet.
              const createdUserData = await createUserDocument(currentUser);
              setUserData(createdUserData);
            }
            setLoading(false);
          }, 
          (error) => {
            console.error("AuthContext: Firestore listener error:", error);
            toast({
              title: "Session Error",
              description: "Could not sync your account data. Please refresh.",
              variant: "destructive",
              iconType: "alertTriangle"
            });
            setUserData(null);
            setLoading(false);
          }
        );
      } else {
        // User is signed out
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
      }
    };
  }, [toast]);

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    if (!auth) throw new Error("Firebase is not configured.");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // The onAuthStateChanged listener will handle creating the user document
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      throw authError;
    } finally {
      // setLoading will be handled by the listener
    }
  };

  const logIn = async (email: string, pass: string): Promise<User | null> => {
    if (!auth) throw new Error("Firebase is not configured.");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // The onAuthStateChanged listener will handle fetching data
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      throw authError;
    } finally {
      // setLoading will be handled by the listener
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    if (!auth) throw new Error("Firebase is not configured.");
    setLoading(true);
    const googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, googleProviderInstance);
      // The onAuthStateChanged listener will handle data
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      throw authError;
    } finally {
      // setLoading will be handled by the listener
    }
  };

  const logOut = async () => {
    if (!auth) throw new Error("Firebase is not configured.");
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged handles setting user and userData to null
      toast({ title: "Logged Out", description: "You have been successfully logged out.", iconType: "checkCircle" });
    } catch (error) {
      const authError = error as AuthError;
      toast({ variant: "destructive", title: "Log Out Failed", description: authError.message, iconType: "alertTriangle" });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    if (!auth) throw new Error("Firebase is not configured.");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };
  
  const sendEmailSignInLink = async (email: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    if (!auth) throw new Error("Firebase is not configured.");
    
    const actionCodeSettings = {
      url: `${window.location.origin}/finishSignUp`,
      handleCodeInApp: true,
    };

    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signUp, logIn, signInWithGoogle, logOut, sendPasswordReset, sendEmailSignInLink }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

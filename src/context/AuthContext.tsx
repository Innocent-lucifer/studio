
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
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { getUserData, createUserDocument, type UserData } from '@/lib/firebaseUserActions';
import { doc, getDoc, getFirestore, DocumentReference } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<User | null>;
  logIn: (email: string, pass: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  logOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const ensureUserDocument = async (firebaseUser: User | null): Promise<void> => {
    if (!firebaseUser) return;
    try {
      // Pass the fresh firebaseUser object to getUserData
      const userData = await getUserData(firebaseUser.uid, firebaseUser);
      if (!userData) {
        // This case should ideally be rare if getUserData's creation logic works and throws on failure.
        // Log an error or show a toast if the document still couldn't be confirmed.
        console.error(`AuthContext: Firestore document for user ${firebaseUser.uid} could NOT be verified or created after login/signup.`);
        // toast({
        //   variant: "destructive",
        //   title: "Account Sync Issue",
        //   description: "Could not fully sync your account. Some features might be limited. Please try refreshing.",
        // });
      }
    } catch (error: any) {
      // This will catch errors thrown from getUserData/createUserDocument
      console.error(`AuthContext: Error during ensureUserDocument for ${firebaseUser.uid} (likely from Firestore operation): `, error.message, error);
      // Potentially show a user-facing toast here for critical setup errors
      // For example, if error.message is "Could not connect...", it will be logged here.
      // Not re-throwing here to allow onAuthStateChanged to complete loading state,
      // as the primary error is logged above. Subsequent operations will handle the lack of userData.
      // throw error; // Removed re-throw
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          await ensureUserDocument(currentUser);
        }
      } catch (error) {
        // This catch block will now only be triggered by errors directly within this try block,
        // not by errors re-thrown from ensureUserDocument for the connectivity issue.
        console.error("AuthContext: Critical error during user session initialization:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await ensureUserDocument(userCredential.user);
      }
      return userCredential.user;
    } catch (error) {
      console.error("Sign up error:", error);
      const authError = error as AuthError;
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await ensureUserDocument(userCredential.user);
      }
      return userCredential.user;
    } catch (error) {
      console.error("Log in error:", error);
      const authError = error as AuthError;
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    const googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, googleProviderInstance);
      if (result.user) {
        await ensureUserDocument(result.user);
      }
      return result.user;
    } catch (error) {
      console.error("Google sign in error object:", error);
      const authError = error as AuthError;
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Log out error:", error);
      const authError = error as AuthError;
      toast({ variant: "destructive", title: "Log Out Failed", description: authError.message });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      const authError = error as AuthError;
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, signInWithGoogle, logOut, sendPasswordReset }}>
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

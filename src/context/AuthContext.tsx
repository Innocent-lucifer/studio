
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
        console.error(`AuthContext: Firestore document for user ${firebaseUser.uid} could NOT be verified or created after login/signup.`);
        // toast({
        //   variant: "destructive",
        //   title: "Account Sync Issue",
        //   description: "Could not fully sync your account. Some features might be limited. Please try refreshing.",
        //   iconType: "alertTriangle"
        // });
      }
    } catch (error: any) {
      console.error(`AuthContext: Error during ensureUserDocument for ${firebaseUser.uid} (likely from Firestore operation): `, error.message, error);
      // toast({
      //   variant: "destructive",
      //   title: "Database Connection Issue",
      //   description: "Could not connect to the database. Some account features might be unavailable. Please check your internet connection or try again later.",
      //   iconType: "alertTriangle"
      // });
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
        console.error("AuthContext: Critical error during user session initialization:", error);
        // toast({
        //   title: "Session Error",
        //   description: "There was an issue initializing your session. Please refresh the page.",
        //   variant: "destructive",
        //   iconType: "alertTriangle"
        // });
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
      // Toast for successful sign up is now handled in LoginSignUpForm
      return userCredential.user;
    } catch (error) {
      console.error("Sign up error:", error);
      const authError = error as AuthError;
      throw authError; // Re-throw for LoginSignUpForm to handle specific toast
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
      // Toast for successful sign in is now handled in LoginSignUpForm
      return userCredential.user;
    } catch (error) {
      console.error("Log in error:", error);
      const authError = error as AuthError;
      throw authError; // Re-throw for LoginSignUpForm to handle specific toast
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
      // Toast for successful Google sign-in is now handled in LoginSignUpForm
      return result.user;
    } catch (error) {
      console.error("Google sign in error object:", error);
      const authError = error as AuthError;
      throw authError; // Re-throw for LoginSignUpForm to handle specific toast
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out.", iconType: "checkCircle" });
    } catch (error) {
      console.error("Log out error:", error);
      const authError = error as AuthError;
      toast({ variant: "destructive", title: "Log Out Failed", description: authError.message, iconType: "alertTriangle" });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      // Toast for password reset success/failure is handled in LoginSignUpForm
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

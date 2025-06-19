
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
import { getUserData } from '@/lib/firebaseUserActions'; // Import getUserData

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper function to ensure Firestore user document exists
  const ensureUserDocument = async (firebaseUser: User | null): Promise<void> => {
    if (!firebaseUser) return;
    try {
      // getUserData will create the document if it doesn't exist
      const userData = await getUserData(firebaseUser.uid); 
      if (!userData) {
        // This case should ideally be rare if getUserData's creation logic works.
        // Log an error or show a toast if the document still couldn't be confirmed.
        console.error(`Firestore document for user ${firebaseUser.uid} could not be verified or created after login/signup.`);
        // toast({
        //   variant: "destructive",
        //   title: "Account Sync Issue",
        //   description: "There was a problem syncing your account data. Some features might be limited.",
        // });
      }
    } catch (error) {
      console.error("Error ensuring user document:", error);
      // toast({
      //   variant: "destructive",
      //   title: "Account Sync Error",
      //   description: "An error occurred while syncing your account data.",
      // });
    }
  };

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await ensureUserDocument(userCredential.user); // Ensure Firestore doc
      }
      // onAuthStateChanged will set the user in context
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
        await ensureUserDocument(userCredential.user); // Ensure Firestore doc
      }
      // onAuthStateChanged will set the user in context
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
        await ensureUserDocument(result.user); // Ensure Firestore doc
      }
      // onAuthStateChanged will set the user in context
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

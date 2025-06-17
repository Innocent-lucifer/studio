
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
  GoogleAuthProvider // Keep this import
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // googleProvider is no longer exported from here
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<User | null>; // Throws AuthError on failure
  logIn: (email: string, pass: string) => Promise<User | null>; // Throws AuthError on failure
  signInWithGoogle: () => Promise<User | null>; // Throws AuthError on failure
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

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will set the user
      return userCredential.user;
    } catch (error) {
      console.error("Sign up error:", error);
      const authError = error as AuthError;
      throw authError; // Throw error
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will set the user
      return userCredential.user;
    } catch (error) {
      console.error("Log in error:", error);
      const authError = error as AuthError;
      throw authError; // Throw error
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    const googleProviderInstance = new GoogleAuthProvider(); // Instantiate here
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, googleProviderInstance);
      // onAuthStateChanged will set the user
      return result.user;
    } catch (error) {
      console.error("Google sign in error object:", error);
      const authError = error as AuthError;
      throw authError; // Throw error
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
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
      return { success: false, error: authError }; // Keep returning object for this one as form handles differently
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

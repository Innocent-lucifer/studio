
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
import { getUserData, type UserData } from '@/lib/firebaseUserActions';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Fetch and set user data when auth state changes
          const data = await getUserData(currentUser.uid, currentUser);
          setUserData(data);
        } else {
          // Clear user data on logout
          setUserData(null);
        }
      } catch (error) {
        console.error("AuthContext: Critical error during user session initialization:", error);
        setUserData(null);
        toast({
          title: "Session Error",
          description: "There was an issue initializing your session. Please refresh the page.",
          variant: "destructive",
          iconType: "alertTriangle"
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        const data = await getUserData(firebaseUser.uid, firebaseUser);
        setUserData(data);
      }
      return firebaseUser;
    } catch (error) {
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
      const firebaseUser = userCredential.user;
       if (firebaseUser) {
        const data = await getUserData(firebaseUser.uid, firebaseUser);
        setUserData(data);
      }
      return userCredential.user;
    } catch (error) {
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
      const firebaseUser = result.user;
      if (firebaseUser) {
        const data = await getUserData(firebaseUser.uid, firebaseUser);
        setUserData(data);
      }
      return firebaseUser;
    } catch (error) {
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

  return (
    <AuthContext.Provider value={{ user, userData, loading, signUp, logIn, signInWithGoogle, logOut, sendPasswordReset }}>
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

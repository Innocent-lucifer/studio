
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, AuthError, signInWithPopup } from 'firebase/auth'; // Added signInWithPopup
import { auth, googleProvider } from '@/lib/firebase'; // Added googleProvider
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<User | AuthError>;
  logIn: (email: string, pass: string) => Promise<User | AuthError>;
  signInWithGoogle: () => Promise<User | AuthError>; // Added signInWithGoogle
  logOut: () => Promise<void>;
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

  const signUp = async (email: string, pass: string): Promise<User | AuthError> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      toast({ title: "Sign Up Successful", description: "Welcome!" });
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Sign up error:", authError);
      toast({ variant: "destructive", title: "Sign Up Failed", description: authError.message });
      return authError;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, pass: string): Promise<User | AuthError> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      toast({ title: "Login Successful", description: "Welcome back!" });
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Login error:", authError);
      toast({ variant: "destructive", title: "Login Failed", description: authError.message });
      return authError;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<User | AuthError> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      toast({ title: "Google Sign-In Successful", description: "Welcome!" });
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Google sign-in error:", authError);
      // Common Google Sign-In errors:
      // auth/popup-closed-by-user
      // auth/cancelled-popup-request
      // auth/popup-blocked
      if (authError.code === 'auth/popup-closed-by-user' || authError.code === 'auth/cancelled-popup-request') {
        toast({ variant: "destructive", title: "Google Sign-In Cancelled", description: "You closed the Google sign-in window." });
      } else if (authError.code === 'auth/popup-blocked') {
         toast({ variant: "destructive", title: "Google Sign-In Blocked", description: "Your browser blocked the Google sign-in popup. Please enable popups for this site." });
      } else {
        toast({ variant: "destructive", title: "Google Sign-In Failed", description: authError.message });
      }
      return authError;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      const authError = error as AuthError;
      console.error("Logout error:", authError);
      toast({ variant: "destructive", title: "Sign Out Failed", description: authError.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, signInWithGoogle, logOut }}>
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


"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError }  from 'firebase/auth'; // Removed unused imports for actual auth functions
// import { auth, googleProvider } from '@/lib/firebase'; // Firebase interaction disabled
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<User | AuthError | null>;
  logIn: (email: string, pass: string) => Promise<User | AuthError | null>;
  signInWithGoogle: () => Promise<User | AuthError | null>;
  logOut: () => Promise<void>;
}

// Define a mock user that satisfies the User type structure minimally
const MOCK_GUEST_USER: User = {
  uid: "sagepostai-guest-user",
  email: "guest@sagepost.ai",
  displayName: "Guest User",
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: "guest",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "mock-token",
  getIdTokenResult: async () => ({ token: "mock-token", claims: {}, authTime: "", expirationTime: "", issuedAtTime: "", signInProvider: null, signInSecondFactor: null }),
  reload: async () => {},
  toJSON: () => ({}),
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_GUEST_USER);
  const [loading, setLoading] = useState(false); // Auth is "disabled", so not loading
  const { toast } = useToast();

  // useEffect(() => {
  //   // Firebase onAuthStateChanged listener commented out for disabled auth
  //   // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //   //   setUser(currentUser);
  //   //   setLoading(false);
  //   // });
  //   // return () => unsubscribe();
  //   setLoading(false); // Ensure loading is false
  // }, []);

  const signUp = async (email: string, pass: string): Promise<User | AuthError | null> => {
    toast({ title: "Authentication Disabled", description: "Sign up is currently inactive." });
    // setUser(MOCK_GUEST_USER); // Already set
    return MOCK_GUEST_USER;
  };

  const logIn = async (email: string, pass: string): Promise<User | AuthError | null> => {
    toast({ title: "Authentication Disabled", description: "Log in is currently inactive." });
    // setUser(MOCK_GUEST_USER); // Already set
    return MOCK_GUEST_USER;
  };

  const signInWithGoogle = async (): Promise<User | AuthError | null> => {
    toast({ title: "Authentication Disabled", description: "Google Sign-In is currently inactive." });
    // setUser(MOCK_GUEST_USER); // Already set
    return MOCK_GUEST_USER;
  };

  const logOut = async () => {
    toast({ title: "Authentication Disabled", description: "Log out action is inactive. You are still a guest." });
    // setUser(MOCK_GUEST_USER); // Keep guest user, or set to null if testing logged out state explicitly
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

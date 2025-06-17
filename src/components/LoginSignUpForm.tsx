"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { AuthError } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 488 512" fill="currentColor">
    <path d="M488 261.8C488 403.3 381.5 512 244 512 110.5 512 0 401.5 0 265.5S110.5 19 244 19c70.5 0 131.5 30.5 174.5 78.5l-64 64C320.5 125.5 286 103.5 244 103.5c-73 0-133.5 61-133.5 136.5s60.5 136.5 133.5 136.5c58.5 0 99-31 119-52l45 25C400.5 358.5 349 403 244 403c-100.5 0-181.5-80.5-181.5-177S143.5 48 244 48c82.5 0 148.5 47 176 105.5h-91.5v78.3z" />
  </svg>
);

export const LoginSignUpForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp, logIn, signInWithGoogle, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    let result;
    if (isSignUp) {
      result = await signUp(email, password);
    } else {
      result = await logIn(email, password);
    }

    if (result && (result as AuthError).message) {
      setFormError((result as AuthError).message);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    const result = await signInWithGoogle();
    if (result && (result as AuthError).message) {
      setFormError((result as AuthError).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md bg-[#0f172a] border border-indigo-600/20 text-white rounded-3xl shadow-2xl px-6 pt-10 pb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Icons.feather className="h-12 w-12 text-indigo-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                {isSignUp
                  ? "Join SagePostAI to supercharge your social media."
                  : "Log in to continue to SagePostAI."}
              </CardDescription>
            </CardHeader>
          </motion.div>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#1e293b] border border-indigo-600/20 text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Icons.lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 bg-[#1e293b] border border-indigo-600/20 text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </motion.div>

              {formError && (
                <motion.p
                  className="text-sm text-red-400 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {formError}
                </motion.p>
              )}

              <motion.div whileHover={{ scale: 1.03 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
                >
                  {loading ? (
                    <Icons.loader className="animate-spin mr-2" />
                  ) : isSignUp ? (
                    "Sign Up"
                  ) : (
                    "Log In"
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0f172a] px-2 text-slate-400">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-600/40 bg-[#1e293b] text-white hover:bg-[#2a3448] transition"
                disabled={loading}
              >
                {loading ? (
                  <Icons.loader className="animate-spin mr-2" />
                ) : (
                  <GoogleIcon />
                )}
                Sign in with Google
              </Button>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-3 pt-6">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormError(null);
              }}
              className="text-slate-400 hover:text-indigo-400"
            >
              {isSignUp
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

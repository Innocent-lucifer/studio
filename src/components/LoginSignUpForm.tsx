
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { AuthError } from 'firebase/auth';
import { Separator } from '@/components/ui/separator';

// Simple Google Icon SVG
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.5 512 0 401.5 0 265.5S110.5 19 244 19c70.5 0 131.5 30.5 174.5 78.5l-64 64C320.5 125.5 286 103.5 244 103.5c-73 0-133.5 61-133.5 136.5s60.5 136.5 133.5 136.5c58.5 0 99-31 119-52l45 25C400.5 358.5 349 403 244 403c-100.5 0-181.5-80.5-181.5-177S143.5 48 244 48c82.5 0 148.5 47 176 105.5h-91.5v78.3z"></path>
  </svg>
);


export const LoginSignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign Up and Log In
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
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800/70 border-slate-700 shadow-2xl text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Icons.feather className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
          <CardDescription className="text-slate-400">
            {isSignUp ? 'Join SagePostAI to supercharge your social media.' : 'Log in to continue to SagePostAI.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password"className="text-slate-300">Password</Label>
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
                  className="pl-10 bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-red-400 text-center">{formError}</p>
            )}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3" disabled={loading}>
              {loading ? <Icons.loader className="animate-spin mr-2" /> : (isSignUp ? 'Sign Up' : 'Log In')}
            </Button>
          </form>
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800/70 px-2 text-slate-400">OR CONTINUE WITH</span>
              </div>
            </div>
          </div>
           <Button 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200 py-3" 
            disabled={loading}
          >
            {loading ? <Icons.loader className="animate-spin mr-2" /> : <GoogleIcon />}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <Button variant="link" onClick={() => { setIsSignUp(!isSignUp); setFormError(null); }} className="text-slate-400 hover:text-primary">
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </Button>
           <p className="text-xs text-slate-500 text-center mt-4">
            Powered by Firebase Authentication.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

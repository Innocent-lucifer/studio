
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { AuthError } from 'firebase/auth';

export const LoginSignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign Up and Log In
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp, logIn, loading } = useAuth();

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
    // Successful operations are handled by toasts in AuthContext
  };

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
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
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

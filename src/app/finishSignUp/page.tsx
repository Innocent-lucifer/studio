
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Icons } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const FinishSignUpContent = () => {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'error' | 'success' | 'prompt'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (authLoading) return; // Wait for auth state to be resolved
        if (user) {
            router.push('/dashboard'); // If user is already logged in, just redirect
            return;
        }

        if (auth && isSignInWithEmailLink(auth, window.location.href)) {
            let savedEmail = window.localStorage.getItem('emailForSignIn');
            if (!savedEmail) {
                setStatus('prompt'); // Prompt user for email
                return;
            }
            
            signInWithEmailLink(auth, savedEmail, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn');
                    setStatus('success');
                    toast({ title: 'Sign In Successful!', description: 'Welcome! You have been signed in.', iconType: 'checkCircle' });
                    router.push('/dashboard');
                })
                .catch((error) => {
                    setErrorMessage(error.message || 'An unknown error occurred during sign-in.');
                    setStatus('error');
                    toast({ variant: 'destructive', title: 'Sign In Failed', description: error.message });
                });
        } else {
            setErrorMessage('Invalid or expired sign-in link.');
            setStatus('error');
        }
    }, [user, authLoading, router, toast]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !auth) {
            toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
            return;
        }

        setStatus('loading');
        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn'); // Clean up even if it wasn't there
                setStatus('success');
                toast({ title: 'Sign In Successful!', description: 'Welcome! You have been signed in.', iconType: 'checkCircle' });
                router.push('/dashboard');
            })
            .catch((error) => {
                setErrorMessage(error.message || 'The email provided does not match the sign-in link.');
                setStatus('error');
                toast({ variant: 'destructive', title: 'Sign In Failed', description: error.message });
            });
    };

    if (status === 'loading' || status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white">
                <Icons.loader className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-xl">{status === 'success' ? 'Redirecting to your dashboard...' : 'Completing sign in...'}</p>
            </div>
        );
    }
    
    if (status === 'prompt') {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-sm bg-slate-800/60 border-slate-700 text-white">
                    <CardHeader>
                        <CardTitle className="text-primary">Confirm Your Email</CardTitle>
                        <CardDescription>
                            To complete sign-in, please enter the email address where you received the link.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleEmailSubmit}>
                        <CardContent>
                            <Label htmlFor="email-prompt">Email Address</Label>
                            <Input
                                id="email-prompt"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="bg-slate-700 border-slate-600 mt-1"
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Confirm Email and Sign In</Button>
                        </CardFooter>
                    </form>
                </Card>
             </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-4">
                <Icons.alertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold text-destructive mb-2">Sign-in Failed</h1>
                <p className="text-slate-300 mb-4 max-w-md">{errorMessage}</p>
                <Button onClick={() => router.push('/login')} className="bg-primary hover:bg-primary/90">
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Button>
            </div>
        );
    }

    return null; // Should not be reached
}

export default function FinishSignUpPage() {
    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800">
            <Suspense fallback={
                 <div className="flex flex-col items-center justify-center min-h-screen text-white">
                    <Icons.loader className="h-16 w-16 animate-spin text-primary" />
                    <p className="mt-4 text-xl">Loading...</p>
                </div>
            }>
                <FinishSignUpContent />
            </Suspense>
        </div>
    )
}

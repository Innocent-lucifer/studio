
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSignUpForm } from '@/components/LoginSignUpForm';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/'); // Redirect to app home if already logged in
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading...</p>
      </div>
    );
  }

  if (user) {
    // This case should ideally be caught by the useEffect redirection,
    // but it's a fallback to prevent rendering the form if user is already set.
    return null;
  }

  return <LoginSignUpForm />;
}

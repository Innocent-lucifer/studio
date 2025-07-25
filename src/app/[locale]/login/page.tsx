
"use client";

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginSignUpForm } from '@/components/LoginSignUpForm';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";

const LoginContent = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles showing the post-purchase toast.
    if (searchParams.get('from') === 'purchase') {
      toast({
        title: "Purchase Successful!",
        description: "Please use your account from which you have purchased your plan & subscription.",
        duration: 8000,
        iconType: 'checkCircle'
      });
      // Clean up the URL so the toast doesn't re-appear on refresh.
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    // This effect handles redirecting an already logged-in user.
    if (!loading && user) {
      const redirectUrl = sessionStorage.getItem('postLoginRedirect');
      if (redirectUrl) {
        sessionStorage.removeItem('postLoginRedirect');
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoginPageFallback />;
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Redirecting to app...</p>
      </div>
    );
  }

  return <LoginSignUpForm />;
};

const LoginPageFallback = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
      <Icons.loader className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-xl">Loading...</p>
    </div>
);

export default function LoginPage() {
  // Suspense is required to use useSearchParams on a page.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Suspense fallback={<LoginPageFallback />}>
          <LoginContent />
        </Suspense>
    </div>
  );
}

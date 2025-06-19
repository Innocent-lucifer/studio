
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
      router.push('/'); 
    }
  }, [user, loading,]);

  if (loading) { 
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading...</p>
      </div>
    );
  }

  // If user is already logged in and not loading, this page shouldn't be visible
  // due to the useEffect redirect. If somehow it is, render nothing or a message.
  if (user) { 
    return (
         <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
            <Icons.loader className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-xl">Redirecting to app...</p>
        </div>
    );
  }

  return <LoginSignUpForm />;
}

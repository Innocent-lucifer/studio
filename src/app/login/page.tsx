
"use client";

// import { useEffect } from 'react'; // Not needed if not redirecting
// import { useRouter } from 'next/navigation'; // Not needed if not redirecting
import { LoginSignUpForm } from '@/components/LoginSignUpForm';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  const { user, loading } = useAuth(); // user will be mock guest, loading will be false
  // const router = useRouter(); // Not needed if not redirecting

  // useEffect(() => { // This useEffect is removed
  //   if (!loading && user) {
  //     router.push('/'); // Redirect to app home if already logged in
  //   }
  // }, [user, loading, router]);

  if (loading) { // This block will likely not run as loading is false
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading...</p>
      </div>
    );
  }

  // if (user) { // This block is removed as user will be the mock guest, and we want to show the form (even if non-functional)
  //   return null;
  // }

  return <LoginSignUpForm />;
}


// pages/pricing.js
import { useEffect } from "react";
import { useRouter } from 'next/router';

export default function PricingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the homepage's pricing section
    router.replace('/#pricing');
  }, [router]);

  // Render a simple loading state or null while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <p className="mt-4 text-xl">Redirecting to pricing...</p>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center p-4">
      <Card className="bg-slate-800/60 backdrop-blur-md border-destructive/50 max-w-lg text-center shadow-2xl shadow-destructive/20">
        <CardHeader>
          <div className="mx-auto bg-destructive/20 rounded-full p-4 w-fit">
            <Icons.alertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive pt-4">
            Oops! Something Went Wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300">
            We've encountered an unexpected error. Our team has been notified.
            Please try again, or return to the dashboard.
          </p>
          <p className="text-xs text-slate-500 bg-slate-700/50 p-2 rounded-md font-mono">
            Error: {error.message || "An unknown error occurred."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Icons.refreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

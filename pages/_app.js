
import '../src/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster";

// This _app.js file is the entry point for all pages in the `pages` directory.
// It's used here to apply global styles and context providers to the marketing site.
export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
        <Component {...pageProps} />
        <Toaster />
    </AuthProvider>
  );
}

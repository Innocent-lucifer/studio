"use client"; // Required for framer-motion

import { Icons } from '@/components/icons';
import { motion } from 'framer-motion';

// This component will be automatically shown by Next.js during page transitions
// if the loading of the new page's server components takes time.
export default function Loading() {
  return (
    <motion.div
      key="app-global-loading-indicator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeInOut" } }}
      // No exit animation needed here as Next.js replaces this component
      // when the new page content is ready.
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md"
      aria-live="polite" // Polite for less intrusive screen reader announcements
      aria-busy="true"
      role="status"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { delay: 0.1, type: 'spring', stiffness: 280, damping: 25 } }}
      >
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
      </motion.div>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.3, ease: "easeOut" } }}
        className="mt-5 text-lg font-medium text-slate-100"
      >
        Loading next experience...
      </motion.p>
       <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.3, ease: "easeOut" } }}
        className="mt-1 text-sm text-slate-400"
      >
        Please wait a moment.
      </motion.p>
    </motion.div>
  );
}

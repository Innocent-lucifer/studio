
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation'; // Not needed if not redirecting
// import { useEffect } from 'react'; // Not needed if not redirecting

interface FeatureCardProps {
  icon: keyof typeof Icons;
  title: string;
  description: string;
  href: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, href, delay = 0 }) => {
  const IconComponent = Icons[icon] || Icons.help;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px hsl(var(--primary)/0.3)" }}
      className="group"
    >
      <Link href={href} passHref legacyBehavior={false}>
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-6 sm:p-8 h-full flex flex-col cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
          <div className="mb-4 sm:mb-6">
            <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-primary group-hover:text-purple-400 transition-colors duration-300" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">
            {description}
          </p>
          <Button
            variant="outline"
            className="mt-auto w-full sm:w-auto self-start bg-primary/10 border-primary/50 text-primary group-hover:bg-primary/20 group-hover:border-primary/70 group-hover:text-purple-300 transition-all duration-300 ease-in-out transform group-hover:scale-105"
          >
            Launch Tool <Icons.arrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default function AppHomePage() {
  const { user } = useAuth(); // Removed loading and router as auth is disabled for now

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, loading, router]); // This useEffect is removed

  // if (loading) { // This block is removed
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
  //       <Icons.loader className="h-16 w-16 animate-spin text-primary" />
  //       <p className="mt-4 text-xl">Loading SagePostAI...</p>
  //     </div>
  //   );
  // }

  // if (!user) { // This block is removed, assuming user is always the mock guest user
  //   return null; 
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-0 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="hidden md:block">
            <HamburgerMenu />
          </div>
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
              <AppLogo className="h-10 w-10 sm:h-12 sm:w-12 text-primary group-hover:scale-110 transition-transform" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                SagePostAI
              </h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            {user?.email ? (
              <p className="font-semibold text-primary truncate max-w-[150px] sm:max-w-[200px]" title={user.email}>{user.email}</p>
            ) : (
              <p className="font-semibold text-primary">Guest Mode</p>
            )}
            <p className="text-slate-400">Welcome!</p>
          </div>
          <div className="md:hidden">
            <HamburgerMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl flex-grow flex flex-col items-center text-center px-2 sm:px-4">
        {/* App Home Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="py-12 sm:py-16 md:py-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 text-slate-100">
            Welcome to SagePostAI! <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Turn ideas, images, and vibes into scroll-stopping social posts.
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
            Select your mode to begin. All powered by AI. Styled by you.
          </p>
        </motion.section>

        {/* Feature Cards Section */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-24">
          <FeatureCard
            icon="edit"
            title="Quick Post Generator"
            description="Research any topic and instantly generate engaging drafts for Twitter and LinkedIn. Perfect for rapid content creation."
            href="/quick-post"
            delay={0}
          />
          <FeatureCard
            icon="image"
            title="Image to Post Wizard"
            description="Upload an image and let our AI craft a personalized, descriptive social media post based on its content and your chosen tone."
            href="/visual-post"
            delay={0.1}
          />
          <FeatureCard
            icon="sparkles"
            title="Smart Campaign Builder"
            description="Create cohesive multi-post campaigns. Select content angles, generate series for different platforms, and get repurposing ideas."
            href="/smart-campaign"
            delay={0.2}
          />
          <FeatureCard
            icon="flame"
            title="Trend Explorer"
            description="Discover what's buzzing on social media. Explore trending topics across platforms and categories to inspire your next viral post."
            href="/trends"
            delay={0.3}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center p-6 sm:p-8 text-slate-500 text-sm">
        <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
          Built by EZ Teenagers.
          <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </div>
  );
}

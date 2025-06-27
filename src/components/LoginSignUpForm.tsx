
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "firebase/auth";
import { Button as ShadButton } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";

export function LoginSignUpForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { toast } = useToast();
  const { signUp, logIn, signInWithGoogle, sendPasswordReset, loading } = useAuth();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (isRegistering) {
      if (password !== confirmPassword) {
        toast({ title: "Password Mismatch", description: "The passwords you entered do not match.", variant: "destructive", iconType: "alertTriangle" });
        return;
      }
      try {
        await signUp(email, password);
        toast({ title: "Account Created!", description: "Welcome! You've successfully signed up.", iconType: "checkCircle" });
      } catch (error) {
        const authError = error as AuthError;
        console.error("Sign Up Error (from component):", authError);
        toast({ title: "Sign Up Failed", description: authError.message || "Please check your details and try again.", variant: "destructive", iconType: "alertTriangle" });
      }
    } else {
      try {
        await logIn(email, password);
        toast({ title: "Signed In!", description: "Welcome back! You're now signed in.", iconType: "checkCircle" });
      } catch (error) {
        const authError = error as AuthError;
        console.error("Sign In Error (from component):", authError);
        toast({ title: "Sign In Failed", description: authError.message || "Invalid email or password. Please try again.", variant: "destructive", iconType: "alertTriangle" });
      }
    }
  };

  const handleGoogleAuth = async () => {
    if (loading || googleLoading) return; 
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Google Sign-In Successful!", description: isRegistering ? "Welcome! Your account is created." : "You're now signed in with Google.", iconType: "checkCircle" });
    } catch (error) {
      const authError = error as AuthError;
      console.error("Google Sign-In Error (from component):", authError);
      toast({ title: "Google Sign-In Failed", description: authError.message || "Could not sign in with Google. Please try again.", variant: "destructive", iconType: "alertTriangle" });
    } finally {
      setGoogleLoading(false);
    }
  };


  const handlePasswordResetSubmit = async () => {
    if (loading) return;
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address to reset the password.", variant: "destructive", iconType: "alertTriangle" });
      return;
    }
    const result = await sendPasswordReset(email);
    if (result.success) {
      toast({ title: "Password Reset Email Sent", description: "Please check your inbox (and spam folder) for the reset link.", iconType: "checkCircle" });
      setForgotPassword(false); 
    } else if (result.error) {
      toast({ title: "Password Reset Failed", description: result.error.message, variant: "destructive", iconType: "alertTriangle" });
    }
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
  };

  const headerContentAnimation = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };
  
  const formElementsContainerAnimation = {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
    },
  };

  const formElementAnimation = {
    variants: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    },
  };
  
  const bottomToggleAnimation = {
    initial: { opacity: 0, y:10 },
    animate: { opacity: 1, y:0 },
    transition: { duration: 0.3, delay: (isRegistering && !forgotPassword ? 7 : (forgotPassword ? 6 : 5)) * 0.07 + 0.25 + 0.1, ease: "easeOut" },
  }


  return (
    <motion.div
      {...cardAnimation}
      className="max-w-md mx-auto bg-[#0f172a] text-white rounded-3xl shadow-2xl px-8 py-10 space-y-6 border border-indigo-600/30"
    >
      
      <motion.div 
        className="flex flex-col items-center"
        initial="initial"
        animate="animate"
        variants={{
            initial: {},
            animate: {transition: {staggerChildren: 0.1, delayChildren: 0.1}}
        }}
      >
        <motion.div variants={headerContentAnimation} transition={{duration: 0.3, ease: "easeOut"}}>
            <AppLogo className="h-16 w-16 text-primary mb-4" />
        </motion.div>
        <motion.h2
            variants={headerContentAnimation}
            transition={{duration: 0.3, ease: "easeOut"}}
            className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500"
        >
            {forgotPassword ? "Reset Password" : isRegistering ? "Create Account" : "Welcome Back"}
        </motion.h2>
      </motion.div>


      <motion.form
        onSubmit={forgotPassword ? (e) => { e.preventDefault(); handlePasswordResetSubmit(); } : handleAuthSubmit}
        className="space-y-4"
        {...formElementsContainerAnimation}
      >
        <motion.div {...formElementAnimation}>
          <label htmlFor="email-auth" className="block text-sm font-medium mb-1 text-slate-300">Email</label>
          <input
            type="email"
            id="email-auth"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white placeholder-gray-400/70 border border-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </motion.div>

        {!forgotPassword && (
          <motion.div {...formElementAnimation}>
            <label htmlFor="password-auth" className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password-auth"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!forgotPassword}
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white placeholder-gray-400/70 border border-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>
        )}

        {isRegistering && !forgotPassword && (
          <motion.div {...formElementAnimation}>
            <label htmlFor="confirm-password-auth" className="block text-sm font-medium mb-1 text-slate-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password-auth"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isRegistering && !forgotPassword}
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white placeholder-gray-400/70 border border-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>
        )}
        
        {forgotPassword && (
          <>
            <motion.p 
                className="text-xs text-center text-slate-400/80 -mt-2 mb-3"
                {...formElementAnimation}
              >
                Enter your email above. A link to reset your password will be sent.
              </motion.p>
            <motion.div {...formElementAnimation} className="opacity-50 cursor-not-allowed hidden">
              <label htmlFor="verification-code" className="block text-sm font-medium mb-1 text-slate-300">Verification Code (Not Used)</label>
              <input
                type="text"
                id="verification-code"
                placeholder="Enter verification code"
                disabled
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white placeholder-gray-400/70 border border-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </motion.div>
            <motion.div {...formElementAnimation} className="opacity-50 cursor-not-allowed hidden">
              <label htmlFor="new-password" className="block text-sm font-medium mb-1 text-slate-300">New Password (Not Used)</label>
              <input
                type="password"
                id="new-password"
                disabled
                placeholder="Create a new password"
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white placeholder-gray-400/70 border border-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </motion.div>
          </>
        )}

        {!isRegistering && !forgotPassword && (
          <motion.div
            {...formElementAnimation}
            className="text-sm text-right text-indigo-400 hover:text-purple-400 cursor-pointer"
            onClick={() => { setForgotPassword(true); setPassword(""); setConfirmPassword("");}}
          >
            Forgot password?
          </motion.div>
        )}
        
        <motion.div {...formElementAnimation}>
          <ShadButton 
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-1 font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition text-white shadow-md flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {loading
              ? "Processing..."
              : forgotPassword
              ? "Send Reset Link"
              : isRegistering
              ? "Sign Up"
              : "Sign In"}
          </ShadButton>
        </motion.div>

        {!forgotPassword && (
          <>
            <motion.div {...formElementAnimation} className="my-3 relative !mt-6 !mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0f172a] px-2 text-slate-400">
                  OR CONTINUE WITH
                </span>
              </div>
            </motion.div>

            <motion.div {...formElementAnimation}>
              <ShadButton 
                type="button" 
                onClick={handleGoogleAuth}
                disabled={loading || googleLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl border border-gray-600/40 bg-[#1e293b] text-white hover:bg-[#2a3448] transition ${loading || googleLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {googleLoading ? 
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                : <FcGoogle size={20} />}
                {isRegistering ? "Sign up with Google" : "Sign in with Google"}
              </ShadButton>
            </motion.div>
          </>
        )}
      </motion.form>

      <motion.p 
        {...bottomToggleAnimation}
        className="text-center text-sm text-gray-400 pt-2"
      >
        {forgotPassword ? (
          <span onClick={() => {setForgotPassword(false); setEmail(""); setPassword("");}} className="text-indigo-400 hover:text-purple-400 cursor-pointer">
            Back to Sign In
          </span>
        ) : isRegistering ? (
          <>Already have an account?{" "}
            <span onClick={() => {setIsRegistering(false); setPassword(""); setConfirmPassword(""); setEmail(email);}} className="text-indigo-400 hover:text-purple-400 cursor-pointer">
              Sign In
            </span>
          </>
        ) : (
          <>Don't have an account?{" "}
            <span onClick={() => {setIsRegistering(true); setPassword(""); setConfirmPassword(""); setEmail(email);}} className="text-indigo-400 hover:text-purple-400 cursor-pointer">
              Register now
            </span>
          </>
        )}
      </motion.p>
    </motion.div>
  );
}

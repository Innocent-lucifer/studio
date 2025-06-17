
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react"; // Icons from lucide-react
import { FcGoogle } from "react-icons/fc"; // Google icon from react-icons
import toast, { Toaster } from "react-hot-toast"; // Toast notifications
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "firebase/auth";
import { Button } from "@/components/ui/button"; // Assuming Button is used

export function LoginSignUpForm() {
  const [isRegistering, setIsRegistering] = useState(false); // Default to register if that's more common, or false for Sign In
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { signUp, logIn, signInWithGoogle, sendPasswordReset, loading } = useAuth();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (isRegistering) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      const result = await signUp(email, password);
      if (result && (result as AuthError).message) {
        toast.error((result as AuthError).message);
      } else if (result) {
        toast.success("Account created successfully!");
      }
    } else {
      const result = await logIn(email, password);
      if (result && (result as AuthError).message) {
        toast.error((result as AuthError).message);
      } else if (result) {
        toast.success("Signed in successfully!");
      }
    }
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    const result = await signInWithGoogle();
    if (result && (result as AuthError).message) {
      toast.error((result as AuthError).message);
    } else if (result) {
      toast.success(isRegistering ? "Signed up with Google!" : "Signed in with Google!");
    }
  };

  const handlePasswordResetSubmit = async () => {
    if (loading) return;
    if (!email) {
      toast.error("Please enter your email address to reset the password.");
      return;
    }
    const result = await sendPasswordReset(email);
    if (result.success) {
      toast.success("Password reset email sent! Check your inbox.");
      setForgotPassword(false); 
    } else if (result.error) {
      toast.error(result.error.message);
    }
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
  };

  const titleAnimation = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: 0.1, ease: "easeOut" },
  };

  const formElementsContainerAnimation = {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
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
    // Calculate delay: card (0.35) + title (0.1+0.3=0.4) + formContainerDelay (0.2) + approx stagger for 3 items (3*0.07=0.21) -> ~1.1s
    // Simpler: card (0.35) + title (0.1) + formContainer (0.2) + some buffer
    transition: { duration: 0.3, delay: (isRegistering && !forgotPassword ? 7 : (forgotPassword ? 6 : 5)) * 0.07 + 0.2 + 0.1 + 0.1, ease: "easeOut" },
  }


  return (
    <motion.div
      {...cardAnimation}
      className="max-w-md mx-auto bg-[#0f172a] text-white rounded-3xl shadow-2xl px-8 py-10 space-y-6 border border-indigo-600/30"
    >
      <Toaster position="top-center" reverseOrder={false} containerClassName="text-sm" />
      <motion.h2
        {...titleAnimation}
        className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500"
      >
        {forgotPassword ? "Reset Password" : isRegistering ? "Register" : "Sign In"}
      </motion.h2>

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
                Enter your email above. A link to reset your password will be sent. The fields below are placeholders from a template and are not used by the standard Firebase email reset process.
              </motion.p>
            <motion.div {...formElementAnimation} className="opacity-50 cursor-not-allowed">
              <label htmlFor="verification-code" className="block text-sm font-medium mb-1 text-slate-300">Verification Code (Not Used)</label>
              <input
                type="text"
                id="verification-code"
                placeholder="Enter verification code"
                disabled
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white placeholder-gray-400/70 border border-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </motion.div>
            <motion.div {...formElementAnimation} className="opacity-50 cursor-not-allowed">
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
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition text-white shadow-md flex items-center justify-center"
            // onClick will be handled by form's onSubmit, except for direct password reset button.
            // For password reset, the form's onSubmit itself calls handlePasswordResetSubmit
          >
            {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {loading
              ? "Processing..."
              : forgotPassword
              ? "Send Reset Link"
              : isRegistering
              ? "Sign Up"
              : "Sign In"}
          </Button>
        </motion.div>

        {!forgotPassword && (
          <>
            <motion.div {...formElementAnimation} className="my-3 relative !mt-6 !mb-5"> {/* Adjusted margins */}
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
              <Button
                type="button" // Important: type="button" to prevent form submission
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl border border-gray-600/40 bg-[#1e293b] text-white hover:bg-[#2a3448] transition"
              >
                {loading ? 
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                : <FcGoogle size={20} />}
                {isRegistering ? "Sign up with Google" : "Sign in with Google"}
              </Button>
            </motion.div>
          </>
        )}
      </motion.form>

      <motion.p 
        {...bottomToggleAnimation}
        className="text-center text-sm text-gray-400 pt-2" // Reduced top padding if space-y-6 on main div is enough
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

    

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "firebase/auth";
import { Button as ShadButton } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { Icons } from "@/components/icons";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "./LanguageSwitcher";

type FormMode = "login" | "register" | "forgotPassword";

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <motion.li
    className={`flex items-center text-sm transition-colors duration-300 ${met ? 'text-green-400' : 'text-slate-400'}`}
    initial={{ x: -10, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {met ? <CheckCircle size={14} className="mr-2 shrink-0" /> : <XCircle size={14} className="mr-2 shrink-0" />}
    {text}
  </motion.li>
);


export function LoginSignUpForm() {
  const t = useTranslations('LoginSignUpForm');
  const [formMode, setFormMode] = useState<FormMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
  });

  const { toast } = useToast();
  const { signUp, logIn, signInWithGoogle, sendPasswordReset, loading } = useAuth();

  useEffect(() => {
    if (formMode === 'register') {
      setPasswordCriteria({
        minLength: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  }, [password, formMode]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const resetFields = () => {
    setPassword("");
    setConfirmPassword("");
    setIsPasswordFocused(false);
  };

  const handleModeChange = (newMode: FormMode) => {
    setFormMode(newMode);
    resetFields();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (formMode === 'register') {
      const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
      if (!allCriteriaMet) {
        toast({ title: "Weak Password", description: "Please ensure your password meets all the requirements.", variant: "destructive", iconType: "alertTriangle" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Password Mismatch", description: t('passwordsDoNotMatch'), variant: "destructive", iconType: "alertTriangle" });
        return;
      }
      try {
        await signUp(email, password);
        toast({ title: "Account Created!", description: "Please check your email to verify your account before logging in.", iconType: "checkCircle", duration: 8000 });
        handleModeChange('login'); // Switch to login view after successful signup
      } catch (error) {
        const authError = error as AuthError;
        console.error("Sign Up Error (from component):", authError);
        toast({ title: "Sign Up Failed", description: authError.message || "Please check your details and try again.", variant: "destructive", iconType: "alertTriangle" });
      }
    } else if (formMode === 'login') {
      try {
        await logIn(email, password);
        toast({ title: "Signed In!", description: "Welcome back! You're now signed in.", iconType: "checkCircle" });
      } catch (error) {
        const authError = error as AuthError;
        
        let userFriendlyMessage = "An unexpected error occurred. Please try again.";
        switch (authError.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                userFriendlyMessage = "Invalid email or password. Please check your details and try again.";
                break;
            case 'auth/invalid-email':
                userFriendlyMessage = "The email address is not valid. Please enter a valid email.";
                break;
            case 'auth/too-many-requests':
                userFriendlyMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
                break;
        }

        // Check for our custom verification error message from AuthContext
        if (authError.message.includes('verify your email')) {
          toast({ title: "Verification Required", description: authError.message, variant: "destructive", iconType: "alertTriangle", duration: 8000 });
        } else {
          console.error("Sign In Error (from component):", authError.code);
          toast({ title: "Sign In Failed", description: userFriendlyMessage, variant: "destructive", iconType: "alertTriangle" });
        }
      }
    } else if (formMode === 'forgotPassword') {
       if (!email) {
        toast({ title: "Email Required", description: t('pleaseEnterEmail'), variant: "destructive", iconType: "alertTriangle" });
        return;
      }
      const result = await sendPasswordReset(email);
      if (result.success) {
        toast({ title: "Password Reset Email Sent", description: t('passwordResetEmailSent'), iconType: "checkCircle" });
        handleModeChange('login');
      } else if (result.error) {
        toast({ title: "Password Reset Failed", description: result.error.message, variant: "destructive", iconType: "alertTriangle" });
      }
    }
  };

  const handleGoogleAuth = async () => {
    if (loading || googleLoading) return; 
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Google Sign-In Successful!", description: formMode === 'register' ? "Welcome! Your account is created." : "You're now signed in with Google.", iconType: "checkCircle" });
    } catch (error) {
      const authError = error as AuthError;
      console.error("Google Sign-In Error (from component):", authError);
      toast({ title: "Google Sign-In Failed", description: authError.message || "Could not sign in with Google. Please try again.", variant: "destructive", iconType: "alertTriangle" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
  };
  
  const getTitle = () => {
    switch (formMode) {
      case 'login': return t('signIn');
      case 'register': return t('register');
      case 'forgotPassword': return t('resetPassword');
    }
  };
  
  const getButtonText = () => {
    if (loading) return t('processing');
    switch (formMode) {
      case 'login': return t('signIn');
      case 'register': return t('register');
      case 'forgotPassword': return t('sendResetLink');
    }
  };

  return (
    <motion.div
      key={formMode}
      {...cardAnimation}
      className="max-w-md mx-auto bg-[#0f172a] text-white rounded-3xl shadow-2xl px-8 py-10 space-y-6 border border-indigo-600/30"
    >
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>
      <motion.div 
        className="flex flex-col items-center"
      >
        <AppLogo className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            {getTitle()}
        </h2>
      </motion.div>

      <form
        onSubmit={handleAuthSubmit}
        className="space-y-4"
      >
        <motion.div>
          <label htmlFor="email-auth" className="block text-sm font-medium mb-1 text-slate-300">{t('emailLabel')}</label>
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

        {formMode !== 'forgotPassword' && (
          <motion.div>
            <label htmlFor="password-auth" className="block text-sm font-medium mb-1 text-slate-300">{t('passwordLabel')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password-auth"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                required
                minLength={formMode === 'register' ? 8 : 6}
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

        <AnimatePresence>
          {formMode === 'register' && isPasswordFocused && (
            <motion.ul
              key="password-reqs"
              className="mt-2 space-y-1 pl-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PasswordRequirement met={passwordCriteria.minLength} text="At least 8 characters" />
              <PasswordRequirement met={passwordCriteria.hasUpper} text="An uppercase letter" />
              <PasswordRequirement met={passwordCriteria.hasLower} text="A lowercase letter" />
              <PasswordRequirement met={passwordCriteria.hasNumber} text="A number" />
              <PasswordRequirement met={passwordCriteria.hasSpecial} text="A special character" />
            </motion.ul>
          )}
        </AnimatePresence>

        {formMode === 'register' && (
          <motion.div>
            <label htmlFor="confirm-password-auth" className="block text-sm font-medium mb-1 text-slate-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password-auth"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
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
        
        {formMode === 'login' && (
          <div className="text-right text-sm">
            <span
              className="text-indigo-400 hover:text-purple-400 cursor-pointer"
              onClick={() => handleModeChange('forgotPassword')}
            >
              {t('forgotPassword')}
            </span>
          </div>
        )}
        
        <motion.div>
          <ShadButton 
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-1 font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition text-white shadow-md flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <Icons.loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
            {getButtonText()}
          </ShadButton>
        </motion.div>

        {formMode !== 'forgotPassword' && (
          <>
            <motion.div className="my-3 relative !mt-6 !mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0f172a] px-2 text-slate-400">
                  OR CONTINUE WITH
                </span>
              </div>
            </motion.div>

            <motion.div>
              <ShadButton 
                type="button" 
                onClick={handleGoogleAuth}
                disabled={loading || googleLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl border border-gray-600/40 bg-[#1e293b] text-white hover:bg-[#2a3448] transition ${loading || googleLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {googleLoading ? 
                  <Icons.loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                : <FcGoogle size={20} />}
                {t('continueWithGoogle')}
              </ShadButton>
            </motion.div>
          </>
        )}
      </form>

      <motion.p 
        {...cardAnimation}
        className="text-center text-sm text-gray-400 pt-2"
      >
        {formMode === 'login' ? (
          <>{t('dontHaveAccount')}{" "}
            <span onClick={() => handleModeChange('register')} className="text-indigo-400 hover:text-purple-400 cursor-pointer">
              {t('registerNow')}
            </span>
          </>
        ) : (
           <>{t('alreadyHaveAccount')}{" "}
            <span onClick={() => handleModeChange('login')} className="text-indigo-400 hover:text-purple-400 cursor-pointer">
              {t('signIn')}
            </span>
          </>
        )}
      </motion.p>
    </motion.div>
  );
}

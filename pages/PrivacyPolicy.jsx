import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  const router = useRouter();

  const handleSmartNav = (path) => {
    if (router.pathname === path) {
      router.reload();
    } else {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#c7d2fe] py-16 px-4 flex flex-col">
      <div className="max-w-3xl mx-auto w-full relative flex-1">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-medium mb-6 transition duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Privacy Policy Content */}
        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-gray-800">
          <h1 className="text-3xl font-extrabold mb-6 text-indigo-700">
            Privacy Policy
          </h1>

          <p className="mb-5">
            At <strong>SagePostAI</strong>, we deeply respect your privacy. This
            Privacy Policy outlines what data we collect, how we use it, and how
            we protect your information while using our services.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            1. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>Email & Sign-In Info:</strong> Collected when you sign up
              or log in using email/password or Google.
            </li>
            <li>
              <strong>Usage Data:</strong> We store your plan type, credit
              balance, post history, and interactions to improve product
              functionality.
            </li>
            <li>
              <strong>Payment Data:</strong> Handled by Stripe. We never store
              your card details.
            </li>
            <li>
              <strong>Cookies:</strong> Used to improve your experience, remember
              sessions, and enable smooth navigation.{" "}
              Learn more in our{" "}
              <button
                onClick={() => handleSmartNav("/Cookie-Policy")}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Cookie Policy
              </button>
              .
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            2. How We Use Your Data
          </h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>To personalize your dashboard experience</li>
            <li>To generate and store AI-generated post content</li>
            <li>To manage subscription plans and credits</li>
            <li>
              To send essential communications like billing, feature updates, or
              legal notices
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            3. Data Protection & Security
          </h2>
          <p className="mb-4">
            We use Firebase and other modern cloud infrastructure to keep your
            data secure, encrypted, and access-restricted. Only authorized
            staff (under NDA) have access to internal systems when necessary.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            4. Third-Party Tools
          </h2>
          <p className="mb-4">
            We may use tools like Firebase, Stripe, and analytics platforms.
            These services comply with industry standards and do not collect
            personally identifiable information unless necessary for platform
            functionality.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            5. Your Rights
          </h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Access or delete your data anytime by contacting us</li>
            <li>Withdraw consent for cookies via browser settings</li>
            <li>Request data export if legally applicable</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            6. Updates
          </h2>
          <p className="mb-4">
            This policy may be updated periodically to reflect product
            improvements. We recommend checking back occasionally.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            7. Contact
          </h2>
          <p className="mb-6">
            For any privacy-related concerns, reach out to us at{" "}
            <a
              href="mailto:support@sagepostai.com"
              className="text-blue-600 underline"
            >
              support@sagepostai.com
            </a>
            .
          </p>

          {/* Footer Legal Links */}
          <div className="border-t pt-6 text-sm text-center text-gray-600 space-x-4 underline">
            <button
              onClick={() => handleSmartNav("/PrivacyPolicy")}
              className="hover:text-indigo-700"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleSmartNav("/terms-of-service")}
              className="hover:text-indigo-700"
            >
              Terms of Service
            </button>
            <button
              onClick={() => handleSmartNav("/Refund")}
              className="hover:text-indigo-700"
            >
              Refund Policy
            </button>
            <button
              onClick={() => handleSmartNav("/Cookie-Policy")}
              className="hover:text-indigo-700"
            >
              Cookie Policy
            </button>
            <button
              onClick={() => handleSmartNav("/Disclaimer")}
              className="hover:text-indigo-700"
            >
              Disclaimer
            </button>
            <button
              onClick={() => handleSmartNav("/contact")}
              className="hover:text-indigo-700"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

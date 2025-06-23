import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CookiePolicy() {
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

        {/* Cookie Policy Content */}
        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-gray-800">
          <h1 className="text-3xl font-extrabold mb-6 text-indigo-700">
            Cookie Policy
          </h1>

          <p className="mb-5">
            At <strong>SagePostAI</strong>, we use cookies to improve your
            browsing experience and ensure the platform functions as intended.
            This Cookie Policy explains what cookies are, how we use them, and
            how you can manage them.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            1. What Are Cookies?
          </h2>
          <p className="mb-4">
            Cookies are small text files stored on your device when you visit a
            website. They help us remember your preferences, login sessions, and
            gather anonymized usage data to improve our service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            2. Types of Cookies We Use
          </h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>Essential Cookies:</strong> Required for basic
              functionality like authentication and navigation.
            </li>
            <li>
              <strong>Performance Cookies:</strong> Help us understand how users
              interact with SagePostAI for product improvement.
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember user settings (e.g.
              input text, selected tone, last used tool).
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            3. How We Use Cookies
          </h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>To keep you logged in securely</li>
            <li>To track platform usage anonymously for analytics</li>
            <li>To store preferences across sessions</li>
            <li>To improve speed and performance</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            4. Managing Cookies
          </h2>
          <p className="mb-4">
            You can disable or clear cookies at any time from your browser
            settings. Note that disabling cookies may affect your experience and
            functionality of some features on SagePostAI.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            5. Third-Party Cookies
          </h2>
          <p className="mb-4">
            Some cookies may be set by trusted third-party services we use, such
            as Firebase, Stripe, or analytics providers. These services follow
            strict privacy standards and do not collect personally identifiable
            information from you.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            6. Policy Updates
          </h2>
          <p className="mb-4">
            We may update this Cookie Policy as our platform evolves. We
            encourage you to review this page periodically.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            7. Contact
          </h2>
          <p>
            For any questions about this policy, please reach out to us at{" "}
            <a
              href="mailto:support@sagepostai.com"
              className="text-blue-600 underline"
            >
              support@sagepostai.com
            </a>
            .
          </p>
        </div>
      </div>

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
  );
}

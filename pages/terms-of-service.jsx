import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
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

        {/* Terms Content */}
        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-gray-800">
          <h1 className="text-3xl font-extrabold mb-6 text-indigo-700">
            Terms of Service
          </h1>

          <p className="mb-5">
            These Terms of Service ("Terms") govern your use of{" "}
            <strong>SagePostAI</strong> ("we", "our", or "us"). By accessing or
            using our services, you agree to be bound by these Terms. If you do
            not agree, please do not use our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            1. Use of the Platform
          </h2>
          <p className="mb-4">
            SagePostAI allows users to generate social media content using AI.
            You agree to use the platform only for lawful purposes, and not to
            misuse or exploit it for unauthorized commercial use, scraping, or
            manipulation.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            2. Account & Access
          </h2>
          <p className="mb-4">
            You must be at least 13 years old to use SagePostAI. You are
            responsible for maintaining the confidentiality of your account and
            for all activities under it. We reserve the right to suspend or
            terminate accounts for violations of these Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            3. Credit-Based System
          </h2>
          <p className="mb-4">
            SagePostAI operates on a credit-based usage model. Once credits are
            used to generate content, they cannot be refunded or reclaimed.
            Please review our Refund Policy for full details.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            4. Intellectual Property
          </h2>
          <p className="mb-4">
            All code, branding, and original assets are the property of
            SagePostAI. However, any content generated using your account and
            credits is fully owned by you and can be used commercially.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            5. Restrictions
          </h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              Do not reverse-engineer or copy our platform's internal
              mechanisms.
            </li>
            <li>
              Do not use SagePostAI to generate harmful, hateful, or misleading
              content.
            </li>
            <li>
              Do not share your login with others or resell generated content
              without consent.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            6. Limitation of Liability
          </h2>
          <p className="mb-4">
            We are not liable for any damages or losses resulting from the use
            or inability to use our services. All features are provided "as-is"
            without warranty of any kind.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            7. Changes to Terms
          </h2>
          <p className="mb-4">
            SagePostAI may update these Terms as features evolve. We’ll notify
            you of major changes via email or in-app alerts. Continued use
            after updates constitutes agreement to the revised Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 text-indigo-600">
            8. Contact
          </h2>
          <p>
            For any legal questions or concerns, please contact us at{" "}
            <a
              href="mailto:support@sagepostai.com"
              className="text-blue-600 underline"
            >
              support@sagepostai.com
            </a>
            .
          </p>
        </div>

        {/* Footer Legal Links */}
        <div className="border-t pt-6 text-sm text-center text-gray-600 space-x-4 underline mt-10">
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
  );
}

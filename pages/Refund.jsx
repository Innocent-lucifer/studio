import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RefundPolicy() {
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
        {/* Back to Home Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-medium mb-6 transition duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Refund Policy Content */}
        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-gray-800">
          <h1 className="text-3xl font-extrabold mb-6 text-indigo-700">
            Cancellation & Refund Policy
          </h1>

          <p className="mb-5">
            At <span className="font-semibold">SagePostAI</span>, we operate on
            a transparent, credit-based system. Once credits are purchased and
            used to generate content, they are consumed instantly by the AI
            system. Due to this nature of immediate digital delivery,{" "}
            <span className="font-semibold text-red-600">
              we do not offer refunds
            </span>{" "}
            after a successful purchase.
          </p>

          <p className="mb-5">
            This policy ensures fairness and protects our platform from misuse
            — such as users consuming all available credits and then requesting
            a full refund. Our focus is on providing consistent value to serious
            users of the platform.
          </p>

          <p className="mb-5">
            If you experience a genuine technical issue or an error with your
            account, please contact our team within{" "}
            <span className="font-semibold">3 days</span> of the transaction. In
            such cases, we’ll review the issue and, if appropriate, offer bonus
            credits or assistance.
          </p>

          <p className="mb-5">
            You may cancel any active subscription at any time. Your plan will
            remain active until the end of the current billing cycle, after
            which no further charges will occur.
          </p>

          <p>
            If you have any questions or concerns, feel free to reach out to us
            at{" "}
            <a
              href="mailto:support@sagepostai.com"
              className="text-blue-600 underline"
            >
              support@sagepostai.com
            </a>
            .
          </p>

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
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  UserRound,
  Briefcase,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#c7d2fe] to-[#a5b4fc] text-gray-900 py-16 px-6 sm:px-10">
      {/* Back to Home */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link
          href="/"
          className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-medium transition duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
          Contact SagePostAI
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Reach out to the right department. We're here to help, partner, and
          grow with you.
        </p>
      </div>

      {/* Email Sections */}
      <div className="max-w-3xl mx-auto grid gap-8">
        {/* CEO Contact */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 flex items-start gap-4">
          <UserRound className="text-indigo-600 w-6 h-6 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Message the CEO
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              For direct leadership queries, vision discussions, or serious
              collaborations.
            </p>
            <a
              href="mailto:ceo@sagepostai.com"
              className="text-indigo-700 font-medium hover:underline"
            >
              ceo@sagepostai.com
            </a>
          </div>
        </div>

        {/* Partnerships */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 flex items-start gap-4">
          <Briefcase className="text-indigo-600 w-6 h-6 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Partnerships & Business
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              For sponsorships, integrations, brand collabs, and enterprise
              licensing.
            </p>
            <a
              href="mailto:partners@sagepostai.com"
              className="text-indigo-700 font-medium hover:underline"
            >
              partners@sagepostai.com
            </a>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 flex items-start gap-4">
          <Mail className="text-indigo-600 w-6 h-6 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Product Support
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Questions, bugs, billing issues, or anything stopping your flow?
            </p>
            <a
              href="mailto:support@sagepostai.com"
              className="text-indigo-700 font-medium hover:underline"
            >
              support@sagepostai.com
            </a>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 flex items-start gap-4">
          <MessageSquare className="text-indigo-600 w-6 h-6 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Product Feedback
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Got ideas to improve SagePostAI? We’re listening.
            </p>
            <a
              href="mailto:feedback@sagepostai.com"
              className="text-indigo-700 font-medium hover:underline"
            >
              feedback@sagepostai.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

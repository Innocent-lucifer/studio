
import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/sections/Footer";

const PolicySection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary">
      {title}
    </h2>
    <div className="space-y-4 text-foreground/80">{children}</div>
  </div>
);

export default function TermsOfServicePage() {
  return (
    <div className="text-foreground min-h-screen flex flex-col">
      <main className="flex-grow py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/" passHref>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
              </Button>
            </Link>
          </div>
          <div className="bg-background border border-border rounded-lg p-8 sm:p-10">
            <h1 className="text-3xl font-extrabold mb-6 text-foreground">
              Terms of Service
            </h1>

            <p className="mb-5 text-foreground/80">
              These Terms of Service ("Terms") govern your use of{" "}
              <strong>SagePostAI</strong> ("we", "our", or "us"). By accessing or
              using our services, you agree to be bound by these Terms. If you do
              not agree, please do not use our platform.
            </p>

            <PolicySection title="1. Use of the Platform">
              <p>
                SagePostAI allows users to generate social media content using AI.
                You agree to use the platform only for lawful purposes, and not to
                misuse or exploit it for unauthorized commercial use, scraping, or
                manipulation.
              </p>
            </PolicySection>

            <PolicySection title="2. Account & Access">
              <p>
                You must be at least 13 years old to use SagePostAI. You are
                responsible for maintaining the confidentiality of your account and
                for all activities under it. We reserve the right to suspend or
                terminate accounts for violations of these Terms.
              </p>
            </PolicySection>

            <PolicySection title="3. Credit-Based System">
              <p>
                SagePostAI operates on a credit-based usage model. Once credits are
                used to generate content, they cannot be refunded or reclaimed.
                Please review our Refund Policy for full details.
              </p>
            </PolicySection>
            
            <PolicySection title="4. Intellectual Property">
              <p>
                All code, branding, and original assets are the property of
                SagePostAI. However, any content generated using your account and
                credits is fully owned by you and can be used commercially.
              </p>
            </PolicySection>

            <PolicySection title="5. Restrictions">
              <ul className="list-disc list-inside space-y-2">
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
            </PolicySection>

            <PolicySection title="6. Limitation of Liability">
              <p>
                We are not liable for any damages or losses resulting from the use
                or inability to use our services. All features are provided "as-is"
                without warranty of any kind.
              </p>
            </PolicySection>

            <PolicySection title="7. Changes to Terms">
              <p>
                SagePostAI may update these Terms as features evolve. We’ll notify
                you of major changes via email or in-app alerts. Continued use
                after updates constitutes agreement to the revised Terms.
              </p>
            </PolicySection>

            <PolicySection title="8. Contact">
              <p>
                For any legal questions or concerns, please contact us at{" "}
                <a
                  href="mailto:support@sagepostai.com"
                  className="text-primary underline"
                >
                  support@sagepostai.com
                </a>
                .
              </p>
            </PolicySection>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

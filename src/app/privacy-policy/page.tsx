
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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mb-5 text-foreground/80">
              At <strong>SagePostAI</strong>, we deeply respect your privacy. This
              Privacy Policy outlines what data we collect, how we use it, and how
              we protect your information while using our services.
            </p>

            <PolicySection title="1. Information We Collect">
              <ul className="list-disc list-inside space-y-2">
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
                  <strong>Cookies:</strong> Used to improve your experience, remember
                  sessions, and enable smooth navigation.{" "}
                  Learn more in our{" "}
                  <Link href="/cookie-policy" className="text-primary underline hover:text-primary/80">
                    Cookie Policy
                  </Link>
                  .
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="2. How We Use Your Data">
              <ul className="list-disc list-inside space-y-2">
                <li>To personalize your dashboard experience</li>
                <li>To generate and store AI-generated post content</li>
                <li>To manage subscription plans and credits</li>
                <li>
                  To send essential communications like billing, feature updates, or
                  legal notices
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="3. Data Protection & Security">
              <p>
                We use Firebase and other modern cloud infrastructure to keep your
                data secure, encrypted, and access-restricted. Only authorized
                staff (under NDA) have access to internal systems when necessary.
              </p>
            </PolicySection>

            <PolicySection title="4. Third-Party Tools">
              <p>
                We may use tools like Firebase and analytics platforms.
                These services comply with industry standards and do not collect
                personally identifiable information unless necessary for platform
                functionality.
              </p>
            </PolicySection>

            <PolicySection title="5. Your Rights">
              <ul className="list-disc list-inside space-y-2">
                <li>Access or delete your data anytime by contacting us</li>
                <li>Withdraw consent for cookies via browser settings</li>
                <li>Request data export if legally applicable</li>
              </ul>
            </PolicySection>

            <PolicySection title="6. Updates">
              <p>
                This policy may be updated periodically to reflect product
                improvements. We recommend checking back occasionally.
              </p>
            </PolicySection>

            <PolicySection title="7. Contact">
              <p>
                For any privacy-related concerns, reach out to us at{" "}
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


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

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>

            <p className="mb-5 text-foreground/80">
              At <strong>SagePostAI</strong>, we use cookies to improve your
              browsing experience and ensure the platform functions as intended.
              This Cookie Policy explains what cookies are, how we use them, and
              how you can manage them.
            </p>

            <PolicySection title="1. What Are Cookies?">
              <p>
                Cookies are small text files stored on your device when you visit a
                website. They help us remember your preferences, login sessions, and
                gather anonymized usage data to improve our service.
              </p>
            </PolicySection>

            <PolicySection title="2. Types of Cookies We Use">
              <ul className="list-disc list-inside space-y-2">
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
            </PolicySection>
            
            <PolicySection title="3. How We Use Cookies">
              <ul className="list-disc list-inside space-y-2">
                <li>To keep you logged in securely</li>
                <li>To track platform usage anonymously for analytics</li>
                <li>To store preferences across sessions</li>
                <li>To improve speed and performance</li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Managing Cookies">
              <p>
                You can disable or clear cookies at any time from your browser
                settings. Note that disabling cookies may affect your experience and
                functionality of some features on SagePostAI.
              </p>
            </PolicySection>

            <PolicySection title="5. Third-Party Cookies">
              <p>
                Some cookies may be set by trusted third-party services we use, such
                as Firebase, or analytics providers. These services follow
                strict privacy standards and do not collect personally identifiable
                information from you.
              </p>
            </PolicySection>

            <PolicySection title="6. Policy Updates">
              <p>
                We may update this Cookie Policy as our platform evolves. We
                encourage you to review this page periodically.
              </p>
            </PolicySection>

            <PolicySection title="7. Contact">
              <p>
                For any questions about this policy, please reach out to us at{" "}
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
      <Footer/>
    </div>
  );
}


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

export default function RefundPolicyPage() {
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
              Cancellation & Refund Policy
            </h1>

            <p className="mb-5 text-foreground/80">
              At <span className="font-semibold text-foreground">SagePostAI</span>, we operate on a transparent, credit-based system.
              Once credits are purchased and used to generate content, they are consumed instantly by the AI system.
              Due to this nature of immediate digital delivery,{" "}
              <span className="font-semibold text-destructive">
                we do not offer refunds
              </span>{" "}
              after a successful purchase.
            </p>
            <p className="mb-5 text-foreground/80">
              This policy ensures fairness and protects our platform from misuse — such as users consuming all available
              credits and then requesting a full refund. Our focus is on providing consistent value to serious users of the platform.
            </p>
            <p className="mb-5 text-foreground/80">
              If you experience a genuine technical issue or an error with your account, please contact our team within{" "}
              <span className="font-semibold text-foreground">3 days</span> of the transaction. In such cases, we’ll review the issue and,
              if appropriate, offer bonus credits or assistance.
            </p>
            <p className="mb-5 text-foreground/80">
              You may cancel any active subscription at any time. Your plan will remain active until the end of the current
              billing cycle, after which no further charges will occur.
            </p>
            <p className="text-foreground/80">
              If you have any questions or concerns, feel free to reach out to us at{" "}
              <a
                href="mailto:support@sagepostai.com"
                className="text-primary underline"
              >
                support@sagepostai.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

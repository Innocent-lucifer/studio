
import Link from "next/link";
import { Mail, ArrowLeft, UserRound, Briefcase, MessageSquare, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Footer from "@/components/sections/Footer";

export default function ContactPage() {
  const contactPoints = [
    {
      icon: UserRound,
      title: "Message the CEO",
      description: "For direct leadership queries, vision discussions, or serious collaborations.",
      email: "ceo@sagepostai.com"
    },
    {
      icon: Briefcase,
      title: "Partnerships & Business",
      description: "For sponsorships, integrations, brand collabs, and enterprise licensing.",
      email: "partners@sagepostai.com"
    },
    {
      icon: Mail,
      title: "Product Support",
      description: "Questions, bugs, feature requests, or anything stopping your flow?",
      email: "support@sagepostai.com"
    },
    {
      icon: CreditCard,
      title: "Refunds & Billing",
      description: "For questions about refunds, charges, or your subscription.",
      email: "refund@sagepostai.com"
    }
  ];

  return (
    <div className="text-foreground min-h-screen flex flex-col">
      <main className="flex-grow py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link href="/" passHref>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
              Contact SagePostAI
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Reach out to the right department. We're here to help, partner, and
              grow with you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {contactPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                    <Card key={index} className="bg-background border-border">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                <Icon className="w-6 h-6" />
                            </div>
                            <CardTitle>{point.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/70 mb-4">{point.description}</p>
                            <a
                                href={`mailto:${point.email}`}
                                className="font-semibold text-primary hover:underline"
                            >
                                {point.email}
                            </a>
                        </CardContent>
                    </Card>
                );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/sections/Footer";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function RefundPolicyPage() {
  const t = useTranslations('RefundPolicyPage');

  return (
    <div className="text-foreground min-h-screen flex flex-col">
      <main className="flex-grow py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/" passHref>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('backToHome')}
              </Button>
            </Link>
          </div>
          <div className="bg-background border border-border rounded-lg p-8 sm:p-10">
            <h1 className="text-3xl font-extrabold mb-6 text-foreground">
              {t('title')}
            </h1>

            <p className="mb-5 text-foreground/80">
              {t('p1.span1')}<span className="font-semibold text-foreground">{t('p1.span2')}</span>{t('p1.span3')}<span className="font-semibold text-destructive">{t('p1.span4')}</span>{t('p1.span5')}
            </p>
            <p className="mb-5 text-foreground/80">
              {t('p2')}
            </p>
            <p className="mb-5 text-foreground/80">
              {t('p3.span1')}<span className="font-semibold text-foreground">{t('p3.span2')}</span>{t('p3.span3')}
            </p>
            <p className="mb-5 text-foreground/80">
              {t('p4')}
            </p>
            <p className="text-foreground/80">
              {t('p5.span1')}
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

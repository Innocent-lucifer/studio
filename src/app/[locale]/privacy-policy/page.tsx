
"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/sections/Footer";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

const PolicySection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary">
      {title}
    </h2>
    <div className="space-y-4 text-foreground/80">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  const t = useTranslations('PrivacyPolicyPage');

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
              {t('intro')}
            </p>

            <PolicySection title={t('sections.s1.title')}>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>{t('sections.s1.item1.title')}:</strong> {t('sections.s1.item1.content')}</li>
                <li><strong>{t('sections.s1.item2.title')}:</strong> {t('sections.s1.item2.content')}</li>
                <li><strong>{t('sections.s1.item3.title')}:</strong> {t('sections.s1.item3.content.span1')}<Link href="/cookie-policy" className="text-primary underline hover:text-primary/80">{t('sections.s1.item3.content.link')}</Link>.</li>
              </ul>
            </PolicySection>

            <PolicySection title={t('sections.s2.title')}>
              <ul className="list-disc list-inside space-y-2">
                <li>{t('sections.s2.item1')}</li>
                <li>{t('sections.s2.item2')}</li>
                <li>{t('sections.s2.item3')}</li>
                <li>{t('sections.s2.item4')}</li>
              </ul>
            </PolicySection>

            <PolicySection title={t('sections.s3.title')}>
              <p>{t('sections.s3.content')}</p>
            </PolicySection>

            <PolicySection title={t('sections.s4.title')}>
              <p>{t('sections.s4.content')}</p>
            </PolicySection>

            <PolicySection title={t('sections.s5.title')}>
              <ul className="list-disc list-inside space-y-2">
                <li>{t('sections.s5.item1')}</li>
                <li>{t('sections.s5.item2')}</li>
                <li>{t('sections.s5.item3')}</li>
              </ul>
            </PolicySection>

            <PolicySection title={t('sections.s6.title')}>
              <p>{t('sections.s6.content')}</p>
            </PolicySection>

            <PolicySection title={t('sections.s7.title')}>
              <p>
                {t('sections.s7.content')}
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

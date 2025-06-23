
import React from 'react';

export default function BuiltWith() {
  const logos = [
    { name: "Next.js", dataAiHint: "nextjs logo" },
    { name: "Firebase", dataAiHint: "firebase logo" },
    { name: "Tailwind CSS", dataAiHint: "tailwind css logo" },
    { name: "Vercel", dataAiHint: "vercel logo" },
    { name: "Stripe", dataAiHint: "stripe logo" },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          BUILT WITH MODERN, RELIABLE TECHNOLOGIES
        </p>
        <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-4">
          {logos.map(logo => (
            <img 
              key={logo.name} 
              src={`https://placehold.co/120x40.png`} 
              alt={logo.name} 
              data-ai-hint={logo.dataAiHint}
              className="h-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

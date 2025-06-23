import React from 'react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section id="cta" className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to Supercharge Your Content?</h2>
        <p className="max-w-xl mx-auto mt-4 text-gray-600 mb-8">
          Join hundreds of creators and marketers who are saving time and creating better content. Get started for free today.
        </p>
        <Link href="/login" className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition">
            Start Your 3-Day Free Trial
        </Link>
      </div>
    </section>
  );
}

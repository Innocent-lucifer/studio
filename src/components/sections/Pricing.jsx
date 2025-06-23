
import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing({ plans }) {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            Simple, transparent pricing. One plan, full power. Cancel anytime.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          {plans.map(plan => (
            <div key={plan.title} className={`relative bg-white rounded-lg shadow-lg p-8 border-2 ${plan.borderClass} flex flex-col w-full max-w-md`}>
              {plan.badge && (
                <div className={`absolute top-0 -translate-y-1/2 px-4 py-1 text-sm font-semibold text-white bg-gradient-to-r ${plan.badgeClass} rounded-full`}>
                  {plan.badge}
                </div>
              )}
              <h3 className="text-2xl font-semibold mb-2">{plan.title}</h3>
              <p className="text-4xl font-bold mb-4">{plan.price}</p>
              <p className="text-gray-500 mb-6">{plan.subtitle}</p>
              <ul className="space-y-3 text-gray-700 flex-grow">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-8 w-full text-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                  Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

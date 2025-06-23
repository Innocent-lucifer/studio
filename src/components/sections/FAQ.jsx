
import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQ({ faqs, openFAQIndex, toggleFAQ }) {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold"
              >
                <span>{faq.q}</span>
                {openFAQIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              {openFAQIndex === index && (
                <div className="p-4 pt-0 text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

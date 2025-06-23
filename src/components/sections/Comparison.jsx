
import React from 'react';
import { Check, X } from 'lucide-react';

export default function Comparison() {
  const features = [
    { name: "AI-Powered Research", sage: true, others: false },
    { name: "Image-to-Content Generation", sage: true, others: false },
    { name: "Smart Campaign Builder", sage: true, others: false },
    { name: "AI-Assisted Editing", sage: true, others: true },
    { name: "Tone & Style Matching", sage: true, others: false },
    { name: "Basic Template Generation", sage: true, others: true },
  ];

  return (
    <section id="comparison" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How SagePostAI Compares</h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            We're more than just a template generator. We're your AI content co-pilot.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold text-indigo-600">SagePostAI</th>
                  <th className="p-4 text-center font-semibold">Other Tools</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.name} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                    <td className="p-4 font-medium">{feature.name}</td>
                    <td className="p-4 text-center">{feature.sage ? <Check className="w-6 h-6 text-green-500 mx-auto" /> : <X className="w-6 h-6 text-red-500 mx-auto" />}</td>
                    <td className="p-4 text-center">{feature.others ? <Check className="w-6 h-6 text-green-500 mx-auto" /> : <X className="w-6 h-6 text-red-500 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

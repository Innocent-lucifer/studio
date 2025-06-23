import React from 'react';
import { Edit, Lightbulb, Send } from 'lucide-react';

const steps = [
    { icon: Edit, title: "1. Provide Your Topic", description: "Enter a topic, paste a link, or upload an image. Give the AI your starting point." },
    { icon: Lightbulb, title: "2. Generate & Refine", description: "Instantly get post drafts. Use the AI editor to refine grammar, tone, and style." },
    { icon: Send, title: "3. Copy & Publish", description: "Your post is ready. Copy it with one click and publish to your social media platforms." }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Get Started in 3 Simple Steps</h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            Creating content with SagePostAI is designed to be intuitive and fast.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {steps.map((step, index) => (
            <div key={step.title} className="p-6">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 rounded-full mb-4">
                <step.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

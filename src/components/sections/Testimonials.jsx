
import React from 'react';

const testimonials = [
  {
    name: "Sarah L.",
    title: "Marketing Manager",
    quote: "SagePostAI has cut my content creation time in half. The AI editor is a lifesaver, and the posts actually sound like me!",
    dataAiHint: "woman portrait"
  },
  {
    name: "David C.",
    title: "Startup Founder",
    quote: "As a founder wearing multiple hats, this tool is indispensable. I can generate a week's worth of quality content in about 30 minutes.",
    dataAiHint: "man portrait"
  },
  {
    name: "Jessica P.",
    title: "Freelance Creator",
    quote: "The Smart Campaign Builder is brilliant. It helps me structure content for my clients that tells a cohesive story. Highly recommend!",
    dataAiHint: "person smiling"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by Creators & Marketers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.name} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img 
                  className="w-12 h-12 rounded-full mr-4" 
                  src="https://placehold.co/100x100.png" 
                  alt={testimonial.name}
                  data-ai-hint={testimonial.dataAiHint}
                />
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

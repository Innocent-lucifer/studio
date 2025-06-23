import React from 'react';
import { Zap, Image, ListChecks, Edit, Bot, TrendingUp } from 'lucide-react';

const features = [
    { icon: Zap, title: "Quick Post Generator", description: "Turn any topic into engaging Twitter and LinkedIn drafts in seconds." },
    { icon: Image, title: "Image-to-Post Wizard", description: "Upload an image and let AI craft a personalized post based on its content." },
    { icon: ListChecks, title: "Smart Campaign Builder", description: "Create cohesive multi-post campaigns from a single idea with strategic angles." },
    { icon: Edit, title: "AI-Powered Editor", description: "Refine your posts with one-click grammar fixes, rephrasing, and tone adjustments." },
    { icon: Bot, title: "Tone Styler", description: "Automatically match your writing style—professional, casual, or funny—for authentic content." },
    { icon: TrendingUp, title: "Visibility Booster", description: "Get optimized hashtags and emojis added to your posts to maximize reach and engagement." }
];

export default function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything You Need to Go Viral</h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            A powerful suite of AI tools designed to make content creation effortless and effective.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(feature => (
            <div key={feature.title} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
              <feature.icon className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

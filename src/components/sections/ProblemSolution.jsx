
import React from 'react';
import { Zap, Edit3 } from 'lucide-react';

export default function ProblemSolution() {
  return (
    <section id="problem" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Stop Wasting Hours on Content</h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            Writing great social media content is slow and draining. SagePostAI automates the hard parts so you can focus on what matters.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-red-50 p-8 rounded-lg border border-red-200">
            <Edit3 className="w-8 h-8 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">The Old Way: Manual & Slow</h3>
            <ul className="space-y-2 text-red-700">
              <li className="flex items-start"><span className="mr-2 mt-1">❌</span><span>Hours spent brainstorming and researching topics.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1">❌</span><span>Struggling to find the right tone and wording.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1">❌</span><span>Endless proofreading and editing cycles.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1">❌</span><span>Inconsistent posting and missed opportunities.</span></li>
            </ul>
          </div>
          <div className="bg-green-50 p-8 rounded-lg border border-green-200">
            <Zap className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">The SagePostAI Way: Fast & Smart</h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-start"><span className="mr-2 mt-1">✅</span><span>Instant content from a single topic or image.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1">✅</span><span>AI-powered tone styling and grammar correction.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1">✅</span><span>Automated research and hashtag suggestions.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1">✅</span><span>Build entire campaigns in minutes, not days.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

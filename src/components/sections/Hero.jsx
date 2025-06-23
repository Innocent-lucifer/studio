import React from 'react';
import { useRouter } from 'next/router';

export default function Hero({ inputFocused, setInputFocused, inputText, setInputText, displayText }) {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/dashboard/quick-post?topic=${encodeURIComponent(inputText)}`);
  };

  return (
    <section className="text-center py-20 px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
        Turn Your Ideas Into <span className="text-indigo-600">Scroll-Stopping</span> Posts
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
        SagePostAI uses real-time research and AI editing to write professional social media content in seconds.
      </p>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className="w-full h-14 pl-5 pr-40 rounded-full text-lg border-2 border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder={!inputFocused && !inputText ? displayText : "e.g., 'future of renewable energy'"}
          />
          <button type="submit" className="absolute top-1/2 right-2 transform -translate-y-1/2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition">
            Start Generating
          </button>
        </div>
      </form>
    </section>
  );
}

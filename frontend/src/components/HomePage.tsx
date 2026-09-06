import React from 'react';

interface HomePageProps {
  onNavigateToSearch: (initialQuery?: string) => void;
  onNavigateToAsk: (initialQuestion?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToSearch,
  onNavigateToAsk,
}) => {
  const POPULAR_TOPICS = [
    'Arrays',
    'Linked List',
    'Binary Search',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Stacks & Queues',
    'Greedy',
    'Heaps',
  ];

  const CAPABILITIES = [
    {
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: '304 Videos',
      subtitle: "Striver's A2Z DSA",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Timestamped',
      subtitle: 'Exact video segments',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'AI-Powered',
      subtitle: 'Grounded in course',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Open & Free',
      subtitle: 'For everyone',
    },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12 animate-fade-in">
      {/* Subtle Ambient Background Glow (Low-contrast, professional, pure CSS radial gradients) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Top-center hero ambient indigo/purple glow */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.2) 45%, rgba(0, 0, 0, 0) 70%)',
          }}
        />
        {/* Left middle subtle blue glow */}
        <div 
          className="absolute top-1/4 -left-48 w-[650px] h-[650px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.35) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(0, 0, 0, 0) 75%)',
          }}
        />
        {/* Right middle subtle purple glow */}
        <div 
          className="absolute top-1/2 -right-48 w-[650px] h-[650px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.15) 45%, rgba(0, 0, 0, 0) 70%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        {/* Built for learners badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-xs font-medium shadow-inner">
          <span>🎓</span>
          <span>Built for Learners</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Your DSA Study Partner
          <span className="block mt-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Search. Understand. Watch.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Get instant access to Striver's A2Z DSA course. Search for topics, or ask conceptual questions and get AI-powered explanations with exact video references.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Search Lectures CTA */}
          <button
            onClick={() => onNavigateToSearch()}
            className="w-full sm:w-auto min-w-[220px] px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 border border-indigo-400/30 transition-all duration-200 text-left flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              🔍
            </div>
            <div>
              <div className="text-base font-bold leading-tight">Search Lectures</div>
              <div className="text-xs text-indigo-200/80 font-normal">Find relevant videos</div>
            </div>
          </button>

          {/* Ask the Course CTA */}
          <button
            onClick={() => onNavigateToAsk()}
            className="w-full sm:w-auto min-w-[220px] px-6 py-4 rounded-2xl bg-[#141422] hover:bg-[#1b1b2e] text-white font-semibold border border-white/10 hover:border-purple-500/40 shadow-xl shadow-black/40 transition-all duration-200 text-left flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              💡
            </div>
            <div>
              <div className="text-base font-bold leading-tight">Ask the Course</div>
              <div className="text-xs text-gray-400 font-normal">Get AI explanations</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4 Capability Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {CAPABILITIES.map((cap, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#12121e] border border-white/5 flex items-center gap-3 hover:border-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              {cap.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{cap.title}</div>
              <div className="text-[11px] text-gray-400 truncate">{cap.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Workflow Preview (AI Explanation -> Real Lecture -> Exact Timestamp) */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#151524] to-[#0f0f18] border border-white/10 p-5 md:p-7 shadow-2xl shadow-black/50 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Core Workflow in Action
            </span>
          </div>
          <span className="text-xs text-indigo-400 font-mono">
            Search → Understand → Watch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-center">
          {/* Left panel: Sample AI Explanation */}
          <div 
            onClick={() => onNavigateToAsk("Why does Dijkstra fail with negative weights?")}
            className="p-4 rounded-xl bg-[#10101a] border border-indigo-500/20 shadow-inner space-y-2.5 cursor-pointer hover:border-indigo-500/40 transition-colors"
          >
            <div className="text-xs font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded-md inline-block">
              "Why does Dijkstra fail with negative weights?"
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>AI Explanation</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dijkstra's algorithm assumes that all edge weights are non-negative. If a negative edge exists, the greedy choice of always picking the node with the smallest tentative distance can lead to incorrect results...
            </p>
            <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-mono pt-1">
              <span className="bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                Source: G-41. Bellman Ford Algorithm
              </span>
              <span className="text-gray-500 font-sans">⏱ 02:15 - 04:22</span>
            </div>
          </div>

          {/* Right panel: Sample Video Card */}
          <div 
            onClick={() => onNavigateToSearch("Bellman Ford")}
            className="group relative rounded-xl overflow-hidden bg-black/60 border border-white/10 aspect-video cursor-pointer hover:border-indigo-500/40 transition-colors shadow-lg"
          >
            <img
              src="https://img.youtube.com/vi/0vVofAhAYjc/hqdefault.jpg"
              alt="Bellman Ford Algorithm"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Timestamp & title pill */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
              <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-white font-medium truncate max-w-[70%]">
                G-41. Bellman Ford Algorithm
              </span>
              <span className="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded text-[11px]">
                Starts at 02:15
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Topics Section */}
      <div className="space-y-3.5 text-center">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold">
          Popular Topics
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {POPULAR_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => onNavigateToSearch(topic)}
              className="px-4 py-2 rounded-xl bg-[#131320] hover:bg-[#1a1a2e] text-gray-300 hover:text-white border border-white/5 hover:border-indigo-500/30 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm hover:shadow-indigo-950/30"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Quote Banner */}
      <div className="p-5 rounded-2xl bg-[#10101b] border border-white/5 text-center max-w-2xl mx-auto">
        <p className="text-xs sm:text-sm text-gray-400 italic leading-relaxed">
          "The best way to learn DSA is to build intuition. This tool helps you connect concepts with the actual lectures."
        </p>
        <span className="block mt-2 text-xs font-semibold text-indigo-400">— Striver</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

interface AskSectionProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
}

export const AskSection: React.FC<AskSectionProps> = ({ onAsk, isLoading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (question.trim().length >= 5 && !isLoading) {
      onAsk(question.trim());
    }
  };

  const suggestions = [
    { label: "Why priority queue in Dijkstra?", topic: "Graphs" },
    { label: "Difference between BFS and DFS?", topic: "Traversals" },
    { label: "How does the sliding window technique work?", topic: "Arrays" },
    { label: "When to use dynamic programming?", topic: "DP" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Input Card with subtle glow */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 blur-md" />
        
        <div className="relative bg-[#12121c] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/40">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask any DSA concept... (e.g. 'Why does Dijkstra fail with negative weights?')"
            rows={3}
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none text-base leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[11px] font-mono text-gray-400">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[11px] font-mono text-gray-400">Enter</kbd>
              <span>to send</span>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || question.trim().length < 5}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 disabled:shadow-none transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Answer...</span>
                </>
              ) : (
                <>
                  <span>Ask Question</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="pt-2">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2.5 text-center">
          💡 Or try asking:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(item.label);
                onAsk(item.label);
              }}
              className="group flex items-center gap-2 px-3.5 py-1.5 bg-[#141420] hover:bg-[#1c1c2e] text-gray-400 hover:text-white rounded-xl border border-white/5 hover:border-indigo-500/30 text-xs transition-all duration-200"
            >
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-indigo-400 group-hover:bg-indigo-500/10">
                {item.topic}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

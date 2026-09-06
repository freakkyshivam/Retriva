import React, { useState } from 'react';
import { VideoResult } from '../api';
import { SearchLectureCard } from './SearchLectureCard';

interface SearchResultsProps {
  results: VideoResult[];
  query: string;
  isLoading: boolean;
  onSwitchToAsk?: (initialQuestion?: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  isLoading,
  onSwitchToAsk,
}) => {
  const [sortBy, setSortBy] = useState<'relevance' | 'score'>('relevance');

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-300 text-sm font-medium">Finding relevant lectures & segments...</p>
        <p className="text-gray-500 text-xs">Analyzing 304 videos & 3,599 timestamped chunks</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-14 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto">
          🔍
        </div>
        <div>
          <h4 className="text-base font-bold text-white mb-1">No relevant lectures found</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            We couldn't find matching clips for "{query}". Try checking your spelling or searching for broad algorithm names.
          </p>
        </div>

        {onSwitchToAsk && (
          <div className="pt-2">
            <button
              onClick={() => onSwitchToAsk(query)}
              className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>💡</span>
              <span>Ask the AI Course Assistant instead</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Results Header with Count and Sort */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Search Results</span>
          <span className="text-gray-500 font-mono">({results.length})</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <span>Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'score')}
              className="bg-[#12121c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="score">Highest Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lectures List */}
      <div className="space-y-3.5">
        {results.map((video, idx) => (
          <SearchLectureCard
            key={video.videoId}
            video={video}
            rank={idx + 1}
            isBestMatch={idx === 0}
          />
        ))}
      </div>

      {/* Bottom helper prompt */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#10101b] border border-white/5 text-center space-y-2 mt-8">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-300">
          <span>💡</span>
          <span>Not finding what you're looking for?</span>
        </div>
        <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
          Try different keywords or check out the Ask section to ask a direct conceptual question and get a synthesized answer with video timestamps.
        </p>
        {onSwitchToAsk && (
          <div className="pt-1">
            <button
              onClick={() => onSwitchToAsk(query)}
              className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ask the course: "{query}"</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

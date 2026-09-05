import { useState } from 'react';
import { VideoResult } from '../api';
import { ChunkCard } from './ChunkCard';

export const VideoCard: React.FC<{ result: VideoResult; rank: number }> = ({ result, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const chunksToShow = expanded ? result.chunks : result.chunks.slice(0, 1);

  let scoreBadge = 'from-gray-600 to-gray-700';
  if (result.bestScore > 0.6) scoreBadge = 'from-emerald-600 to-emerald-700';
  else if (result.bestScore > 0.45) scoreBadge = 'from-amber-600 to-amber-700';

  return (
    <div className="bg-[#12121a] rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300 shadow-xl shadow-black/20">
      {/* Video Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${scoreBadge} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {rank}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white leading-snug mb-1.5">
              {result.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{(result.bestScore * 100).toFixed(0)}% relevance</span>
              <span>·</span>
              <span>{result.chunks.length} matching segment{result.chunks.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chunks */}
      <div className="px-5 pb-4 space-y-3">
        {chunksToShow.map((chunk, idx) => (
          <ChunkCard key={idx} {...chunk} videoId={result.videoId} />
        ))}
      </div>

      {/* Expand Button */}
      {result.chunks.length > 1 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 border-t border-white/5 transition-colors"
        >
          {expanded ? '↑ Show less' : `↓ Show ${result.chunks.length - 1} more segment${result.chunks.length - 1 > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

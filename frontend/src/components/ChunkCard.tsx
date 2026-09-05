import { useState } from 'react';
import { ChunkResult } from '../api';

interface ChunkCardProps extends ChunkResult {
  videoId: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ChunkCard: React.FC<ChunkCardProps> = ({ start, end, text, score, timestampUrl, videoId }) => {
  const [showVideo, setShowVideo] = useState(false);
  const truncatedText = text.length > 400 ? text.slice(0, 400) + '...' : text;
  const startSeconds = Math.floor(start);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startSeconds}&autoplay=1`;

  let scoreBg = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  if (score > 0.6) scoreBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  else if (score > 0.45) scoreBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
            {formatTime(start)} → {formatTime(end)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreBg}`}>
            {(score * 100).toFixed(0)}% match
          </span>
        </div>
      </div>

      {/* Transcript Text */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{truncatedText}</p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowVideo(!showVideo)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            showVideo
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
          }`}
        >
          {showVideo ? '✕ Close' : '▶ Watch here'}
        </button>
        <a
          href={timestampUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-gray-300 transition-all"
        >
          ↗ YouTube
        </a>
      </div>

      {/* Embedded YouTube Player */}
      {showVideo && (
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

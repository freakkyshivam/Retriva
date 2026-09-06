import React, { useState } from 'react';
import { VideoResult, ChunkResult } from '../api';

interface SearchLectureCardProps {
  video: VideoResult;
  rank: number;
  isBestMatch?: boolean;
  onPlayTimestamp?: (chunk: ChunkResult) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SearchLectureCard: React.FC<SearchLectureCardProps> = ({
  video,
  rank,
  isBestMatch = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isBestMatch);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChunk, setActiveChunk] = useState<ChunkResult | null>(
    video.chunks?.[0] || null
  );

  const matchPercent = Math.min(99, Math.max(55, Math.round(video.bestScore * 100)));

  // Calculate approximate duration / timestamp range from chunks
  const minStart = video.chunks?.length ? Math.min(...video.chunks.map(c => c.start)) : 0;
  const maxEnd = video.chunks?.length ? Math.max(...video.chunks.map(c => c.end)) : 0;
  const timeRangeLabel = video.chunks?.length 
    ? `${formatTime(minStart)} - ${formatTime(maxEnd)}`
    : 'Full Video';

  // Extract a clean 1-2 line summary from the top chunk or title
  const cleanSummary = video.chunks?.[0]?.text 
    ? video.chunks[0].text.replace(/\s+/g, ' ').slice(0, 140) + '...'
    : 'Comprehensive course lecture covering concepts, intuition, and step-by-step implementation.';

  const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  const startSeconds = activeChunk ? Math.floor(activeChunk.start) : 0;
  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?start=${startSeconds}&autoplay=1`;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isBestMatch
          ? 'bg-[#12121f] border-indigo-500/40 shadow-xl shadow-indigo-950/20'
          : 'bg-[#11111a] border-white/5 hover:border-white/10 shadow-lg'
      }`}
    >
      {/* Main Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Left Badges & Thumbnail */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Rank Number badge */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                isBestMatch
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              {rank}
            </span>
            {isBestMatch && (
              <span className="hidden sm:inline-block text-[9px] font-semibold text-indigo-300 uppercase tracking-wider bg-indigo-950/70 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                ⭐ Best
              </span>
            )}
          </div>

          {/* Thumbnail with duration */}
          <div
            onClick={() => {
              setIsPlaying(!isPlaying);
              setIsExpanded(true);
            }}
            className="group relative w-32 sm:w-36 aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 cursor-pointer shadow-inner"
          >
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Time pill */}
            <div className="absolute bottom-1.5 right-1.5 bg-black/85 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-300">
              {formatTime(maxEnd || 1200)}
            </div>
          </div>
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {isBestMatch && (
              <span className="sm:hidden text-[10px] font-semibold text-indigo-300 uppercase tracking-wider bg-indigo-950 border border-indigo-500/30 px-2 py-0.5 rounded">
                ⭐ Best Match
              </span>
            )}
            <h4
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm sm:text-base font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer leading-snug truncate"
              title={video.title}
            >
              {video.title}
            </h4>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {cleanSummary}
          </p>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 bg-white/5 text-gray-300 px-2 py-0.5 rounded-md border border-white/5">
              <span>🕒</span>
              <span>{timeRangeLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/5 text-gray-400 px-2 py-0.5 rounded-md border border-white/5">
              <span>📄</span>
              <span>{video.chunks?.length || 0} relevant segments</span>
            </span>
            {video.noTranscript && (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                <span>⚠️</span>
                <span>No transcript</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Match Badge & Toggle Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {matchPercent}% match
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide clips' : 'View clips'}</span>
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▾
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Segment Drawer / Video Player */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-[#0b0b12] p-4 sm:p-5 space-y-4">
          {/* Embedded Player if toggled */}
          {isPlaying && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <span>⏱</span>
              <span>Matching Segments ({video.chunks?.length || 0})</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isPlaying ? '⏸ Hide Player' : '▶ Play In-Browser'}</span>
              </button>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex items-center gap-1"
              >
                <span>YouTube</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Chunks List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {video.chunks?.map((chunk, idx) => {
              const isSelected = activeChunk?.start === chunk.start;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveChunk(chunk);
                    setIsPlaying(true);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-indigo-300 font-semibold flex items-center gap-1">
                      <span>▶</span>
                      <span>{formatTime(chunk.start)} → {formatTime(chunk.end)}</span>
                    </span>
                    <span className="text-gray-500">
                      Score: {(chunk.score * 100).toFixed(0)}%
                    </span>
                  </div>

                  {chunk.text && (
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      "{chunk.text.trim()}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

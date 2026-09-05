import React, { useState, useEffect } from 'react';
import { VideoResult } from '../api';

interface ActiveClip {
  videoId: string;
  title: string;
  start: number;
  end: number;
  text?: string;
  timestampUrl?: string;
}

interface VideoPlayerPanelProps {
  videos: VideoResult[];
  isLoading: boolean;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const VideoPlayerPanel: React.FC<VideoPlayerPanelProps> = ({ videos, isLoading }) => {
  const [activeClip, setActiveClip] = useState<ActiveClip | null>(null);
  const [isPlayerMounted, setIsPlayerMounted] = useState(false);

  // Set default clip when new video results arrive (without auto-playing)
  useEffect(() => {
    if (videos.length > 0 && videos[0]?.chunks?.[0]) {
      const firstVid = videos[0];
      const firstChunk = firstVid.chunks[0];
      setActiveClip({
        videoId: firstVid.videoId,
        title: firstVid.title,
        start: firstChunk.start,
        end: firstChunk.end,
        text: firstChunk.text,
        timestampUrl: firstChunk.timestampUrl
      });
      // Do not auto-mount/auto-play on new query; wait for user to click
      setIsPlayerMounted(false);
    }
  }, [videos]);

  if (isLoading) {
    return (
      <div className="bg-[#11111a] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-gray-300 text-sm font-medium">Finding matching course segments...</p>
        <p className="text-gray-500 text-xs mt-1">Analyzing timestamps & lectures</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-[#11111a] border border-white/5 rounded-2xl p-8 text-center min-h-[320px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-3">
          📹
        </div>
        <h4 className="text-gray-200 font-semibold mb-1">No Matching Videos</h4>
        <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
          Try searching for another topic like "Binary Search", "Graphs", or "Kadane's Algorithm".
        </p>
      </div>
    );
  }

  const startSeconds = activeClip ? Math.floor(activeClip.start) : 0;
  // Strictly no autoplay
  const embedUrl = activeClip 
    ? `https://www.youtube.com/embed/${activeClip.videoId}?start=${startSeconds}&autoplay=0` 
    : '';

  const thumbnailUrl = activeClip 
    ? `https://img.youtube.com/vi/${activeClip.videoId}/hqdefault.jpg` 
    : '';

  return (
    <div className="space-y-4">
      {/* Video Player Card */}
      <div className="bg-[#12121c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Screen Area */}
        <div className="relative w-full aspect-video bg-black/60 overflow-hidden">
          {activeClip ? (
            isPlayerMounted ? (
              <iframe
                key={`${activeClip.videoId}-${startSeconds}`}
                className="w-full h-full"
                src={embedUrl}
                title={activeClip.title}
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Thumbnail preview with user-initiated play */
              <div 
                onClick={() => setIsPlayerMounted(true)}
                className="relative w-full h-full cursor-pointer group"
              >
                <img 
                  src={thumbnailUrl} 
                  alt={activeClip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Big Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 group-hover:scale-110 transition-all duration-200">
                    <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Jump Timestamp Pill on Image */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Starts at {formatTime(activeClip.start)}</span>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Select a segment to load
            </div>
          )}
        </div>

        {/* Player Header & Info */}
        {activeClip && (
          <div className="p-4 bg-[#151522] border-t border-white/5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                  {activeClip.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mt-1">
                  <span>⏱ Segment: {formatTime(activeClip.start)} → {formatTime(activeClip.end)}</span>
                </div>
              </div>

              {activeClip.timestampUrl && (
                <a
                  href={activeClip.timestampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-2.5 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                  title="Open in YouTube"
                >
                  <span>YouTube</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Transcript Snippet under active video */}
            {activeClip.text && (
              <p className="text-xs text-gray-400 line-clamp-2 italic bg-black/20 p-2 rounded-lg border border-white/5">
                "{activeClip.text.trim()}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Playlist Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <span>📚</span>
          <span>Course Lectures ({videos.length})</span>
        </h4>
        <span className="text-[11px] text-gray-500 font-mono">
          Click any clip to switch
        </span>
      </div>

      {/* Course Lectures List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {videos.map((video, vIdx) => {
          const isCurrentVideo = activeClip?.videoId === video.videoId;

          return (
            <div
              key={video.videoId}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isCurrentVideo
                  ? 'bg-[#151525] border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  : 'bg-[#11111a] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Lecture Card Header */}
              <div className="p-3.5 bg-white/[0.02] border-b border-white/5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                    {vIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {video.title}
                    </h5>
                    {video.noTranscript ? (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
                        <span>⚠️</span>
                        <span>Transcript not available</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-500">
                        {video.chunks.length} matching segment{video.chunks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {video.noTranscript ? (
                  <span className="flex-shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    Video Only
                  </span>
                ) : (
                  <span className="flex-shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {(video.bestScore * 100).toFixed(0)}% match
                  </span>
                )}
              </div>

              {/* Segments or Watch-Only Actions */}
              <div className="p-2 space-y-1.5">
                {video.noTranscript ? (
                  /* No transcript — show Watch on YouTube action */
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center space-y-2">
                    <p className="text-[11px] text-amber-300/80 leading-relaxed">
                      This video's transcript wasn't available for indexing. You can still watch it directly.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setActiveClip({
                            videoId: video.videoId,
                            title: video.title,
                            start: 0,
                            end: 0,
                            text: '(Transcript not available for this video)',
                            timestampUrl: video.url
                          });
                          setIsPlayerMounted(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition-colors"
                      >
                        ▶ Play Here
                      </button>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
                      >
                        <span>YouTube</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Normal segments */
                  video.chunks.map((chunk, cIdx) => {
                    const isCurrentChunk = 
                      isCurrentVideo && 
                      activeClip?.start === chunk.start;

                    return (
                      <button
                        key={cIdx}
                        onClick={() => {
                          setActiveClip({
                            videoId: video.videoId,
                            title: video.title,
                            start: chunk.start,
                            end: chunk.end,
                            text: chunk.text,
                            timestampUrl: chunk.timestampUrl
                          });
                          setIsPlayerMounted(true);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border ${
                          isCurrentChunk
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                            : 'bg-white/[0.01] hover:bg-white/[0.04] border-transparent text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className={isCurrentChunk ? 'text-indigo-400 font-bold' : 'text-gray-500'}>
                              {isCurrentChunk ? '▶' : '⏱'}
                            </span>
                            <span className={isCurrentChunk ? 'text-indigo-300 font-semibold' : 'text-gray-400'}>
                              {formatTime(chunk.start)} → {formatTime(chunk.end)}
                            </span>
                          </div>

                          <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                            isCurrentChunk 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-gray-500'
                          }`}>
                            {isCurrentChunk ? 'Selected' : 'Jump'}
                          </span>
                        </div>

                        {chunk.text && (
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed text-left">
                            {chunk.text.trim()}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

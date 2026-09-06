import React, { useState, useEffect } from 'react';
import { VideoResult, Source, ChunkResult } from '../api';

interface AskLectureReferencePanelProps {
  videos: VideoResult[];
  sources: Source[];
  isLoading: boolean;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const AskLectureReferencePanel: React.FC<AskLectureReferencePanelProps> = ({
  videos,
  sources: _sources,
  isLoading,
}) => {
  const [activeVideo, setActiveVideo] = useState<VideoResult | null>(null);
  const [activeStartTime, setActiveStartTime] = useState<number>(0);
  const [activeSnippet, setActiveSnippet] = useState<string>('');
  const [isPlayerMounted, setIsPlayerMounted] = useState<boolean>(false);
  const [showAllLectures, setShowAllLectures] = useState<boolean>(false);
  const [showAllSegments, setShowAllSegments] = useState<boolean>(false);

  // Sync active video whenever new videos or sources arrive
  useEffect(() => {
    if (videos.length > 0) {
      const topVid = videos[0];
      setActiveVideo(topVid);
      const firstChunk = topVid.chunks?.[0];
      setActiveStartTime(firstChunk ? Math.floor(firstChunk.start) : 0);
      setActiveSnippet(firstChunk?.text || '');
      setIsPlayerMounted(false);
    }
  }, [videos]);

  if (isLoading) {
    return (
      <div className="bg-[#11111a] border border-white/10 rounded-2xl p-8 text-center space-y-3 min-h-[360px] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-300 text-sm font-medium">Retrieving course video references...</p>
        <p className="text-gray-500 text-xs">Matching transcripts & timestamps</p>
      </div>
    );
  }

  if (!activeVideo && videos.length === 0) {
    return (
      <div className="bg-[#11111a] border border-white/5 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center space-y-2">
        <div className="text-3xl">📹</div>
        <p className="text-gray-300 text-sm font-semibold">No Video References Available</p>
        <p className="text-gray-500 text-xs max-w-xs">Ask a question to see supporting course lectures.</p>
      </div>
    );
  }

  const currentVid = activeVideo || videos[0];
  const thumbnailUrl = `https://img.youtube.com/vi/${currentVid.videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${currentVid.videoId}?start=${activeStartTime}&autoplay=1`;

  // Aggregate all chunks across videos for referenced segments
  const allSegments: Array<{
    videoId: string;
    videoTitle: string;
    chunk: ChunkResult;
  }> = [];

  videos.forEach(v => {
    v.chunks?.forEach(c => {
      allSegments.push({
        videoId: v.videoId,
        videoTitle: v.title,
        chunk: c,
      });
    });
  });

  const displayedLectures = showAllLectures ? videos : videos.slice(0, 3);
  const displayedSegments = showAllSegments ? allSegments : allSegments.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 1. Main Video Preview / Player Card */}
      <div className="bg-[#12121c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="relative w-full aspect-video bg-black/60 overflow-hidden">
          {isPlayerMounted ? (
            <iframe
              key={`${currentVid.videoId}-${activeStartTime}`}
              className="w-full h-full"
              src={embedUrl}
              title={currentVid.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              onClick={() => setIsPlayerMounted(true)}
              className="relative w-full h-full cursor-pointer group"
            >
              <img
                src={thumbnailUrl}
                alt={currentVid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-indigo-600 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 group-hover:scale-110 transition-all duration-200">
                  <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Timestamp on thumbnail */}
              <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Starts at {formatTime(activeStartTime)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Metadata Header */}
        <div className="p-4 bg-[#151522] border-t border-white/5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white leading-snug truncate" title={currentVid.title}>
                {currentVid.title}
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Striver's A2Z DSA · Grounded Lecture Reference
              </p>
            </div>

            <a
              href={`${currentVid.url}&t=${activeStartTime}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-2.5 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>YouTube</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {activeSnippet && (
            <p className="text-xs text-gray-400 line-clamp-2 italic bg-black/20 p-2.5 rounded-lg border border-white/5">
              "{activeSnippet.trim()}"
            </p>
          )}
        </div>
      </div>

      {/* 2. Relevant Course Lectures Card */}
      <div className="rounded-2xl bg-[#11111a] border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <span>📚</span>
            <span>Relevant Course Lectures ({videos.length})</span>
          </h4>
          {videos.length > 3 && (
            <button
              onClick={() => setShowAllLectures(!showAllLectures)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {showAllLectures ? 'Show less' : 'See all'}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {displayedLectures.map((video, idx) => {
            const isSelected = currentVid.videoId === video.videoId;
            const matchScore = Math.min(99, Math.max(55, Math.round(video.bestScore * 100)));

            return (
              <div
                key={video.videoId}
                onClick={() => {
                  setActiveVideo(video);
                  const firstChunk = video.chunks?.[0];
                  setActiveStartTime(firstChunk ? Math.floor(firstChunk.start) : 0);
                  setActiveSnippet(firstChunk?.text || '');
                  setIsPlayerMounted(true);
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-white shadow-sm'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-white/5 font-mono text-[11px] font-bold flex items-center justify-center text-gray-400 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate text-xs" title={video.title}>
                      {video.title}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {video.chunks?.[0]?.text?.slice(0, 50) || 'Relevant topic clip'}...
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                  {matchScore}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Referenced Segments List */}
      {allSegments.length > 0 && (
        <div className="rounded-2xl bg-[#11111a] border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <span>🕒</span>
              <span>Referenced Segments ({allSegments.length})</span>
            </h4>
            {allSegments.length > 5 && (
              <button
                onClick={() => setShowAllSegments(!showAllSegments)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {showAllSegments ? 'Show less' : 'See all'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {displayedSegments.map((item, idx) => {
              const isSelected =
                currentVid.videoId === item.videoId &&
                activeStartTime === Math.floor(item.chunk.start);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    const targetVid = videos.find(v => v.videoId === item.videoId) || currentVid;
                    setActiveVideo(targetVid);
                    setActiveStartTime(Math.floor(item.chunk.start));
                    setActiveSnippet(item.chunk.text || '');
                    setIsPlayerMounted(true);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-white shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/5 flex-shrink-0">
                      {formatTime(item.chunk.start)} - {formatTime(item.chunk.end)}
                    </span>
                    <span className="text-gray-300 truncate font-sans text-xs">
                      {item.chunk.text?.slice(0, 45) || item.videoTitle}...
                    </span>
                  </div>

                  <span className="text-indigo-400 hover:text-indigo-300 text-xs flex-shrink-0">
                    ▶
                  </span>
                </div>
              );
            })}

            {!showAllSegments && allSegments.length > 5 && (
              <button
                onClick={() => setShowAllSegments(true)}
                className="w-full py-1.5 text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
              >
                +{allSegments.length - 5} more segments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

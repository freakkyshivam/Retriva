import React, { useState } from 'react';
import { Source } from '../api';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SourceCard: React.FC<{ source: Source }> = ({ source }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const startSeconds = Math.floor(source.start);
  const embedUrl = `https://www.youtube.com/embed/${source.videoId}?start=${startSeconds}&autoplay=1`;
  const thumbnailUrl = `https://img.youtube.com/vi/${source.videoId}/hqdefault.jpg`;

  return (
    <div className="bg-[#13131e] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 shadow-lg shadow-black/30 group">
      {/* Video Container / Thumbnail Preview */}
      <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
        {isPlaying ? (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={source.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div 
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer overflow-hidden group/thumb"
          >
            <img 
              src={thumbnailUrl} 
              alt={source.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-90 group-hover/thumb:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/90 group-hover/thumb:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 group-hover/thumb:scale-110 transition-all duration-200">
                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            {/* Timestamp Badge over Thumbnail */}
            <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 text-xs font-mono text-indigo-300">
              ▶ Starts at {formatTime(source.start)}
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4">
        <h5 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
          {source.title}
        </h5>
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <span className="text-gray-400 font-mono">
            Segment: {formatTime(source.start)} → {formatTime(source.end)}
          </span>

          <a
            href={source.timestampUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            YouTube
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

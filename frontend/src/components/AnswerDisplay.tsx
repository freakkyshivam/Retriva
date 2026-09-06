import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Source } from '../api';

interface AnswerDisplayProps {
  answer: string;
  sources: Source[];
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, sources }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Grounded Explanation Card */}
      <div className="bg-[#11111a] rounded-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#161622] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wide text-white flex items-center gap-2">
              <span>Grounded Explanation</span>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Striver's Course Transcripts
              </span>
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted Content */}
        <div className="p-5 sm:p-7 text-gray-200 space-y-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <div className="pt-2 pb-1 border-b border-white/10 mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                    {children}
                  </h3>
                </div>
              ),
              h2: ({ children }) => {
                const text = String(children).toLowerCase();
                const isShortAnswer = text.includes('short') || text.includes('summary');
                const isKeyTakeaway = text.includes('takeaway') || text.includes('key');

                return (
                  <div className="pt-3 pb-1 mb-2">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
                      <span>{isShortAnswer ? '⚡' : isKeyTakeaway ? '📌' : '📖'}</span>
                      <span className={isShortAnswer ? 'text-indigo-300' : isKeyTakeaway ? 'text-emerald-300' : 'text-gray-300'}>
                        {children}
                      </span>
                    </h4>
                  </div>
                );
              },
              h3: ({ children }) => (
                <h5 className="text-sm font-semibold text-indigo-300 mt-3 mb-1.5">
                  {children}
                </h5>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 leading-relaxed text-sm mb-3.5">
                  {children}
                </p>
              ),
              ol: ({ children }) => (
                <div className="space-y-2.5 my-3">
                  {children}
                </div>
              ),
              ul: ({ children }) => (
                <div className="space-y-2 my-3">
                  {children}
                </div>
              ),
              li: ({ children, ...props }: any) => {
                const isOrdered = props.index !== undefined;
                if (isOrdered) {
                  return (
                    <div className="p-3 rounded-xl bg-[#141422] border border-white/5 flex items-start gap-3 text-xs sm:text-sm">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-300 font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {props.index + 1}
                      </span>
                      <div className="flex-1 text-gray-300 leading-relaxed">
                        {children}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-2.5 rounded-xl bg-[#141422]/70 border border-white/5 flex items-start gap-2.5 text-xs sm:text-sm">
                    <span className="text-emerald-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                    <div className="text-gray-300 leading-relaxed">{children}</div>
                  </div>
                );
              },
              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <div className="border-l-3 border-indigo-500 bg-indigo-950/20 px-4 py-3 my-3 rounded-r-xl text-indigo-200 text-xs sm:text-sm leading-relaxed">
                  {children}
                </div>
              ),
              code: ({ className, children, ...props }) => {
                const isInline = !className && typeof children === 'string' && !children.includes('\n');
                if (isInline) {
                  return (
                    <code className="bg-indigo-950/70 text-indigo-300 font-mono text-xs px-2 py-0.5 rounded-md border border-indigo-500/30">
                      {children}
                    </code>
                  );
                }
                return (
                  <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d15]">
                    <pre className="p-3.5 overflow-x-auto text-xs font-mono text-indigo-200">
                      <code {...props}>{children}</code>
                    </pre>
                  </div>
                );
              },
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>

        {/* Referenced Course Sources */}
        {sources && sources.length > 0 && (
          <div className="px-5 py-3 bg-[#0d0d15] border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium flex items-center gap-1 text-[11px]">
              <span>🔗</span>
              <span>Cited Sources:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.timestampUrl || src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-indigo-200 border border-white/5 transition-colors font-mono text-[11px] truncate max-w-[200px]"
                  title={src.title}
                >
                  {src.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

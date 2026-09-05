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
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* Answer Container */}
      <div className="bg-[#11111a] rounded-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#161622] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-bold">
                Grounded Explanation
              </span>
              <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                Striver's Course Transcripts
              </span>
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Copied!</span>
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

        {/* Markdown Rendered Content */}
        <div className="p-6 md:p-8 text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-white mb-4 mt-6 pb-2 border-b border-white/10">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-indigo-300 mb-3 mt-6 pb-1 border-b border-white/5 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-purple-300 mb-2 mt-4">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 text-sm md:text-base ml-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300 text-sm md:text-base ml-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">
                  <span className="text-gray-300">{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-indigo-200 not-italic font-medium">
                  {children}
                </em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-500/50 bg-indigo-950/20 px-4 py-2 my-4 rounded-r-xl text-indigo-200/90 italic text-sm">
                  {children}
                </blockquote>
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
                  <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d15]">
                    <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-indigo-200">
                      <code {...props}>{children}</code>
                    </pre>
                  </div>
                );
              },
              table: ({ children }) => (
                <div className="my-6 overflow-x-auto rounded-xl border border-white/10 shadow-lg shadow-black/20">
                  <table className="w-full text-left text-sm border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#1b1b2a] text-xs uppercase tracking-wider text-indigo-300 border-b border-white/10">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-white/5 bg-[#12121c]">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-white/[0.03] transition-colors">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3.5 font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3.5 text-gray-300 leading-relaxed align-top">
                  {children}
                </td>
              ),
              hr: () => (
                <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              )
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>
      </div>

      {/* Compact Citations Bar */}
      {sources && sources.length > 0 && (
        <div className="bg-[#11111a] border border-white/5 rounded-xl p-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium mr-1 flex items-center gap-1.5">
            <span>📚</span>
            <span>Citations:</span>
          </span>
          {sources.map((s, idx) => (
            <span
              key={idx}
              className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-gray-300 font-medium truncate max-w-xs"
              title={s.title}
            >
              {s.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

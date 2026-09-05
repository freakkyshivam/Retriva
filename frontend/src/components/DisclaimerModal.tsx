import React, { useEffect } from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#11111c] border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden z-10">
        {/* Header Ribbon */}
        <div className="px-6 py-5 bg-[#161626] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400">
              ⚖️
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Educational Disclaimer & Developer Info
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Project Background & Attribution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-lg"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-gray-300 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Educational Disclaimer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <span>📖</span>
              <span>Educational Purpose & Fair Use</span>
            </div>
            <div className="bg-[#151524] border border-white/5 rounded-2xl p-4 leading-relaxed text-xs sm:text-sm text-gray-300 space-y-2.5">
              <p>
                This project was designed and developed by <strong className="text-white">Shivam Chaudhary</strong> strictly for <strong className="text-white">educational and personal learning purposes</strong> to solve the real-world challenge of navigating hundreds of hours of DSA lectures.
              </p>
              <p>
                All course lectures, transcripts, problem structures, and video explanations referenced in this application belong entirely to their original author and copyright holder, <strong className="text-indigo-300">Striver (Raj Vikramaditya / takeUforward)</strong>.
              </p>
              <p className="text-gray-400 text-xs">
                This application does not host, re-upload, or monetize any video content. All video clips are embedded via YouTube's official player API with direct attribution and links back to the original YouTube playlist.
              </p>
            </div>
          </div>

          {/* Section 2: Developer Info Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
              <span>👨‍💻</span>
              <span>Developer Information</span>
            </div>

            <div className="bg-gradient-to-br from-[#18182b] to-[#12121f] border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-lg shadow-purple-950/10">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-indigo-600/30">
                  SC
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Shivam Chaudhary</h4>
                  <p className="text-xs text-gray-400">Software Developer · DSA & Systems Enthusiast</p>
                </div>
              </div>

              {/* Developer Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                {/* Portfolio */}
                <a
                  href="https://shivam-dev.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🌐</span>
                    <div>
                      <div className="text-[11px] text-gray-400">Portfolio</div>
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        shivam-dev.in
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/freakkyshivam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <div>
                      <div className="text-[11px] text-gray-400">GitHub</div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                        @freakkyshivam
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Tech Architecture */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <span>Tech: Qdrant Vector DB · Groq LLM · React + TypeScript</span>
            <span className="font-mono text-[11px] text-gray-500">v1.2 · MIT License</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#141422] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

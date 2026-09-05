import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { AskSection } from './components/AskSection';
import { AnswerDisplay } from './components/AnswerDisplay';
import { VideoPlayerPanel } from './components/VideoPlayerPanel';
import { TopicFilter } from './components/TopicFilter';
import { DisclaimerModal } from './components/DisclaimerModal';
import { searchCourse, askQuestion, VideoResult, AskResponse } from './api';

type Mode = 'search' | 'ask';

function App() {
  const [mode, setMode] = useState<Mode>('search');
  const [isSearching, setIsSearching] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuery, setCurrentQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Unified executor: loads BOTH the AI explanation (left) and matching videos (right)
  const executeQuery = async (query: string) => {
    if (!query.trim()) return;
    setError(null);
    setCurrentQuery(query);
    setHasSearched(true);
    setIsSearching(true);
    setIsAiLoading(true);
    setAskResponse(null);
    setSearchResults([]);

    // Concurrently fetch video results and AI answer
    const videoPromise = searchCourse(query)
      .then(res => {
        setSearchResults(res.results);
      })
      .catch(err => {
        console.error("Video search error:", err);
      })
      .finally(() => {
        setIsSearching(false);
      });

    const aiPromise = askQuestion(query)
      .then(res => {
        setAskResponse(res);
      })
      .catch(err => {
        console.error("AI answer error:", err);
      })
      .finally(() => {
        setIsAiLoading(false);
      });

    try {
      await Promise.allSettled([videoPromise, aiPromise]);
    } catch {
      setError('Something went wrong fetching results. Please ensure your backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-gray-200 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400/30 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-white/80 hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Top Navbar / Header */}
      <header className="border-b border-white/5 bg-[#0e0e17]/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/20">
              D
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">DSA Course Intelligence</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Striver's A2Z DSA · 304 Videos · 3,599 Timestamp Chunks</p>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher Pills */}
            <div className="flex bg-[#161624] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setMode('search')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'search'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🔍 Search
              </button>
              <button
                onClick={() => setMode('ask')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'ask'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                💡 Ask
              </button>
            </div>

            {/* Disclaimer & Info Button */}
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
              title="About Project & Developer"
            >
              <span>⚖️</span>
              <span className="hidden sm:inline">About & Disclaimer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Query Bar Section */}
      <section className="pt-6 pb-4 px-4 bg-gradient-to-b from-[#0e0e17]/50 to-transparent">
        <div className="max-w-4xl mx-auto space-y-3">
          {mode === 'search' ? (
            <div>
              <SearchBar 
                onSearch={executeQuery} 
                isLoading={isSearching || isAiLoading} 
                placeholder="Search DSA topics... (e.g. 'Dijkstra', 'Kadane', 'Linked List Cycle')" 
              />
              <TopicFilter onTopicSearch={executeQuery} />
            </div>
          ) : (
            <AskSection 
              onAsk={executeQuery} 
              isLoading={isSearching || isAiLoading} 
            />
          )}
        </div>
      </section>

      {/* Main Content Area: Split-Screen Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {hasSearched ? (
          <div className="space-y-4">
            {/* Search Query Pill */}
            <div className="flex items-center justify-between px-1 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span>Showing intelligence for:</span>
                <span className="font-semibold text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  "{currentQuery}"
                </span>
              </div>
              {(isSearching || isAiLoading) && (
                <div className="flex items-center gap-2 text-indigo-400 font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                  <span>Analyzing course materials...</span>
                </div>
              )}
            </div>

            {/* Side-by-Side Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: AI Grounded Answer */}
              <div className="lg:col-span-7">
                {isAiLoading ? (
                  <div className="bg-[#11111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                    {/* Header shimmer bar */}
                    <div className="px-6 py-4 bg-[#161622] border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-indigo-300 animate-pulse">
                          Synthesizing Explanation from Transcripts...
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        Analyzing DSA Materials
                      </span>
                    </div>

                    {/* Shimmer skeleton lines */}
                    <div className="p-6 md:p-8 space-y-4 animate-pulse">
                      <div className="h-5 bg-white/10 rounded-lg w-2/5" />
                      <div className="space-y-2.5 pt-2">
                        <div className="h-3.5 bg-white/5 rounded-md w-full" />
                        <div className="h-3.5 bg-white/5 rounded-md w-11/12" />
                        <div className="h-3.5 bg-white/5 rounded-md w-4/5" />
                      </div>

                      {/* Mock Table / Step Skeleton */}
                      <div className="pt-3">
                        <div className="h-4 bg-white/10 rounded w-1/4 mb-3" />
                        <div className="rounded-xl border border-white/5 bg-[#0e0e16] p-4 space-y-2.5">
                          <div className="h-3 bg-white/10 rounded w-full" />
                          <div className="h-3 bg-white/5 rounded w-5/6" />
                          <div className="h-3 bg-white/5 rounded w-3/4" />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="h-3.5 bg-white/5 rounded-md w-9/12" />
                        <div className="h-3.5 bg-white/5 rounded-md w-10/12" />
                      </div>
                    </div>
                  </div>
                ) : askResponse ? (
                  <AnswerDisplay 
                    answer={askResponse.answer} 
                    sources={askResponse.sources} 
                  />
                ) : (
                  <div className="bg-[#11111a] border border-white/5 rounded-2xl p-8 text-center text-gray-500 text-sm">
                    No answer synthesized yet. Try entering a query above.
                  </div>
                )}
              </div>

              {/* Right Column: In-Browser Video Player & Matching Clips */}
              <div className="lg:col-span-5">
                <VideoPlayerPanel 
                  videos={searchResults} 
                  isLoading={isSearching} 
                />
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Welcome State */
          <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-white">
              Instant DSA Explanations with Direct Video Jump
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-lg mx-auto">
              Search any problem or concept. On the <strong>left</strong>, get a structured conceptual explanation. On the <strong>right</strong>, watch the exact video segment embedded in your browser.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-xs text-gray-400 bg-[#090912]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-gray-300 font-semibold">DSA Course Intelligence</span>
            <span className="text-gray-600 mx-2">·</span>
            <span className="text-gray-500">Educational Assistant for DSA Learning</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs">
            <span className="text-gray-400">
              Built by <strong className="text-white font-medium">Shivam Chaudhary</strong>
            </span>
            <span className="text-gray-700">|</span>
            <a
              href="https://shivam-dev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1"
            >
              <span>🌐</span>
              <span>shivam-dev.in</span>
            </a>
            <span className="text-gray-700">|</span>
            <a
              href="https://github.com/freakkyshivam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <span className="text-gray-700">|</span>
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="text-gray-400 hover:text-indigo-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              ⚖️ Disclaimer
            </button>
          </div>
        </div>
      </footer>

      {/* Disclaimer & Dev Info Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}

export default App;

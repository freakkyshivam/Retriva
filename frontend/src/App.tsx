import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { SearchBar, SEARCH_EXAMPLE_QUERIES } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { AskSection, ASK_EXAMPLE_QUERIES } from './components/AskSection';
import { AnswerDisplay } from './components/AnswerDisplay';
import { AskLectureReferencePanel } from './components/AskLectureReferencePanel';
import { TopicFilter } from './components/TopicFilter';
import { DisclaimerModal } from './components/DisclaimerModal';
import { 
  searchCourse, 
  askQuestion, 
  VideoResult, 
  AskResponse 
} from './api';

export type AppRoute = '/' | '/search' | '/ask' | '/about';

const getRouteFromPathname = (pathname: string): AppRoute => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/search') return '/search';
  if (clean === '/ask') return '/ask';
  if (clean === '/about') return '/about';
  return '/';
};

function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    getRouteFromPathname(window.location.pathname)
  );

  const [isSearching, setIsSearching] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuery, setCurrentQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync state with browser Back / Forward actions
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromPathname(window.location.pathname);
      setCurrentRoute(route);
      setError(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation updating URL and history without full page reload
  const navigate = (to: AppRoute, queryParam?: string) => {
    let url: string = to;
    if (queryParam) {
      url += `?q=${encodeURIComponent(queryParam)}`;
    }
    if (window.location.pathname !== to || (queryParam && !window.location.search.includes(encodeURIComponent(queryParam)))) {
      window.history.pushState(null, '', url);
    }
    setCurrentRoute(to);
    setError(null);
    if (to === '/') {
      setHasSearched(false);
      setSearchResults([]);
      setAskResponse(null);
    }
  };

  // Pure semantic search handler: calls ONLY searchCourse, NEVER calls askQuestion/LLM
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setError(null);
    setCurrentQuery(query);
    setHasSearched(true);
    setIsSearching(true);
    setSearchResults([]);
    setAskResponse(null);

    const searchUrl = `/search?q=${encodeURIComponent(query)}`;
    if (window.location.pathname !== '/search' || window.location.search !== `?q=${encodeURIComponent(query)}`) {
      window.history.pushState(null, '', searchUrl);
      setCurrentRoute('/search');
    }

    try {
      const res = await searchCourse(query);
      setSearchResults(res.results);
    } catch (err: any) {
      setError(err?.message || 'Video search failed.');
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Conceptual RAG handler: calls askQuestion (LLM) and retrieves supporting video lectures
  const handleAsk = async (question: string) => {
    if (!question.trim()) return;
    setError(null);
    setCurrentQuery(question);
    setHasSearched(true);
    setIsSearching(true);
    setIsAiLoading(true);
    setAskResponse(null);
    setSearchResults([]);

    const askUrl = `/ask?q=${encodeURIComponent(question)}`;
    if (window.location.pathname !== '/ask' || window.location.search !== `?q=${encodeURIComponent(question)}`) {
      window.history.pushState(null, '', askUrl);
      setCurrentRoute('/ask');
    }

    const videoPromise = searchCourse(question)
      .then(res => {
        setSearchResults(res.results);
      })
      .catch(err => {
        console.error("Supporting lectures retrieval error:", err);
      })
      .finally(() => {
        setIsSearching(false);
      });

    const aiPromise = askQuestion(question)
      .then(res => {
        setAskResponse(res);
      })
      .catch(err => {
        setError(err?.message || 'AI answer generation failed.');
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

  // Handle direct navigation with query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      if (currentRoute === '/search') {
        handleSearch(q);
      } else if (currentRoute === '/ask') {
        handleAsk(q);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#09090f] text-gray-200 flex flex-col selection:bg-indigo-600 selection:text-white font-sans">
      {/* Error / Rate Limit Toast */}
      {error && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-md text-sm ${
          error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('too many requests')
            ? 'bg-amber-600/90 text-white border-amber-400/40 shadow-amber-900/30'
            : 'bg-red-600/90 text-white border-red-400/30 shadow-red-900/30'
        }`}>
          <span>{error.toLowerCase().includes('rate limit') ? '⏳' : '⚠️'}</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-white/80 hover:text-white font-bold ml-1 cursor-pointer">×</button>
        </div>
      )}

      {/* Top Navbar / Header */}
      <header className="border-b border-white/5 bg-[#0e0e17]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none group-hover:text-indigo-300 transition-colors">
                Retriva
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Striver's A2Z DSA · 304 Videos · 3,599 Timestamp Chunks
              </p>
            </div>
          </div>

          {/* Center Navigation Links & Mode Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex bg-[#141422] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => navigate('/')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentRoute === '/'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/search')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentRoute === '/search'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🔍 Search
              </button>
              <button
                onClick={() => navigate('/ask')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentRoute === '/ask'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                💡 Ask
              </button>
            </div>

            {/* Disclaimer & Info Button */}
            <button
              onClick={() => navigate('/about')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentRoute === '/about'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
              }`}
              title="About Project & Developer"
            >
              <span>⚖️</span>
              <span className="hidden sm:inline">About & Disclaimer</span>
            </button>

            {/* Quick Action: Get Started Button */}
            {currentRoute === '/' && (
              <button
                onClick={() => navigate('/search')}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Route Views */}
      <div className="flex-1 flex flex-col">
        {(currentRoute === '/' || currentRoute === '/about') && (
          /* ================= 1. HOME PAGE VIEW ================= */
          <HomePage
            onNavigateToSearch={(query) => {
              navigate('/search', query);
              if (query) {
                handleSearch(query);
              }
            }}
            onNavigateToAsk={(question) => {
              navigate('/ask', question);
              if (question) {
                handleAsk(question);
              }
            }}
          />
        )}

        {currentRoute === '/search' && (
          /* ================= 2. SEARCH PAGE VIEW ================= */
          <div className="flex-1 flex flex-col">
            {/* Search Header Banner */}
            <section className="pt-8 pb-4 px-4 text-center">
              <div className="max-w-3xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                  <span className="text-base">🔍</span>
                  <span>Find the right DSA lecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Search Striver's A2Z Course
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Search by topic, problem, or algorithm. Get the most relevant videos and transcript segments.
                </p>
              </div>
            </section>

            {/* Search Input and Filters */}
            <section className="pb-6 px-4">
              <div className="max-w-4xl mx-auto space-y-3">
                <SearchBar 
                  onSearch={handleSearch} 
                  isLoading={isSearching} 
                  placeholder="Search DSA topics... (e.g. 'Dijkstra', 'Bellman Ford', 'Sliding Window')" 
                  initialQuery={currentQuery}
                />
                <TopicFilter onTopicSearch={handleSearch} />
              </div>
            </section>

            {/* Search Results / Idle Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-12">
              {hasSearched ? (
                <SearchResults
                  results={searchResults}
                  query={currentQuery}
                  isLoading={isSearching}
                  onSwitchToAsk={(q) => {
                    navigate('/ask', q);
                    if (q) handleAsk(q);
                  }}
                />
              ) : (
                /* Search Mode Idle State */
                <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                    🔍
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5">
                      Ready to find your next lecture
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                      Search any concept or algorithm name above to discover the exact video and timestamp segment in Striver's playlist.
                    </p>
                  </div>

                  <div className="pt-2 max-w-lg mx-auto">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                      🔍 Try searching:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SEARCH_EXAMPLE_QUERIES.map((example) => (
                        <button
                          key={example}
                          onClick={() => handleSearch(example)}
                          className="p-3 bg-[#11111c] hover:bg-[#18182a] border border-white/5 hover:border-indigo-500/40 rounded-xl text-left transition-all duration-200 group flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-xs text-gray-300 group-hover:text-white font-medium">
                            {example}
                          </span>
                          <span className="text-gray-600 group-hover:text-indigo-400 text-xs">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {currentRoute === '/ask' && (
          /* ================= 3. ASK PAGE VIEW ================= */
          <div className="flex-1 flex flex-col">
            {/* Ask Header Banner */}
            <section className="pt-8 pb-4 px-4 text-center">
              <div className="max-w-3xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                  <span className="text-base">💡</span>
                  <span>Ask the course</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Grounded Conceptual Explanations
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Get AI-powered explanations grounded in Striver's A2Z DSA course transcripts. Ask any conceptual question.
                </p>
              </div>
            </section>

            {/* Question Input Section */}
            <section className="pb-6 px-4">
              <div className="max-w-4xl mx-auto">
                <AskSection 
                  onAsk={handleAsk} 
                  isLoading={isAiLoading || isSearching} 
                />
              </div>
            </section>

            {/* Ask Results / Split-Screen Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-12">
              {hasSearched ? (
                <div className="space-y-4">
                  {/* Query Indicator Pill */}
                  <div className="flex items-center justify-between px-1 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>Synthesized for:</span>
                      <span className="font-semibold text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20 truncate max-w-md">
                        "{currentQuery}"
                      </span>
                    </div>
                    {(isSearching || isAiLoading) && (
                      <div className="flex items-center gap-2 text-indigo-400 font-medium">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                        <span>Synthesizing answer from course transcripts...</span>
                      </div>
                    )}
                  </div>

                  {/* Split Screen Grid (Left: Grounded Explanation | Right: Supporting Lectures) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Grounded Explanation */}
                    <div className="lg:col-span-7">
                      {isAiLoading ? (
                        <div className="bg-[#11111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                          <div className="px-6 py-4 bg-[#161622] border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                              <span className="text-xs font-semibold text-indigo-300 animate-pulse">
                                Synthesizing Explanation from Transcripts...
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              Grounded RAG
                            </span>
                          </div>

                          <div className="p-6 md:p-8 space-y-4 animate-pulse">
                            <div className="h-5 bg-white/10 rounded-lg w-2/5" />
                            <div className="space-y-2.5 pt-2">
                              <div className="h-3.5 bg-white/5 rounded-md w-full" />
                              <div className="h-3.5 bg-white/5 rounded-md w-11/12" />
                              <div className="h-3.5 bg-white/5 rounded-md w-4/5" />
                            </div>
                            <div className="pt-3 space-y-2">
                              <div className="h-4 bg-white/10 rounded w-1/4 mb-3" />
                              <div className="h-12 bg-white/5 rounded-xl w-full" />
                              <div className="h-12 bg-white/5 rounded-xl w-full" />
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
                          No answer synthesized yet. Try asking a question above.
                        </div>
                      )}
                    </div>

                    {/* Right: Video References, Lectures & Segments */}
                    <div className="lg:col-span-5">
                      <AskLectureReferencePanel 
                        videos={searchResults} 
                        sources={askResponse?.sources || []} 
                        isLoading={isSearching} 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Ask Mode Idle State */
                <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5">
                      Ask Conceptual DSA Questions
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                      Get grounded, step-by-step explanations synthesized from Striver's course transcripts with supporting video timestamps.
                    </p>
                  </div>

                  <div className="pt-2 max-w-lg mx-auto">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                      💡 Or try asking:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ASK_EXAMPLE_QUERIES.map((example) => (
                        <button
                          key={example}
                          onClick={() => handleAsk(example)}
                          className="p-3 bg-[#11111c] hover:bg-[#18182a] border border-white/5 hover:border-indigo-500/40 rounded-xl text-left transition-all duration-200 group flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-xs text-gray-300 group-hover:text-white font-medium">
                            {example}
                          </span>
                          <span className="text-gray-600 group-hover:text-indigo-400 text-xs">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Consistent Global Footer */}
      <footer className="py-6 border-t border-white/5 text-xs text-gray-400 bg-[#090912]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-semibold">Retriva</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">Learn DSA Smarter</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500">Powered by Striver's A2Z Course</span>
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
              onClick={() => navigate('/about')}
              className="text-gray-400 hover:text-indigo-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              ⚖️ Disclaimer
            </button>
          </div>
        </div>
      </footer>

      {/* Disclaimer & Dev Info Modal */}
      <DisclaimerModal
        isOpen={currentRoute === '/about'}
        onClose={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigate('/');
          }
        }}
      />
    </div>
  );
}

export default App;

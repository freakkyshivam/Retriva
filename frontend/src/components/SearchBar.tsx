import { useState, useEffect, useRef } from 'react';
import { getAutocomplete, AutocompleteSuggestion } from '../api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, placeholder }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await getAutocomplete(value.trim());
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    setValue(suggestion.title);
    onSearch(suggestion.title);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
          <div className="relative flex items-center bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden group-focus-within:border-transparent transition-colors">
            <div className="pl-5 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              placeholder={placeholder || 'Search...'}
              className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-600 outline-none text-base"
            />
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="mr-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#16161f] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {suggestions.map((suggestion, idx) => (
            <button
              key={suggestion.videoId}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                idx === selectedIndex
                  ? 'bg-indigo-600/20 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500 font-mono">
                {suggestion.position}
              </span>
              <span className="text-sm truncate flex-1">{suggestion.title}</span>
              {suggestion.noTranscript && (
                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">
                  No Transcript
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

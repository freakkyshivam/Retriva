import { VideoResult } from '../api';
import { VideoCard } from './VideoCard';

interface SearchResultsProps {
  results: VideoResult[];
  query: string;
  isLoading: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, query, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-12 text-center">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Searching across 3,599 transcript segments...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-400 font-medium mb-2">No results found for "{query}"</p>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Try different keywords. For example: "binary search", "graph traversal", "dynamic programming", "linked list"
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-gray-500 text-sm mb-5 text-center">
        Found <span className="text-indigo-400 font-medium">{results.length}</span> relevant video{results.length > 1 ? 's' : ''} for "<span className="text-gray-300">{query}</span>"
      </p>
      <div className="space-y-5">
        {results.map((result, idx) => (
          <VideoCard key={result.videoId} result={result} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
};

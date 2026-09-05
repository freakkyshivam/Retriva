import { useState } from 'react';

interface TopicFilterProps {
  onTopicSearch: (topic: string) => void;
}

const TOPICS = [
  "Arrays", 
  "Binary Search", 
  "Linked List", 
  "Stacks Queues", 
  "Trees", 
  "Binary Trees", 
  "Graphs", 
  "Dynamic Programming", 
  "Strings", 
  "Recursion", 
  "Sorting"
];

export const TopicFilter: React.FC<TopicFilterProps> = ({ onTopicSearch }) => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const handleTopicClick = (topic: string) => {
    setActiveTopic(topic);
    onTopicSearch(topic);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 overflow-hidden relative">
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeTopic === topic
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                : 'bg-[#12121a] text-gray-400 border-white/5 hover:border-white/10 hover:text-gray-200'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
      {/* CSS to hide scrollbar for webkit browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
};

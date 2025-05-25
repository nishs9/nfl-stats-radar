'use client';

import { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Player = {
  player_id: string;
  player_display_name: string;
  recent_team: string;
  position: string;
};

export default function PlayerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Wrap searchPlayers in useCallback
  const searchPlayers = useCallback(async () => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching for players:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]); // Add query as a dependency for useCallback

  // Debounced search - Add searchPlayers to dependency array
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers(); // Call the memoized function
    }, 300);

    return () => clearTimeout(timer);
  }, [searchPlayers]); // Use searchPlayers here

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (results.length > 0) {
      router.push(`/player/${results[0].player_id}`);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative min-h-0" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search for a player..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        
        <button 
          type="submit"
          className="absolute right-2 top-2 bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600"
        >
          Search
        </button>

        {isLoading && (
          <div className="absolute right-12 top-3">
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="absolute z-10 w-full bg-white mt-1 border rounded-md shadow-lg max-h-72 overflow-y-auto">
            <ul>
              {results.map((player) => (
                <li key={player.player_id} className="border-b last:border-b-0">
                  <Link 
                    href={`/player/${player.player_id}`}
                    className="block p-3 hover:bg-gray-100"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="font-medium">{player.player_display_name}</div>
                    <div className="text-sm text-gray-500">
                      {player.position} • {player.recent_team}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute z-10 w-full bg-white mt-1 border rounded-md shadow-lg p-3">
            No players found
          </div>
        )}
      </form>
    </div>
  );
}
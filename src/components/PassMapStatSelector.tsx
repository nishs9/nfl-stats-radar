'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PassMapStatOption } from '@/types/player';

interface PassMapStatSelectorProps {
  selectedStats: string[];
  onStatsChange: (stats: string[]) => void;
}

// All available statistics with their labels and formats
const AVAILABLE_STATS: PassMapStatOption[] = [
  { key: 'attempts', label: 'Attempts', format: 'number' },
  { key: 'completions', label: 'Completions', format: 'number' },
  { key: 'completionPct', label: 'Completion %', format: 'percentage' },
  { key: 'airYards', label: 'Air Yards', format: 'number' },
  { key: 'passingYards', label: 'Passing Yards', format: 'number' },
  { key: 'passingAirEpa', label: 'Air EPA', format: 'decimal' },
  { key: 'airEpaPerPlay', label: 'Air EPA/Play', format: 'decimal' },
  { key: 'totalPassingEpa', label: 'Total EPA', format: 'decimal' },
  { key: 'totalPassingEpaPerPlay', label: 'Total EPA/Play', format: 'decimal' },
  { key: 'touchdowns', label: 'Touchdowns', format: 'number' },
  { key: 'interceptions', label: 'Interceptions', format: 'number' },
];

export default function PassMapStatSelector({ selectedStats, onStatsChange }: PassMapStatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleStat = (statKey: string) => {
    if (selectedStats.includes(statKey)) {
      // Block unselecting if it's the last selected stat
      if (selectedStats.length > 1) {
        onStatsChange(selectedStats.filter(s => s !== statKey));
      }
    } else {
      onStatsChange([...selectedStats, statKey]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose stats to display:
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-64 bg-white border border-gray-300 rounded-md px-4 py-2 text-left shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            {selectedStats.length} stat{selectedStats.length !== 1 ? 's' : ''} selected
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full md:w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="py-1">
            {AVAILABLE_STATS.map((stat) => {
              const isSelected = selectedStats.includes(stat.key);
              const isOnlySelected = isSelected && selectedStats.length === 1;
              
              return (
                <button
                  key={stat.key}
                  onClick={() => toggleStat(stat.key)}
                  disabled={isOnlySelected}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 ${
                    isOnlySelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center w-full">
                    <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center ${
                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">{stat.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { AVAILABLE_STATS };


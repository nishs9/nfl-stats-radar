'use client';

import { StatDefinition } from '@/types/player'; // Use StatDefinition
import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils'; 

interface PercentileSliderProps {
  stat: StatDefinition; // Use StatDefinition
  percentile: number;
  value: string | number | null | undefined; 
}

// Utility function to get the ordinal suffix
function getOrdinalSuffix(num: number): string {
  const remainder = num % 100;
  if (remainder >= 11 && remainder <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export default function PercentileSlider({ stat, percentile, value }: PercentileSliderProps) {
  const [animatedPercentile, setAnimatedPercentile] = useState(0);
  const displayValue = formatNumber(value); 
  const displayPercentile = formatNumber(percentile); 
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stat.key == 'total_turnovers' && percentile == 0) {
        setAnimatedPercentile(1);
      } else {
        setAnimatedPercentile(percentile);
      }   
    }, 100);
    return () => clearTimeout(timer);
  }, [percentile, stat.key]);

  // Determine color based on percentile and whether higher is better
  const getColor = () => {
    const isHigherBetter = stat.higherIsBetter !== false; // Default to true if undefined
    const effectivePercentile = isHigherBetter ? percentile : 100 - percentile;

    if (effectivePercentile >= 75) return 'bg-green-500'; // High percentile (good)
    if (effectivePercentile >= 40) return 'bg-yellow-500'; // Average percentile
    return 'bg-red-500'; // Low percentile (bad)
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <div className="relative group">
          <span className="text-sm font-medium text-gray-700 cursor-help">{stat.label}</span>
          {stat.description && (
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-10">
              {stat.description}
              <div className="absolute bottom-[-6px] left-3 w-3 h-3 bg-gray-900 transform rotate-45"></div>
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-blue-600">
          {displayValue !== null && displayValue !== undefined ? displayValue : 'N/A'} 
          <span className="text-xs text-gray-500 ml-1">({displayPercentile}{getOrdinalSuffix(percentile)} %ile)</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getColor()}`} 
          style={{ width: `${animatedPercentile}%` }}
        ></div>
      </div>
    </div>
  );
}
'use client';

import { StatCategory } from '@/types/player';
import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils'; // Import the utility function

interface PercentileSliderProps {
  stat: StatCategory;
  percentile: number;
  value: string | number | null | undefined; // Accept various types for value
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
  const displayValue = formatNumber(value); // Format the main value
  const displayPercentile = formatNumber(percentile); // Format the percentile value
  
  // Animate the percentile value on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentile(percentile);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentile]);

  // Determine color based on percentile (red for low, blue for high)
  const getColor = () => {
    if (stat.higherIsBetter) {
      if (percentile >= 90) return 'bg-blue-600';
      if (percentile >= 75) return 'bg-blue-500';
      if (percentile >= 60) return 'bg-blue-400';
      if (percentile >= 40) return 'bg-gray-400';
      if (percentile >= 25) return 'bg-red-400';
      if (percentile >= 10) return 'bg-red-500';
      return 'bg-red-600';
    } else {
      // Inverse color scheme for stats where lower is better
      if (percentile >= 90) return 'bg-red-600';
      if (percentile >= 75) return 'bg-red-500';
      if (percentile >= 60) return 'bg-red-400';
      if (percentile >= 40) return 'bg-gray-400';
      if (percentile >= 25) return 'bg-blue-400';
      if (percentile >= 10) return 'bg-blue-500';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
        {/* Display the formatted value and formatted percentile */}
        <span className="text-sm font-semibold text-blue-600">
          {displayValue !== null && displayValue !== undefined ? displayValue : 'N/A'} 
          {/* Use displayPercentile here */}
          <span className="text-xs text-gray-500 ml-1">({displayPercentile}{getOrdinalSuffix(percentile)} %ile)</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          // Use the correct color class based on percentile
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getColor()}`} 
          style={{ width: `${animatedPercentile}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
    </div>
  );
}
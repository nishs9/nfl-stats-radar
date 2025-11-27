'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import type { StatComparisonResponse } from '@/types/api';

interface StatComparisonChartProps {
  playerId: string;
  position: string;
  season: number;
  statType: string;
  showNames?: boolean;
}

interface ClusteredDataPoint {
  name: string;
  playerId: string;
  value: number;
  x: number; // Stat value (no jittering)
  y: number; // Vertical position with jittering
}

export default function StatComparisonChart({
  playerId,
  position,
  season,
  statType,
  showNames = false,
}: StatComparisonChartProps) {
  const [data, setData] = useState<StatComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/stats/comparison?season=${season}&statType=${statType}&position=${position}&playerId=${playerId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchData();
  }, [season, statType, position, playerId]);

  useEffect(() => {
    if (!data || !svgRef.current || !tooltipRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions - adjusted for better viewport fit
    const margin = { top: 40, right: 20, bottom: 60, left: 20 };
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    const width = Math.min(containerWidth - margin.left - margin.right, 1200); // Cap max width
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG with adjusted viewBox
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([
        d3.min(data.players, d => d.value) || 0,
        d3.max(data.players, d => d.value) || 0
      ])
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([-1, 1]) // Range for jittering
      .range([height, 0]);

    // Cluster and jitter the data points
    const clusteredData: ClusteredDataPoint[] = data.players.map(player => {
      // Add vertical jittering
      const verticalJitter = (Math.random() - 0.5) * 0.5; // Reduced jittering amount

      return {
        ...player,
        x: player.value,
        y: verticalJitter
      };
    });

    // Add vertical grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks())
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', -10)
      .attr('y2', height + 10)
      .attr('stroke', '#e5e5e5')
      .attr('stroke-dasharray', '2,2');

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.select('.domain').attr('stroke', '#e5e5e5'));

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('z-index', '1000');

    // Add data points
    svg.selectAll('circle')
      .data(clusteredData)
      .join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => d.playerId === playerId ? 8 : 6)
      .attr('fill', d => d.playerId === playerId ? '#ef4444' : '#3b82f6')
      .attr('stroke', d => d.playerId === playerId ? '#b91c1c' : '#2563eb')
      .attr('stroke-width', d => d.playerId === playerId ? 2 : 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Navigate to the clicked player's profile page with the season as a query parameter
        router.push(`/player/${d.playerId}?season=${season}`);
      })
      .on('mouseover', (event, d) => {
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div class="font-bold">${d.name}</div>
            <div>${statType}: ${d.value.toFixed(3)}</div>
            <div class="text-xs text-gray-300 mt-1">Click to view player's stat profile</div>
          `);
        
        d3.select(event.currentTarget)
          .attr('r', d.playerId === playerId ? 10 : 8)
          .attr('stroke-width', 2);
      })
      .on('mousemove', (event) => {
        if (!tooltipRef.current || !containerRef.current) return;

        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate position relative to container
        let xPos = event.pageX - containerRect.left + 10;
        let yPos = event.pageY - containerRect.top - 10;

        // Adjust if tooltip would overflow right edge
        if (xPos + tooltipWidth > containerRect.width) {
          xPos = event.pageX - containerRect.left - tooltipWidth - 10;
        }

        // Adjust if tooltip would overflow bottom edge
        if (yPos + tooltipHeight > containerRect.height) {
          yPos = event.pageY - containerRect.top - tooltipHeight - 10;
        }

        // Ensure tooltip doesn't go beyond left or top edge
        xPos = Math.max(0, xPos);
        yPos = Math.max(0, yPos);

        tooltip
          .style('left', `${xPos}px`)
          .style('top', `${yPos}px`);
      })
      .on('mouseout', (event, d) => {
        tooltip
          .style('visibility', 'hidden');
        
        d3.select(event.currentTarget)
          .attr('r', d.playerId === playerId ? 8 : 6)
          .attr('stroke-width', d.playerId === playerId ? 2 : 1);
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xl font-bold')
      .text(`${data.metadata.statLabel} Distribution (${position}, ${season})`);

    // Add x-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text(data.metadata.statLabel);

    if (showNames) {
      const labelGroup = svg.append('g')
        .selectAll('g')
        .data(clusteredData)
        .join('g')
        .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`);

      labelGroup.append('rect')
        .attr('x', 6)
        .attr('y', -14)
        .attr('width', d => {
          const textLength = d.name.length;
          return Math.max(textLength * 6.5, 50);
        })
        .attr('height', 16)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5)
        .attr('rx', 2);

      labelGroup.append('text')
        .attr('x', 8)
        .attr('y', -2)
        .attr('font-size', '12px') // Player name label font size - adjust this value to change text size
        .attr('fill', '#333')
        .attr('pointer-events', 'none')
        .text(d => d.name);
    }

  }, [data, playerId, statType, position, season, showNames]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div ref={containerRef} className="relative w-full h-[600px] max-w-[95vw] mx-auto bg-white rounded-lg shadow-lg p-4">
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      />
      <div ref={tooltipRef} className="pointer-events-none absolute" />
    </div>
  );
} 
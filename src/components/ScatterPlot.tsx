'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';

interface ScatterPlotDataPoint {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  xValue: number | null;
  yValue: number | null;
}

interface ScatterPlotProps {
  dataPoints: ScatterPlotDataPoint[];
  xStat: string;
  yStat: string;
  season: number;
  showNames?: boolean;
}

// Helper function to escape HTML characters to prevent XSS
function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

export default function ScatterPlot({
  dataPoints,
  xStat,
  yStat,
  season,
  showNames = false,
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!dataPoints || dataPoints.length === 0 || !svgRef.current || !tooltipRef.current) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    const width = Math.min(containerWidth - margin.left - margin.right, 1200);
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out null values
    const validData = dataPoints.filter(d => d.xValue !== null && d.yValue !== null);

    if (validData.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No valid data points to display');
      return;
    }

    // Create axis scales
    const xScale = d3.scaleLinear()
      .domain([
        d3.min(validData, d => d.xValue as number) || 0,
        d3.max(validData, d => d.xValue as number) || 0
      ])
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(validData, d => d.yValue as number) || 0,
        d3.max(validData, d => d.yValue as number) || 0
      ])
      .range([height, 0])
      .nice();

    const positions = Array.from(new Set(validData.map(d => d.position)));
    const colorScale = d3.scaleOrdinal<string>()
      .domain(positions)
      .range(d3.schemeCategory10);

    const xTicks = xScale.ticks();
    const yTicks = yScale.ticks();

    // Vertical grid
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xTicks)
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', -10)
      .attr('y2', height + 10)
      .attr('stroke', '#e5e5e5')
      .attr('stroke-dasharray', '2,2');

    // Horizontal grid
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e5e5')
      .attr('stroke-dasharray', '2,2');

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Set up x-axis labels
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#e5e5e5'))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(xStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));   

    // Set up y-axis labels
    svg.append('g')
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', '#e5e5e5'))
      .append('text')
      .attr('x', width / 15)
      .attr('y', -height / 20)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(yStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

    // Add data points
    const points = svg.append('g')
      .selectAll('circle')
      .data(validData)
      .join('circle')
      .attr('cx', d => xScale(d.xValue as number))
      .attr('cy', d => yScale(d.yValue as number))
      .attr('r', 6)
      .attr('fill', d => colorScale(d.position))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Navigate to the clicked player's profile page with the season as a query parameter
        router.push(`/player/${d.playerId}?season=${season}`);
      });

    // Add hover interactions
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('font-size', '14px') 
      .style('z-index', '1000');

    points
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('stroke-width', 2);

        const xStatLabel = escapeHtml(xStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const yStatLabel = escapeHtml(yStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div class="font-bold">${escapeHtml(d.playerName)}</div>
            <div>${escapeHtml(d.position)} - ${escapeHtml(d.team)}</div>
            <div>${xStatLabel}: ${escapeHtml(d.xValue?.toLocaleString())}</div>
            <div>${yStatLabel}: ${escapeHtml(d.yValue?.toLocaleString())}</div>
          `);
      })
      .on('mousemove', function(event) {
        if (!tooltipRef.current || !containerRef.current) return;

        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Get mouse position relative to viewport
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // Calculate position relative to container (accounting for padding)
        let xPos = mouseX - containerRect.left + 15;
        let yPos = mouseY - containerRect.top - tooltipHeight - 15;

        // Adjust if tooltip would overflow right edge
        if (xPos + tooltipWidth > containerRect.width - 16) {
          xPos = mouseX - containerRect.left - tooltipWidth - 15;
        }

        // Adjust if tooltip would overflow top edge
        if (yPos < 16) { // Account for padding
          yPos = mouseY - containerRect.top + 15;
        }

        // Adjust if tooltip would overflow bottom edge
        if (yPos + tooltipHeight > containerRect.height - 16) {
          yPos = containerRect.height - tooltipHeight - 16;
        }

        xPos = Math.max(16, xPos);

        tooltip
          .style('left', `${xPos}px`)
          .style('top', `${yPos}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 6)
          .attr('stroke-width', 1);

        tooltip.style('visibility', 'hidden');
      });

    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(positions)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('circle')
      .attr('r', 4)
      .attr('fill', d => colorScale(d))
      .attr('cx', 0)
      .attr('cy', 0);

    legendItems.append('text')
      .attr('x', 8)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(d => d);

    if (showNames) {
      const labelGroup = svg.append('g')
        .selectAll('g')
        .data(validData)
        .join('g')
        .attr('transform', d => `translate(${xScale(d.xValue as number)},${yScale(d.yValue as number)})`);

      labelGroup.append('rect')
        .attr('x', 6)
        .attr('y', -14)
        .attr('width', d => {
          const textLength = d.playerName.length;
          return Math.max(textLength * 6.5, 50); // Increased width multiplier for larger font
        })
        .attr('height', 16) // Increased height for larger font
        .attr('fill', 'white')
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5)
        .attr('rx', 2);

      // Add text labels
      labelGroup.append('text')
        .attr('x', 8)
        .attr('y', -2) // Adjusted y position for better centering with larger font
        .attr('font-size', '12px') // Player name label font size - adjust this value to change text size
        .attr('fill', '#333')
        .attr('pointer-events', 'none')
        .text(d => d.playerName);
    }

  }, [dataPoints, xStat, yStat, season, showNames, router]);

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


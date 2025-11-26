'use client';

import { useEffect, useRef } from 'react';
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

export default function ScatterPlot({
  dataPoints,
  xStat,
  yStat,
  showNames = false,
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dataPoints || dataPoints.length === 0 || !svgRef.current || !tooltipRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    const width = Math.min(containerWidth - margin.left - margin.right, 1200);
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG
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

    // Create scales
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

    // Color scale by position
    const positions = Array.from(new Set(validData.map(d => d.position)));
    const colorScale = d3.scaleOrdinal<string>()
      .domain(positions)
      .range(d3.schemeCategory10);

    // Add grid lines
    const xTicks = xScale.ticks();
    const yTicks = yScale.ticks();

    // Vertical grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xTicks)
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#e5e5e5')
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', 1);

    // Horizontal grid lines
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
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', 1);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(xStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

    svg.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
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
      .attr('r', 4)
      .attr('fill', d => colorScale(d.position))
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // Add hover interactions
    const tooltip = d3.select(tooltipRef.current)
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '1000');

    points
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 1);

        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.playerName}</strong><br/>
            ${d.position} - ${d.team}<br/>
            ${xStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${d.xValue?.toLocaleString()}<br/>
            ${yStat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${d.yValue?.toLocaleString()}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 4)
          .attr('opacity', 0.7);

        tooltip.style('opacity', 0);
      });

    // Add legend
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

    // Add player name labels if showNames is true
    if (showNames) {
      const labelGroup = svg.append('g')
        .selectAll('g')
        .data(validData)
        .join('g')
        .attr('transform', d => `translate(${xScale(d.xValue as number)},${yScale(d.yValue as number)})`);

      // Add background rectangles for better readability
      labelGroup.append('rect')
        .attr('x', 6)
        .attr('y', -12)
        .attr('width', d => {
          // Estimate width based on text length
          const textLength = d.playerName.length;
          return Math.max(textLength * 5.5, 40);
        })
        .attr('height', 14)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5)
        .attr('rx', 2);

      // Add text labels
      labelGroup.append('text')
        .attr('x', 8)
        .attr('y', -3)
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .attr('pointer-events', 'none')
        .text(d => d.playerName);
    }

  }, [dataPoints, xStat, yStat, showNames]);

  return (
    <div className="w-full" ref={containerRef} style={{ minHeight: '600px' }}>
      <svg ref={svgRef} className="w-full" style={{ minHeight: '600px' }} />
      <div ref={tooltipRef} />
    </div>
  );
}


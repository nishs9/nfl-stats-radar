'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HistoricalDataPoint {
  team: string;
  team_name: string;
  team_logo_squared: string;
  week: number;
  rpi_rank: number;
  comp_rpi: number;
}

interface PowerRankingsChartProps {
  data: HistoricalDataPoint[];
  selectedTeams: string[];
}

export default function PowerRankingsChart({
  data,
  selectedTeams,
}: PowerRankingsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !tooltipRef.current) return;

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

    if (selectedTeams.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('Select teams to view rankings');
      return;
    }

    const filteredData = data.filter(d => selectedTeams.includes(d.team));

    const weeks = Array.from(new Set(filteredData.map(d => d.week))).sort((a, b) => a - b);
    const teams = Array.from(new Set(filteredData.map(d => d.team)));

    const xScale = d3.scaleLinear()
      .domain([d3.min(weeks) || 1, d3.max(weeks) || 18])
      .range([0, width])
      .nice();

    const maxRank = d3.max(filteredData, d => d.rpi_rank) || 32;
    const yScale = d3.scaleLinear()
      .domain([maxRank, 1])
      .range([height, 0])
      .nice();

    const colorScale = d3.scaleOrdinal<string>()
      .domain(teams)
      .range(d3.schemeCategory10);

    const xTicks = xScale.ticks();
    const yTicks = yScale.ticks();

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
      .text('Week');

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
      .text('Power Ranking');

    const line = d3.line<HistoricalDataPoint>()
      .x(d => xScale(d.week))
      .y(d => yScale(d.rpi_rank))
      .curve(d3.curveMonotoneX);

    const teamData = teams.map(team => {
      const teamPoints = filteredData
        .filter(d => d.team === team)
        .sort((a, b) => a.week - b.week);
      return { team, points: teamPoints };
    });

    teamData.forEach(({ team, points }) => {
      if (points.length === 0) return;

      const teamInfo = points[0];
      const color = colorScale(team);

      svg.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      svg.selectAll(`.point-${team}`)
        .data(points)
        .join('circle')
        .attr('class', `point-${team}`)
        .attr('cx', d => xScale(d.week))
        .attr('cy', d => yScale(d.rpi_rank))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', 6);

          const tooltip = d3.select(tooltipRef.current);
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (!containerRect) return;

          const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
          
          let xPos = mouseX + 16;
          let yPos = mouseY - 10;

          const tooltipWidth = 150;
          const tooltipHeight = 100;

          if (xPos + tooltipWidth > containerRect.width) {
            xPos = mouseX - tooltipWidth - 16;
          }
          if (yPos < 0) {
            yPos = mouseY + 20;
          }
          if (yPos + tooltipHeight > containerRect.height) {
            yPos = mouseY - tooltipHeight - 10;
          }

          xPos = Math.max(16, Math.min(xPos, containerRect.width - tooltipWidth - 16));
          yPos = Math.max(16, Math.min(yPos, containerRect.height - tooltipHeight - 16));

          tooltip
            .style('visibility', 'visible')
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px;">${teamInfo.team_name || d.team}</div>
              <div>Week ${d.week}</div>
              <div>Rank: ${d.rpi_rank}</div>
              <div>Comp. RPI: ${d.comp_rpi.toFixed(3)}</div>
            `)
            .style('left', `${xPos}px`)
            .style('top', `${yPos}px`);
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 4);
          d3.select(tooltipRef.current).style('visibility', 'hidden');
        });
    });

    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(teams)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', d => colorScale(d))
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(d => {
        const teamInfo = filteredData.find(t => t.team === d);
        return teamInfo?.team || d;
      });
  }, [data, selectedTeams]);

  return (
    <div className="relative w-full" style={{ minHeight: '600px' }} ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-300 rounded shadow-lg p-2 pointer-events-none invisible z-10"
        style={{ fontSize: '12px' }}
      />
    </div>
  );
}

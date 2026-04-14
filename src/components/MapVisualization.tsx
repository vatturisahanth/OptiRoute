/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DISTRICTS, CONNECTIONS, District, Connection } from '../constants';
import { motion } from 'motion/react';

interface MapVisualizationProps {
  activeNode: string | null;
  visitedNodes: string[];
  highlightedPath: string[];
  onNodeClick?: (id: string) => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  activeNode,
  visitedNodes,
  highlightedPath,
  onNodeClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1000;
    const height = 800;

    // Grid lines for technical look
    const grid = svg.append('g').attr('class', 'grid');
    for (let i = 0; i <= width; i += 50) {
      grid.append('line')
        .attr('x1', i).attr('y1', 0).attr('x2', i).attr('y2', height)
        .attr('stroke', '#e2e8f0').attr('stroke-width', 0.5);
    }
    for (let i = 0; i <= height; i += 50) {
      grid.append('line')
        .attr('x1', 0).attr('y1', i).attr('x2', width).attr('y2', i)
        .attr('stroke', '#e2e8f0').attr('stroke-width', 0.5);
    }

    // Draw connections (roads)
    const connectionsGroup = svg.append('g').attr('class', 'connections');
    CONNECTIONS.forEach(conn => {
      const from = DISTRICTS.find(d => d.id === conn.from)!;
      const to = DISTRICTS.find(d => d.id === conn.to)!;
      
      const isPath = highlightedPath.includes(conn.from) && 
                     highlightedPath.includes(conn.to) &&
                     Math.abs(highlightedPath.indexOf(conn.from) - highlightedPath.indexOf(conn.to)) === 1;

      connectionsGroup.append('line')
        .attr('x1', from.x).attr('y1', from.y)
        .attr('x2', to.x).attr('y2', to.y)
        .attr('stroke', isPath ? '#10b981' : '#cbd5e1')
        .attr('stroke-width', isPath ? 4 : 2)
        .attr('stroke-dasharray', isPath ? 'none' : '4,4')
        .style('transition', 'all 0.3s ease');
    });

    // Draw districts (Traffic Signals)
    const nodesGroup = svg.append('g').attr('class', 'nodes');
    DISTRICTS.forEach(district => {
      const isActive = activeNode === district.id;
      const isVisited = visitedNodes.includes(district.id);
      const isPath = highlightedPath.includes(district.id);

      const node = nodesGroup.append('g')
        .attr('transform', `translate(${district.x}, ${district.y})`)
        .style('cursor', 'pointer')
        .on('click', () => onNodeClick?.(district.id));

      // Signal Pole
      node.append('rect')
        .attr('x', -2).attr('y', 0).attr('width', 4).attr('height', 20)
        .attr('fill', '#475569');

      // Signal Box
      node.append('rect')
        .attr('x', -8).attr('y', -30).attr('width', 16).attr('height', 30)
        .attr('rx', 4).attr('fill', '#1e293b');

      // Lights (Red, Amber, Green)
      const lights = [
        { color: '#ef4444', y: -24 }, // Red
        { color: '#f59e0b', y: -15 }, // Amber
        { color: '#10b981', y: -6 },  // Green
      ];

      lights.forEach((light, i) => {
        const isLit = isActive || (isPath && i === 2) || (isVisited && !isActive && !isPath && i === 0);
        node.append('circle')
          .attr('cx', 0).attr('cy', light.y).attr('r', 3)
          .attr('fill', isLit ? light.color : '#334155')
          .style('filter', isLit ? `drop-shadow(0 0 4px ${light.color})` : 'none');
      });

      // Label
      node.append('text')
        .attr('x', 12).attr('y', -10)
        .text(district.name)
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '12px')
        .attr('font-weight', isActive || isPath ? '600' : '400')
        .attr('fill', isActive ? '#1e293b' : '#64748b');
    });

    // Vehicle Animation (if path exists)
    if (highlightedPath.length > 1) {
      const vehicle = svg.append('g').attr('class', 'vehicle');
      vehicle.append('path')
        .attr('d', 'M-6,-4 L6,-4 L8,0 L6,4 L-6,4 L-8,0 Z')
        .attr('fill', '#10b981')
        .attr('stroke', '#fff').attr('stroke-width', 1);

      const animateVehicle = async () => {
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const from = DISTRICTS.find(d => d.id === highlightedPath[i])!;
          const to = DISTRICTS.find(d => d.id === highlightedPath[i+1])!;
          
          await vehicle.transition()
            .duration(1000)
            .attr('transform', `translate(${to.x}, ${to.y}) rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI})`)
            .end();
        }
      };
      
      const startNode = DISTRICTS.find(d => d.id === highlightedPath[0])!;
      vehicle.attr('transform', `translate(${startNode.x}, ${startNode.y})`);
      animateVehicle();
    }

  }, [activeNode, visitedNodes, highlightedPath]);

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden border border-slate-200 rounded-xl shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 text-[10px] font-mono uppercase tracking-widest text-slate-500">
        GIS Engine: AP-TRANS-V4.2
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 1000 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      />
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white/90 p-2 rounded border border-slate-200 text-[10px]">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Optimal Route</span>
        </div>
        <div className="flex items-center gap-2 bg-white/90 p-2 rounded border border-slate-200 text-[10px]">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <span>Standard Connection</span>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;

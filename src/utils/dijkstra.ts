/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DISTRICTS, CONNECTIONS, Connection } from '../constants';

export interface DijkstraResult {
  path: string[];
  distance: number;
  time: number;
  steps: DijkstraStep[];
}

export interface DijkstraStep {
  currentNode: string;
  visited: string[];
  distances: Record<string, number>;
  neighbors: string[];
}

export function calculateDijkstra(startId: string, endId: string): DijkstraResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const nodes = DISTRICTS.map(d => d.id);
  const steps: DijkstraStep[] = [];
  const visited: string[] = [];

  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[startId] = 0;
  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    let currentNode = Array.from(unvisited).reduce((minNode, node) => {
      if (minNode === null || distances[node] < distances[minNode]) {
        return node;
      }
      return minNode;
    }, null as string | null);

    if (currentNode === null || distances[currentNode] === Infinity) break;
    if (currentNode === endId) break;

    unvisited.delete(currentNode);
    visited.push(currentNode);

    const neighbors = CONNECTIONS.filter(c => c.from === currentNode || c.to === currentNode);
    const neighborIds: string[] = [];

    neighbors.forEach(edge => {
      const neighbor = edge.from === currentNode ? edge.to : edge.from;
      if (unvisited.has(neighbor)) {
        neighborIds.push(neighbor);
        // Traffic-aware weight calculation
        const weight = edge.distance * edge.trafficMultiplier;
        const alt = distances[currentNode!] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = currentNode;
        }
      }
    });

    steps.push({
      currentNode,
      visited: [...visited],
      distances: { ...distances },
      neighbors: neighborIds,
    });
  }

  const path: string[] = [];
  let curr: string | null = endId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // Calculate real distance and time (assuming 60km/h avg speed)
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = CONNECTIONS.find(c => 
      (c.from === path[i] && c.to === path[i+1]) || 
      (c.to === path[i] && c.from === path[i+1])
    );
    if (edge) totalDistance += edge.distance;
  }

  const totalTime = totalDistance / 60; // hours

  return {
    path,
    distance: totalDistance,
    time: totalTime,
    steps,
  };
}

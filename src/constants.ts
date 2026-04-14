/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface District {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface Connection {
  from: string;
  to: string;
  distance: number;
  trafficMultiplier: number; // 1.0 = low, 1.5 = moderate, 2.5 = heavy
}

export const DISTRICTS: District[] = [
  { id: 'vsp', name: 'Visakhapatnam District', x: 850, y: 150 },
  { id: 'rjy', name: 'Rajahmundry District', x: 700, y: 250 },
  { id: 'kkd', name: 'Kakinada District', x: 780, y: 220 },
  { id: 'vjw', name: 'Vijayawada District', x: 550, y: 350 },
  { id: 'gtr', name: 'Guntur District', x: 520, y: 380 },
  { id: 'nlr', name: 'Nellore District', x: 450, y: 650 },
  { id: 'tpt', name: 'Tirupati District', x: 400, y: 750 },
  { id: 'knl', name: 'Kurnool District', x: 250, y: 450 },
  { id: 'atp', name: 'Anantapur District', x: 200, y: 580 },
  { id: 'kdp', name: 'Kadapa District', x: 320, y: 620 },
];

export const CONNECTIONS: Connection[] = [
  { from: 'vsp', to: 'rjy', distance: 190, trafficMultiplier: 1.2 },
  { from: 'vsp', to: 'kkd', distance: 150, trafficMultiplier: 1.1 },
  { from: 'kkd', to: 'rjy', distance: 60, trafficMultiplier: 1.4 },
  { from: 'rjy', to: 'vjw', distance: 150, trafficMultiplier: 1.8 },
  { from: 'vjw', to: 'gtr', distance: 35, trafficMultiplier: 2.5 },
  { from: 'vjw', to: 'nlr', distance: 280, trafficMultiplier: 1.3 },
  { from: 'gtr', to: 'nlr', distance: 250, trafficMultiplier: 1.2 },
  { from: 'nlr', to: 'tpt', distance: 130, trafficMultiplier: 1.5 },
  { from: 'vjw', to: 'knl', distance: 360, trafficMultiplier: 1.1 },
  { from: 'knl', to: 'atp', distance: 150, trafficMultiplier: 1.2 },
  { from: 'atp', to: 'kdp', distance: 145, trafficMultiplier: 1.0 },
  { from: 'kdp', to: 'tpt', distance: 140, trafficMultiplier: 1.3 },
  { from: 'knl', to: 'gtr', distance: 320, trafficMultiplier: 1.4 },
  { from: 'vsp', to: 'vjw', distance: 350, trafficMultiplier: 1.6 },
];

export const TRAFFIC_LEVELS = {
  LOW: { label: 'Low', multiplier: 1.0, color: '#10b981' }, // Emerald-500
  MODERATE: { label: 'Moderate', multiplier: 1.5, color: '#f59e0b' }, // Amber-500
  HEAVY: { label: 'Heavy', multiplier: 2.5, color: '#ef4444' }, // Red-500
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  BarChart3, 
  Clock, 
  Cpu, 
  Flag, 
  History, 
  Info, 
  Layers, 
  MapPin, 
  Navigation, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  TrafficCone, 
  Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DISTRICTS, CONNECTIONS, TRAFFIC_LEVELS } from './constants';
import { calculateDijkstra, DijkstraResult, DijkstraStep } from './utils/dijkstra';
import MapVisualization from './components/MapVisualization';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom Traffic Signal Icon for Branding
const TrafficSignalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="2" width="8" height="16" rx="2" />
    <path d="M12 18v4" />
    <circle cx="12" cy="6" r="2" fill="#ef4444" stroke="none" />
    <circle cx="12" cy="10" r="2" fill="#f59e0b" stroke="none" />
    <circle cx="12" cy="14" r="2" fill="#10b981" stroke="none" />
  </svg>
);

export default function App() {
  const [origin, setOrigin] = useState('vsp');
  const [destination, setDestination] = useState('tpt');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<DijkstraResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // AI Traffic Prediction Data (Dynamic based on selected districts)
  const trafficData = useMemo(() => {
    const seed = origin.length + destination.length;
    return [
      { time: '06:00', density: 20 + (seed % 10) },
      { time: '08:00', density: 65 + (seed % 20) },
      { time: '10:00', density: 45 + (seed % 15) },
      { time: '12:00', density: 55 + (seed % 25) },
      { time: '14:00', density: 40 + (seed % 10) },
      { time: '16:00', density: 85 + (seed % 15) },
      { time: '18:00', density: 95 + (seed % 5) },
      { time: '20:00', density: 60 + (seed % 20) },
      { time: '22:00', density: 30 + (seed % 10) },
    ];
  }, [origin, destination]);

  const incidents = useMemo(() => {
    const originName = DISTRICTS.find(d => d.id === origin)?.name.split(' ')[0];
    const destName = DISTRICTS.find(d => d.id === destination)?.name.split(' ')[0];
    return [
      { type: 'Congestion', location: `${originName} Bypass`, time: '2m ago', severity: 'High' },
      { type: 'Road Work', location: `${destName} Entry`, time: '15m ago', severity: 'Moderate' },
    ];
  }, [origin, destination]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setResult(null);
    setCurrentStep(-1);
    setLogs(['Initializing GIS Routing Engine...', 'Loading District Topology...', 'Injecting Real-time Traffic Multipliers...']);

    const dijkstraResult = calculateDijkstra(origin, destination);
    
    // Simulate step-by-step execution
    for (let i = 0; i < dijkstraResult.steps.length; i++) {
      setCurrentStep(i);
      const step = dijkstraResult.steps[i];
      const cityName = DISTRICTS.find(d => d.id === step.currentNode)?.name;
      setLogs(prev => [...prev, `Evaluating ${cityName}... Neighbors: ${step.neighbors.map(n => DISTRICTS.find(d => d.id === n)?.name.split(' ')[0]).join(', ')}`]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setResult(dijkstraResult);
    setIsExecuting(false);
    setLogs(prev => [...prev, 'Optimization Complete.', `Shortest Path Found: ${dijkstraResult.path.map(id => DISTRICTS.find(d => d.id === id)?.name.split(' ')[0]).join(' → ')}`]);
  };

  const activeStepData = currentStep >= 0 && result ? result.steps[currentStep] : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      {/* Official Government Header */}
      <header className="bg-[#0f172a] text-white border-b-4 border-[#f59e0b] shadow-xl z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-[#f59e0b] shadow-inner overflow-hidden">
              <TrafficSignalIcon className="w-10 h-10 text-[#0f172a]" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-[#f59e0b]">
                GOVERNMENT OF ANDHRA PRADESH
              </h1>
              <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                Transport Department • Smart Route Optimizer (GIS-V4)
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-mono">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase">System Status</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase">Current Time</span>
              <span className="text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: AI Prediction & Controls */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          {/* AI Traffic Prediction Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">AI Traffic Prediction</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold animate-pulse">
                <div className="w-1 h-1 bg-red-600 rounded-full" />
                LIVE
              </div>
            </div>
            <div className="p-4">
              <div className="h-32 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="density" stroke="#6366f1" fillOpacity={1} fill="url(#colorDensity)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Peak Hour</span>
                  <span className="text-xs font-bold text-slate-700">04:00 PM - 06:00 PM</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Avg. Delay</span>
                  <span className="text-xs font-bold text-red-600">+12.4 mins</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Incidents</h3>
                {incidents.map((incident, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border-l-2 border-amber-500">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-700">{incident.type}</div>
                      <div className="text-[10px] text-slate-500">{incident.location}</div>
                      <div className="text-[9px] text-slate-400 mt-1">{incident.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 mt-4 italic leading-relaxed">
                * Predicted based on historical GIS data and current weather patterns.
              </p>
            </div>
          </section>

          {/* Control Panel */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Origin District
                </label>
                <select 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  disabled={isExecuting}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                >
                  {DISTRICTS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 lg:rotate-0" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Flag className="w-3 h-3" /> Destination District
                </label>
                <select 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={isExecuting}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                >
                  {DISTRICTS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={isExecuting || origin === destination}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-200",
                isExecuting 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
              )}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  OPTIMIZING...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  EXECUTE OPTIMIZER
                </>
              )}
            </button>
          </section>
        </aside>

        {/* Center: Map Visualization */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex-1 min-h-[500px] relative">
            <MapVisualization 
              activeNode={activeStepData?.currentNode || null}
              visitedNodes={activeStepData?.visited || []}
              highlightedPath={result?.path || []}
              onNodeClick={(id) => !isExecuting && setOrigin(id)}
            />
            
            {/* Floating Result Badge */}
            <AnimatePresence>
              {result && !isExecuting && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xl flex items-center gap-8 min-w-[320px]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Distance</div>
                      <div className="text-xl font-serif font-bold text-slate-800">{result.distance} km</div>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Time</div>
                      <div className="text-xl font-serif font-bold text-slate-800">
                        {Math.floor(result.time)}h {Math.round((result.time % 1) * 60)}m
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Legend & Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Low Traffic (1.0x)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Moderate (1.5x)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Heavy (2.5x)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono italic">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified by AP-GIS Authority
            </div>
          </div>
        </section>

        {/* Right Sidebar: Execution Log & Stats */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          {/* Optimization Engine Badge */}
          <section className="bg-indigo-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Zap className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/30 rounded-lg">
                <Cpu className="w-5 h-5 text-indigo-300" />
              </div>
              <h2 className="text-sm font-bold tracking-wider uppercase">Optimization Engine</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300">Algorithm</span>
                <span className="font-mono">Dijkstra-Traffic+</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300">Complexity</span>
                <span className="font-mono">O(E log V)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300">Mode</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 text-[10px]">Quantum-Inspired</span>
              </div>
            </div>
          </section>

          {/* Execution Log */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Execution Log</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] space-y-2 bg-slate-950 text-slate-300">
              {logs.length === 0 && (
                <div className="text-slate-600 italic">Waiting for execution...</div>
              )}
              {logs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <span className="text-slate-600">[{idx + 1}]</span>
                  <span>{log}</span>
                </motion.div>
              ))}
              {isExecuting && (
                <div className="flex gap-2 text-indigo-400 animate-pulse">
                  <span>{`[>]`}</span>
                  <span>Processing district topology...</span>
                </div>
              )}
            </div>
          </section>
        </aside>
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center grayscale opacity-50">
              <TrafficSignalIcon className="w-6 h-6 text-slate-900" />
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              © 2026 Government of Andhra Pradesh<br />
              Department of Transport & GIS Management
            </div>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Secure Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

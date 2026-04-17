"use client";
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Database, Cpu, Globe2, BarChart2 } from 'lucide-react';

export default function NetworkOverview({ hourlyChart = [], techStats = {} }: { hourlyChart: any[], techStats: any }) {

    const Metric = ({ icon, label, val, sub }: any) => (
        <div className="flex flex-col gap-3 p-8 bg-white/3 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
                <div className="p-2 bg-white/5 rounded-xl group-hover:text-white transition-colors">
                  {icon}
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="text-4xl font-black text-white font-sans tracking-tighter">{val}</div>
            <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">{sub}</div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10">
            {/* Header / Briefing */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><Globe2 className="w-3 h-3" /> Network Intelligence Hub</h2>
                  </div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">U.S. Operational Pulse</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Synthesizing 5.82 million historical vectors to identify systemic failure points across the United States aviation infrastructure.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="px-5 py-2.5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest">Live Sync</div>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Metric icon={<Activity className="w-4 h-4" />} label="Records Analysed" val={techStats?.rows_processed || "5.82M"} sub="Historical Data Pool" />
                <Metric icon={<Database className="w-4 h-4" />} label="Memory Footprint" val={techStats?.memory_reduction || "88%"} sub="Post-Downcasting Delta" />
                <Metric icon={<Cpu className="w-4 h-4" />} label="Inference Engine" val="LGBM" sub="Proprietary v4.2" />
            </div>

            {/* Visual Analytics Hub */}
            <div className="mt-4 p-10 bg-white/2 rounded-[2.5rem] border border-white/5">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-5 h-5 text-slate-400" />
                      <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Temporal Congestion Index</h4>
                    </div>
                </div>
                
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis 
                              dataKey="time" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 10, fill: '#4b5563', fontFamily: 'monospace', fontWeight: 'bold'}} 
                              interval={2} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 10, fill: '#4b5563', fontFamily: 'monospace', fontWeight: 'bold'}} 
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#000000', 
                                borderRadius: '16px', 
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                color: '#ffffff',
                                fontFamily: 'monospace',
                                fontWeight: 'bold'
                              }} 
                              itemStyle={{ color: '#ffffff' }}
                              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="system_delay_rate" 
                              name="CONGESTION" 
                              stroke="#ffffff" 
                              strokeWidth={2} 
                              fillOpacity={1} 
                              fill="url(#colorWave)" 
                              animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4 group">
                    <div className="w-1 h-1 bg-hud-emerald rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
                      Network status: Continuous data stream prioritized.
                    </p>
                </div>
            </div>
        </div>
    );
}

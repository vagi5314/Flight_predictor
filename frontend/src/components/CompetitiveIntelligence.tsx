"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AIRLINES, getAirlineName } from '@/constants/semantics';
import { ShieldAlert, BarChart3, Binary, Zap } from 'lucide-react';

export default function CompetitiveIntelligence() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8000/analytics/airlines').then(res => {
            const mapped = res.data.airline_chart.map((item: any) => ({
                ...item,
                fullName: getAirlineName(item.carrier)
            }));
            setData(mapped);
        }).catch(err => {
            console.error(err);
        });
    }, []);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black p-5 rounded-[1.5rem] border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">{payload[0].payload.fullName}</p>
                    <p className="text-sm font-black text-white italic">{payload[0].value}% <span className="text-[10px] opacity-40 italic font-mono font-bold">RISK_COEF</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Semantic Intelligence Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <div className="max-w-xl">
                  <div className="flex items-center mb-4">
                    <h2 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><BarChart3 className="w-3 h-3" /> Carrier Benchmarking Intelligence</h2>
                  </div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Network Variance by Carrier</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Decoding individual carrier performance signatures. This analysis reveals the inherent risk coefficients specific to major U.S. airline operations.
                  </p>
                </div>
            </div>

            {/* Performance Monitoring Deck */}
            <div className="p-10 bg-white/3 rounded-[3rem] border border-white/5 min-h-[500px]">
                <div className="flex items-center gap-3 mb-12">
                   <div className="p-2 bg-white/5 rounded-xl text-slate-400">
                      <Zap className="w-4 h-4" />
                   </div>
                   <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]">Operational Risk Gradient</h3>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 15, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="carrier" 
                                type="category" 
                                width={50} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fontWeight: 'black', fill: '#f8fafc', italic: true, fontFamily: 'monospace'}} 
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.02)'}} />
                            <Bar dataKey="risk" radius={[0, 12, 12, 0]} barSize={28}>
                                {data.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.risk > 35 ? '#FF4D4D' : entry.risk > 25 ? '#FFB800' : '#ffffff'} 
                                      className="transition-all hover:opacity-80"
                                      style={{ filter: `drop-shadow(0 0 8px ${entry.risk > 35 ? 'rgba(255,77,77,0.2)' : entry.risk > 25 ? 'rgba(255,184,0,0.2)' : 'rgba(255,255,255,0.1)'})` }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tactical Data Scientist Brief */}
                <div className="mt-12 p-8 bg-white/2 rounded-[2rem] border border-white/5 group hover:bg-white/4 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <Binary className="w-4 h-4 text-hud-cyan" />
                        <h4 className="text-[10px] font-mono font-bold text-hud-cyan uppercase tracking-widest">Model Interpretability Insights</h4>
                    </div>
                    <p className="text-[13px] text-slate-400 leading-relaxed italic font-sans group-hover:text-slate-200 transition-colors">
                      "By expanding the carrier IDs into full operational profiles, we see a strong correlation between hub-centric airlines and saturation delays. The LightGBM engine treats {data.length} carrier constants as categorical features to maintain inference accuracy across all {getAirlineName(data[0]?.carrier || 'AA')} type vectors."
                    </p>
                </div>
            </div>
        </div>
    );
}

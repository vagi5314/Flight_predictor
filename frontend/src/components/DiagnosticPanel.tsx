"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function DiagnosticPanel({ shapData }: { shapData: any[] }) {
  if (!shapData) return null;

  // Render top 5 most impactful features
  const sortedData = [...shapData].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5);
  const maxAbs = Math.max(...sortedData.map(d => Math.abs(d.impact)));

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 h-full font-mono text-sm shadow-2xl relative overflow-hidden"
    >
      <h3 className="text-slate-300 font-semibold tracking-wider mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        Root Cause Diagnostics (SHAP)
      </h3>
      
      <div className="space-y-3">
        {sortedData.map((item, idx) => {
          const widthPct = (Math.abs(item.impact) / maxAbs) * 100;
          const isPos = item.impact > 0;
          
          return (
            <div key={item.feature} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{item.feature}</span>
                <span className={isPos ? 'text-rose-400' : 'text-emerald-400'}>
                  {isPos ? '+' : ''}{item.impact.toFixed(3)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  className={`h-full ${isPos ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

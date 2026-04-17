"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Info, Terminal, Activity } from 'lucide-react';

interface TelemetryConsoleProps {
  title: string;
  briefing: string;
  logs?: { feature: string; impact: number }[];
  type?: 'default' | 'alert' | 'success';
}

export default function TelemetryConsole({ title, briefing, logs, type = 'default' }: TelemetryConsoleProps) {
  const accentColor = type === 'alert' ? 'text-hud-red' : type === 'success' ? 'text-hud-emerald' : 'text-hud-cyan';
  const borderColor = type === 'alert' ? 'border-hud-red/30' : type === 'success' ? 'border-hud-emerald/30' : 'border-hud-cyan/30';

  return (
    <div className={`glass-panel p-6 flex flex-col gap-6 ${borderColor}`}>
      {/* Header / Mission Objective */}
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-black/40 ${accentColor}`}>
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`font-mono text-xs font-bold uppercase tracking-[0.2em] mb-1 ${accentColor}`}>{title}</h3>
          <p className="text-[13px] text-slate-300 leading-relaxed font-sans max-w-2xl">
            {briefing}
          </p>
        </div>
      </div>

      {/* Telemetry Data Feed (SHAP/Technical Logs) */}
      {logs && logs.length > 0 && (
        <div className="bg-black/40 rounded-xl p-5 border border-white/5 font-mono">
          <div className="flex items-center gap-2 mb-4 text-[10px] text-hud-cyan/50 uppercase tracking-widest">
            <Terminal className="w-3 h-3" />
            <span>Root Cause Telemetry</span>
          </div>
          
          <div className="space-y-3">
            {logs.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).map((log, idx) => (
              <div key={log.feature} className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] uppercase tracking-tighter">
                  <span className="text-slate-500">{log.feature.replace(/_/g, ' ')}</span>
                  <span className={log.impact > 0 ? "text-hud-red" : "text-hud-emerald"}>
                    {log.impact > 0 ? "++" : "--"} {Math.abs(log.impact).toFixed(3)} VEC
                  </span>
                </div>
                <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.abs(log.impact) * 1000)}%` }} // Scaled for visual impact
                    transition={{ delay: idx * 0.1, duration: 1 }}
                    className={`h-full ${log.impact > 0 ? "bg-hud-red" : "bg-hud-emerald"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Pulse Footer */}
      <div className="flex items-center justify-between pt-2 mt-auto">
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <Activity className="w-3 h-3 animate-hud-pulse" />
          <span>Stream Integrity Validated</span>
        </div>
        <div className="text-[9px] font-mono text-slate-600">
          CHANNELS: 0x42 / 0x19
        </div>
      </div>
    </div>
  );
}

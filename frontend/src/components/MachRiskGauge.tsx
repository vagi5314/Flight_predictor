"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface MachRiskGaugeProps {
  probability: number; // 0 to 1
  label?: string;
}

export default function MachRiskGauge({ probability, label = "MACH RISK" }: MachRiskGaugeProps) {
  const percentage = probability * 100;
  const rotation = (percentage / 100) * 180 - 90; // -90deg to 90deg

  // Color logic based on probability
  const color = probability > 0.6 ? "#ef4444" : probability > 0.3 ? "#f59e0b" : "#22d3ee";

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background Arc */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(34, 211, 238, 0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored Progress Arc */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: probability }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Tick Marks (Avionics style) */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * Math.PI - Math.PI;
            const x1 = 50 + 35 * Math.cos(angle);
            const y1 = 50 + 35 * Math.sin(angle);
            const x2 = 50 + 45 * Math.cos(angle);
            const y2 = 50 + 45 * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(248, 250, 252, 0.2)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom -translate-x-1/2"
          style={{ 
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
          }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Center Pivot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-[#020617] border-2 border-white z-10" />
      </div>

      <div className="mt-4 text-center">
        <div className="text-[10px] font-mono tracking-widest text-hud-cyan/60 uppercase">{label}</div>
        <div className="text-3xl font-black font-mono tracking-tighter hud-text-glow" style={{ color }}>
          {percentage.toFixed(1)}<span className="text-sm opacity-50 ml-1">%</span>
        </div>
      </div>
    </div>
  );
}

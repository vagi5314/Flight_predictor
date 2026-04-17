"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface TacticalVectorMapProps {
  origin?: string;
  destination?: string;
  isActive: boolean;
}

export default function TacticalVectorMap({ origin = "---", destination = "---", isActive }: TacticalVectorMapProps) {
  return (
    <div className="relative w-full h-[300px] glass-panel overflow-hidden flex flex-col items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 hud-scanline opacity-20" />
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      <svg viewBox="0 0 400 200" className="w-full h-full relative z-10 px-8">
        {/* Coordinate Crosshairs */}
        <line x1="200" y1="0" x2="200" y2="200" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="1" />
        <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="1" />

        {/* Origin Node */}
        <g transform="translate(80, 100)">
          <motion.circle 
            r="4" 
            fill="#22d3ee" 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text y="-15" textAnchor="middle" className="fill-hud-cyan text-[10px] font-mono font-bold uppercase tracking-widest">{origin}</text>
          <circle r="12" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '10s' }} />
        </g>

        {/* Destination Node */}
        <g transform="translate(320, 70)">
          <motion.circle 
            r="4" 
            fill={isActive ? "#f59e0b" : "#475569"} 
            animate={isActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text y="-15" textAnchor="middle" className={isActive ? "fill-hud-gold text-[10px] font-mono font-bold uppercase" : "fill-slate-500 text-[10px] font-mono font-bold uppercase"}>
            {destination}
          </text>
          {isActive && (
            <path d="M -8 -8 L -4 -8 M 8 -8 L 4 -8 M -8 8 L -4 8 M 8 8 L 4 8 M -8 -8 L -8 -4 M 8 -8 L 8 -4 M -8 8 L -8 4 M 8 8 L 8 4" stroke="#f59e0b" strokeWidth="1" fill="none" />
          )}
        </g>

        {/* Flight Path Vector */}
        {isActive && (
          <motion.path
            d="M 80 100 Q 200 40 320 70"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-6 flex gap-8">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-hud-cyan/50 tracking-[0.2em] uppercase">Vector Inbound</span>
          <span className="text-xs font-mono font-bold text-white tracking-widest">{origin}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-hud-cyan/50 tracking-[0.2em] uppercase">Vector Outbound</span>
          <span className="text-xs font-mono font-bold text-white tracking-widest">{destination}</span>
        </div>
      </div>

      <div className="absolute top-4 right-6 text-[9px] font-mono text-hud-cyan/40 tracking-[0.3em] uppercase animate-hud-pulse">
        Active Tracking Enabled
      </div>
    </div>
  );
}

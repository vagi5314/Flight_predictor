"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, Zap, Cpu, HelpCircle } from 'lucide-react';

export default function Methodology({ techStats }: { techStats?: any }) {
  const pipeline = [

    { step: "1. Bronze Layer (Raw)", tech: "BTS Aviation Data", desc: "Ingested 5.8M+ raw historical data records directly from the Bureau of Transportation Statistics (BTS)." },
    { step: "2. Silver Layer (Optimized)", tech: "500k Stratified Sample", desc: "Applied stratified sampling to perfectly maintain the original delay distribution while optimizing for iteration speed and memory." },
    { step: "3. Gold Layer (Features)", tech: "Medallion Architecture", desc: "Nulls stripped, temporal cycles encoded, and heavy categorical variables target-encoded into production-ready Parquet." },
    { step: "4. Edge Inference", tech: "FastAPI + LightGBM", desc: "A decoupled python backend calculates predictions instantly, feeding SHAP value diagnostics securely to the React HUD." }
  ];

  const findings = [
    {
      title: "1. The 'Time of Day' Effect",
      icon: <Clock className="w-5 h-5 text-hud-cyan" />,
      desc: "Flights departing in the late evening (6 PM - 10 PM) are significantly more likely to be delayed. Our data proves that morning disruptions cascade forward, creating structural congestion by nightfall.",
      stat: "PROVEN: CHI-SQUARE"
    },
    {
      title: "2. Airline Choice Matters",
      icon: <ShieldAlert className="w-5 h-5 text-hud-gold" />,
      desc: "Airline performance isn't just about weather; it's about operations. Our analysis proved that carrier choice is a critical, structural driver of delay risk independent of the route.",
      stat: "PROVEN: ANOVA"
    },
    {
      title: "3. The 'Low-Cost' Blindspot",
      icon: <Zap className="w-5 h-5 text-hud-red" />,
      desc: "By analyzing where our AI failed, we discovered that Low-Cost Carriers (like Spirit) have a 25% unpredictable delay rate. Tighter schedules introduce volatility that machines cannot easily predict.",
      stat: "RESIDUAL ERROR: 25%"
    }
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* SECTION 1: HOW IT WORKS (ARCHITECTURE) */}
      <div className="mb-8">
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-2xl">System Architecture</h3>
        <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-3xl">
          AeroMetric utilizes a Data Science Medallion Architecture (Bronze → Silver → Gold) connecting a Python backend to a React frontend. The pipeline is purposefully engineered for computational efficiency.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map((item, idx) => (
                <div key={idx} className="v4-glass-card p-6 rounded-3xl border border-white/10 hover:bg-white/5 transition-colors">
                    <h4 className="text-xs font-mono font-bold text-hud-cyan uppercase tracking-widest mb-1">{item.tech}</h4>
                    <h5 className="text-xl font-black text-white tracking-tight mb-3">{item.step}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                </div>
            ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-white/10 my-4" />

      {/* SECTION 2: RESEARCH FINDINGS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="max-w-4xl">
          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-2xl">Scientific Findings</h3>
          <p className="text-slate-300 text-base leading-relaxed mb-6">
            We processed a 500k subset from the 5.8M+ BTS records. Instead of just building a black-box predictor, we used statistical analysis to uncover the actual structural drivers of aviation delays.
          </p>
          
          <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
            <HelpCircle className="w-5 h-5 text-hud-cyan mt-0.5 shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              <strong>Teacher Note:</strong> True Data Science isn't about bragging that your AI is 100% accurate. It's about finding the truth in the data and understanding exactly where and why the model fails.
            </p>
          </div>
        </div>
      </div>

      {/* Findings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {findings.map((card, idx) => (
          <motion.div 
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="v4-glass-card p-8 rounded-[3rem] hover:bg-white/5 transition-all group flex flex-col items-start"
          >
            <div className="flex justify-between items-start mb-8 w-full">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5">
                    {card.icon}
                </div>
            </div>
            
            <h3 className="text-xl font-black text-white tracking-tight mb-4">{card.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans mb-10 flex-1">{card.desc}</p>
            
            <div className="pt-6 border-t border-white/5 w-full">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 inline-block">
                    {card.stat}
                </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

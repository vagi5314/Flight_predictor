"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlaneTakeoff, 
  BrainCircuit, 
  BookOpen, 
  ShieldCheck
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Component Imports
import CommandCenter from '@/components/CommandCenter';
import IntelligenceHub from '@/components/IntelligenceHub';
import Methodology from '@/components/Methodology';

function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

type ModuleType = 'simulator' | 'tech';

export default function AeroMetricGlass() {
  const [activeTab, setActiveTab] = useState<ModuleType>('simulator');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [techStats, setTechStats] = useState<any>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    axios.get(`${apiUrl}/analytics/global`).then(res => {
      setTechStats(res.data.tech_stats);
    }).catch(() => {});
  }, []);

  const navItems = [
    { id: 'simulator', label: 'Risk Simulator', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'tech', label: 'Tech Intelligence', icon: <BookOpen className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="relative min-h-screen text-slate-100 font-sans selection:bg-white/20">
      
      {/* Dynamic Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1473862170180-84427c485aca?q=80&w=2000&auto=format&fit=crop")',
        }}
      >
        {/* Architectural Overlays: Neutralizing interior lighting to prioritize UI focus */}
        <div className="absolute inset-0 bg-black/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Premium Tab Navigation Header */}
        <header className="pt-16 pb-12 px-8 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <PlaneTakeoff className="text-black w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic drop-shadow-2xl">AeroMetric</h1>
            </div>
            <p className="text-sm text-slate-300 text-center max-w-lg leading-relaxed font-sans">
              Predict whether your flight will be delayed — and understand exactly why. Powered by a LightGBM pipeline trained on a 500k stratified sample of our 5.8M+ BTS Aviation dataset.
            </p>
          </div>

          {/* Single-Select Clean Pill Tabs */}
          <nav className="flex flex-wrap justify-center gap-4 p-2 bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "v4-pill",
                  activeTab === item.id ? "v4-pill-active" : "v4-pill-inactive"
                )}
              >
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Focused Single-View Data Grid */}
        <main className="p-4 md:p-8 max-w-[1800px] mx-auto w-full flex-grow">
          
          <AnimatePresence mode="wait">
            {activeTab === 'simulator' && (
              <motion.div 
                key="simulator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full"
              >
                <div className="xl:col-span-4 h-full">
                  <CommandCenter setPredictionData={setPredictionData} setIsLoading={setIsLoading} isLoading={isLoading} />
                </div>
                <div className="xl:col-span-8 h-full">
                  <IntelligenceHub data={predictionData} isLoading={isLoading} />
                </div>
              </motion.div>
            )}

            {activeTab === 'tech' && (
              <motion.div 
                key="tech"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                <div className="v4-glass-card rounded-[3rem] p-12 h-full">
                  <Methodology techStats={techStats} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Removed */}
      </div>
    </div>
  );
}

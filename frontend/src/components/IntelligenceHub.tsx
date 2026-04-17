"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Info, Zap, TrendingUp, TrendingDown, HelpCircle, BarChart3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { getAirportName, getAirlineName } from '@/constants/semantics';

// Human-readable feature names
const FEATURE_NAMES: Record<string, string> = {
  'SCHEDULED_DEPARTURE': 'Departure Window',
  'ORIGIN_AIRPORT': 'Departure Airport',
  'DESTINATION_AIRPORT': 'Arrival Airport',
  'DAY_OF_WEEK': 'Day of Week',
  'MONTH': 'Seasonality',
  'AIRLINE': 'Carrier Reliability',
  'DISTANCE': 'Flight Distance',
  'AIRLINE_target_enc': 'Airline Performance',
  'ORIGIN_AIRPORT_target_enc': 'Airport Efficiency',
  'airline_airport_inter_enc': 'Hub Operations',
  'dep_hour_sin': 'Time of Day',
  'dep_hour_cos': 'Time of Day',
};

// Per-factor aviation explanations (real, not placeholder)
const FEATURE_EXPLANATIONS: Record<string, string> = {
  'SCHEDULED_DEPARTURE': 'Flights later in the day are more prone to delays as morning disruptions cascade forward.',
  'ORIGIN_AIRPORT': 'Delay risk is driven by the airport\'s historical congestion and runway capacity.',
  'DESTINATION_AIRPORT': 'Arrival traffic and gate availability at the destination significantly impact on-time performance.',
  'DAY_OF_WEEK': 'Higher passenger volumes on peak days increase operational pressure at the gates.',
  'MONTH': 'Seasonal weather patterns and holiday surges shift delay probabilities throughout the year.',
  'AIRLINE': 'Carrier-specific operational efficiency and fleet reliability are primary drivers.',
  'DISTANCE': 'Longer flights include more schedule buffer but face higher ATC rerouting risks.',
};

function humanizeFeature(raw: string): string {
  return FEATURE_NAMES[raw] || raw.replace(/_/g, ' ');
}

function getFeatureExplanation(raw: string): string {
  return FEATURE_EXPLANATIONS[raw] || 'This factor contributes to the overall delay prediction based on historical patterns.';
}

export default function IntelligenceHub({ data, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="v4-glass-card rounded-[3rem] h-[600px] flex flex-col items-center justify-center p-8">
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-white font-mono font-bold text-xs uppercase tracking-[0.4em] animate-pulse">Analyzing flight data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="v4-glass-card rounded-[3rem] h-[600px] flex flex-col items-center justify-center p-12 border-dashed">
        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 mb-8">
            <Navigation className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-slate-300 font-mono font-bold text-xs text-center max-w-xs leading-relaxed uppercase tracking-[0.2em] mb-4">
            Waiting for Input
        </p>
        <p className="text-slate-400 text-sm text-center max-w-sm leading-relaxed font-sans mt-2">
            Configure a flight on the left panel and click "Generate Prediction" to see the full risk analysis and breakdown.
        </p>
      </div>
    );
  }

  // Find the biggest risk driver for dynamic max-scaling
  const topFactor = [...data.shap_values].sort((a: any, b: any) => Math.abs(b.impact) - Math.abs(a.impact))[0];
  const topFactorName = humanizeFeature(topFactor?.feature || '');
  const maxImpact = Math.abs(topFactor?.impact) || 1;

  const getQualitativeImpact = (impact: number) => {
    if (impact > 0.1) return { label: 'High Risk', color: 'text-red-400' };
    if (impact > 0) return { label: 'Moderate Risk', color: 'text-amber-400' };
    if (impact >= -0.1) return { label: 'Low Buffer', color: 'text-emerald-400' };
    return { label: 'Strong Buffer', color: 'text-blue-400' };
  };

  // Transform SHAP values for Bipolar Radar Chart
  const topFeatures = [...data.shap_values]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 6);

  const localMaxImpact = Math.abs(topFeatures[0]?.impact) || 1;

  const bipolarData = topFeatures.map((s: any) => {
    const magnitude = Math.abs(s.impact) / localMaxImpact;
    const scaledValue = Math.sqrt(magnitude) * 100;

    return {
      subject: humanizeFeature(s.feature),
      inc: s.impact > 0 ? Math.max(5, scaledValue) : 0,
      red: s.impact < 0 ? Math.max(5, scaledValue) : 0,
      fullMark: 100,
    };
  });

  // Count risk factors
  const riskUpCount = data.shap_values.filter((s: any) => s.impact > 0).length;
  const totalFactors = data.shap_values.length;

  // Data for the 3-bar comparison
  const pctRisk = (data.probability * 100).toFixed(0);
  const yourFlightRisk = Math.round(data.probability * 100);
  const avgRouteRisk = data.avg_route_risk ?? 20;
  const avgHourRisk = data.avg_hour_risk ?? 20;
  const airlineName = getAirlineName(data.carrier || 'DL');
  const originName = getAirportName(data.origin || 'ATL');
  const destName = getAirportName(data.dest || 'JFK');

  // Dynamic comparison sentence
  const routeComparison = yourFlightRisk > avgRouteRisk
    ? `Your flight's ${pctRisk}% delay risk is higher than the ${avgRouteRisk}% average for ${originName} → ${destName} flights.`
    : `Your flight's ${pctRisk}% delay risk is lower than the ${avgRouteRisk}% average for ${originName} → ${destName} flights.`;
  
  const hourComparison = yourFlightRisk > avgHourRisk
    ? `It's also above the ${avgHourRisk}% average for all flights departing at this hour.`
    : `It's also below the ${avgHourRisk}% average for all flights departing at this hour.`;

  // Explanation sentence
  const isTopFactorRisk = topFactor?.impact > 0;
  const topFactorInfluence = isTopFactorRisk ? 'increasing' : 'reducing';
  const topFactorVerb = isTopFactorRisk ? 'pushing the delay likelihood up' : 'pulling the delay likelihood down';

  const explanationText = data.probability > 0.6
    ? `Your ${airlineName} flight carries a high delay risk, primarily driven by ${topFactorName.toLowerCase()}.`
    : data.probability > 0.3
    ? `Your flight shows moderate risk, with ${topFactorName.toLowerCase()} acting as the primary driver.`
    : `Your flight appears stable, with ${topFactorName.toLowerCase()} and other metrics indicating an on-time departure.`;

  // Risk color helper
  const riskColor = data.probability > 0.6 ? 'red' : data.probability > 0.3 ? 'amber' : 'emerald';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-8">
        
        {/* Top Analysis Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Radar Chart */}
          <div className="xl:col-span-5 v4-glass-card rounded-[3rem] p-6 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex justify-between items-center mb-4 z-10">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Key Delay Drivers</h3>
              <Zap className="w-4 h-4 text-hud-gold shrink-0" />
            </div>

            {/* Section 1: Instruction */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-white/10 mb-4 z-10 w-full shadow-lg">
              <HelpCircle className="w-5 h-5 text-hud-gold mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-hud-gold uppercase tracking-[0.2em]">How to read this chart</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  <span className="text-red-400 font-bold">Red</span> spikes increase risk; <span className="text-emerald-400 font-bold">Green</span> spikes reduce it. Top 6 factors shown.
                </p>
              </div>
            </div>

            <div className="h-[200px] w-full z-10">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="50%" data={bipolarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff', fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  <Radar
                    name="Risk Increasers"
                    dataKey="inc"
                    stroke="#f87171"
                    strokeWidth={3}
                    fill="#f87171"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Risk Reducers"
                    dataKey="red"
                    stroke="#34d399"
                    strokeWidth={3}
                    fill="#34d399"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Section 2: Explaining (below graph) */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-white/10 mt-4 mb-2 z-10 w-full border-l-4 border-l-hud-cyan shadow-lg">
              <Info className="w-5 h-5 text-hud-cyan mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-hud-cyan uppercase tracking-[0.2em]">What the output tells you</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-white font-bold">{topFactorName}</strong> is the primary risk driver. <strong className="text-white font-bold">{riskUpCount} of {totalFactors}</strong> factors are currently increasing delay likelihood.
                </p>
              </div>
            </div>

            {/* Factor List */}
            <div className="flex flex-wrap gap-2 mt-2 mb-2 z-10 w-full">
              {data.shap_values.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).map((s: any) => (
                <div key={s.feature} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${
                  s.impact > 0
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.impact > 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  {humanizeFeature(s.feature)}
                </div>
              ))}
            </div>

            {/* Radar Verdict */}
            <div className="z-10 mt-1 bg-black/40 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
              <p className="text-sm text-slate-300 text-center font-sans tracking-wide">
                <span className="font-black text-white px-1">{riskUpCount} of {totalFactors}</span> factors are increasing the risk.
              </p>
            </div>
          </div>
          
          {/* Prediction Summary + 3-Bar Comparison */}
          <div className="xl:col-span-7 v4-glass-card rounded-[3rem] p-8 flex flex-col justify-between relative overflow-hidden h-full">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-4 h-4 text-hud-cyan" />
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-[0.3em]">Delay Likelihood</h3>
              </div>
              
              {/* Teacher Guidance */}
              <div className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-white/10 mb-8 w-full border-l-4 border-l-hud-cyan shadow-lg">
                <HelpCircle className="w-5 h-5 text-hud-cyan mt-0.5 shrink-0" />
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-hud-cyan uppercase tracking-[0.2em]">System Verdict</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Final delay probability based on historical patterns, compared against route and hourly averages.
                  </p>
                </div>
              </div>

              {/* Massive Verdict Layout */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div>
                  <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Final Forecast</p>
                  <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${
                    data.probability > 0.6 ? 'text-red-400' :
                    data.probability > 0.3 ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {data.probability > 0.6 ? 'Delay Expected' : data.probability > 0.3 ? 'Moderate Risk' : 'On Time'}
                  </h2>
                </div>
                
                <div className={`px-6 py-4 rounded-3xl border flex flex-col items-center justify-center shrink-0 shadow-2xl ${
                  data.probability > 0.6 ? 'bg-red-500/20 border-red-500/30 shadow-red-500/20' :
                  data.probability > 0.3 ? 'bg-amber-500/20 border-amber-500/30 shadow-amber-500/20' :
                  'bg-emerald-500/20 border-emerald-500/30 shadow-emerald-500/20'
                }`}>
                  <span className="text-4xl font-black text-white leading-none">{pctRisk}%</span>
                  <span className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest mt-1">Probability</span>
                </div>
              </div>

              {/* Human-readable explainer */}
              <p className="text-lg text-slate-200 leading-snug font-medium border-l-4 border-white/20 pl-4 py-1 mb-8">
                "{explanationText}"
              </p>
            </div>

            {/* 3-Bar Horizontal Comparison */}
            <div className="relative z-10 mt-auto bg-black/20 p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-slate-300" />
                <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">How Does Your Flight Compare?</p>
              </div>
              
              {/* Chart explanation */}
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
                The colored bar is your flight's predicted delay risk. The gray bars show the historical average for this specific route and for all flights at this departure hour. If your bar is longer, your flight is riskier than usual.
              </p>

              <div className="flex flex-col gap-4">
                {/* Your Flight */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-white w-32 shrink-0 text-right">Your Flight</span>
                  <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, yourFlightRisk)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        data.probability > 0.6 ? 'bg-red-400' :
                        data.probability > 0.3 ? 'bg-amber-400' :
                        'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-black w-12 text-right ${
                    data.probability > 0.6 ? 'text-red-400' :
                    data.probability > 0.3 ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>{yourFlightRisk}%</span>
                </div>
                
                {/* Route Average */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-slate-400 w-32 shrink-0 text-right">Route Avg.</span>
                  <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, avgRouteRisk)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className="h-full rounded-full bg-slate-500"
                    />
                  </div>
                  <span className="text-sm font-black text-slate-400 w-12 text-right">{avgRouteRisk}%</span>
                </div>
                
                {/* Hour Average */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-slate-400 w-32 shrink-0 text-right">Hour Avg.</span>
                  <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, avgHourRisk)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="h-full rounded-full bg-slate-500"
                    />
                  </div>
                  <span className="text-sm font-black text-slate-400 w-12 text-right">{avgHourRisk}%</span>
                </div>
              </div>

              {/* Dynamic comparison sentence */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-5 border-t border-white/5 pt-4">
                {routeComparison} {hourComparison}
              </p>
            </div>
          </div>
        </div>

        {/* SHAP Feature Attribution */}
        <div className="v4-glass-card rounded-[3rem] p-8">
          <div className="flex flex-col gap-6 mb-10">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-4">Risk Evidence — Top 4 SHAP Impacts</h3>
              
              {/* Teacher Guidance */}
              <div className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-white/10 max-w-4xl border-l-4 border-l-hud-gold shadow-lg mb-6">
                <HelpCircle className="w-5 h-5 text-hud-gold mt-0.5 shrink-0" />
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-hud-gold uppercase tracking-[0.2em]">AI Decision Breakdown</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Here are the Top 4 factors that influenced the AI's final decision. We show you exactly how much weight each factor carried in determining your flight's overall delay risk.
                  </p>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-slate-300 font-medium">
                  <span className="text-red-400 font-bold">Red</span> = This factor pushed the delay risk higher
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300 font-medium">
                  <span className="text-emerald-400 font-bold">Green</span> = This factor pulled the delay risk lower
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.shap_values.slice(0, 4).map((item: any) => (
              <div key={item.feature} className="p-6 bg-black/40 rounded-3xl border border-white/10 flex flex-col justify-between min-h-[200px] shadow-xl relative overflow-hidden group">
                
                {/* Subtle gradient glow matching the impact */}
                <div className={`absolute -inset-1 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity ${item.impact > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />

                <div className="relative z-10">
                  <div className="text-xs font-mono font-bold text-white uppercase tracking-tighter mb-2">{humanizeFeature(item.feature)}</div>
                  {/* Direction indicator */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {item.impact > 0 
                      ? <><TrendingUp className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-400 font-bold tracking-wide">Increases Risk</span></>
                      : <><TrendingDown className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold tracking-wide">Reduces Risk</span></>
                    }
                  </div>
                  {/* Real aviation explanation */}
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {getFeatureExplanation(item.feature)}
                  </p>
                </div>
                
                <div className="relative z-10 mt-auto pt-4">
                  <div className={`text-lg font-bold mb-3 ${item.impact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {getQualitativeImpact(item.impact).label}
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, (Math.abs(item.impact) / maxImpact) * 100)}%` }}
                      className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${item.impact > 0 ? 'bg-red-400 text-red-500' : 'bg-emerald-400 text-emerald-500'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}

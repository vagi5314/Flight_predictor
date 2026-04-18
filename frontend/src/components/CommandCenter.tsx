"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, ChevronRight, MapPin, Info, AlertTriangle } from 'lucide-react';
import { AIRLINES, AIRPORTS } from '@/constants/semantics';
import GlassSelect from '@/components/GlassSelect';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const WEEKDAYS = [
  { value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' }, { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' }, { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

// Convert minutes-since-midnight to 12-hour display
function formatTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Convert minutes-since-midnight to military time for API
function toMilitary(totalMinutes: number): number {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours * 100 + mins;
}

export default function CommandCenter({ setPredictionData, setIsLoading, isLoading }: any) {
  const [form, setForm] = useState({
    month: 6, day_of_week: 3, airline: 'DL',
    origin_airport: 'ATL', destination_airport: 'JFK',
    departure_minutes: 840, // 14:00 = 840 minutes
    distance: 800
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    // --- Frontend Guardrails ---
    if (form.origin_airport === form.destination_airport) {
      setError("Flight cannot depart and arrive at the same airport.");
      setIsLoading(false);
      return;
    }

    if (form.distance <= 0) {
      setError("Flight distance must be a positive value.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        month: form.month,
        day_of_week: form.day_of_week,
        airline: form.airline,
        origin_airport: form.origin_airport,
        destination_airport: form.destination_airport,
        scheduled_departure: toMilitary(form.departure_minutes),
        distance: form.distance
      };
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/predict`, payload);
      setPredictionData(res.data);
    } catch (e: any) {
      if (e.response?.status === 503) {
        setError("The prediction model hasn't been trained yet. Run 02_train_model.py first.");
      } else if (e.response?.status === 400) {
        setError(e.response.data.detail || "Invalid flight configuration.");
      } else {
        setError("Unable to connect to the Aviation Intelligence API. Please check your connection or try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Map options for GlassSelect
  const airlineOptions = AIRLINES.map(a => ({ value: a.id, label: `${a.id} — ${a.name}` }));
  const airportOptions = AIRPORTS.map(a => ({ value: a.id, label: `${a.id} — ${a.name}` }));

  return (
    <div className="v4-glass-card rounded-[3rem] p-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Delay Predictor</h2>
          <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Your Flight</p>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <MapPin className="w-5 h-5 text-hud-cyan" />
        </div>
      </div>

      {/* Guidance */}
      <div className="flex items-start gap-3 p-4 bg-white/3 rounded-2xl border border-white/5 mb-5">
        <Info className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          Select the flight details below and generate a prediction. The model analyzes historical patterns across 150,000 flights to estimate the delay risk for this route.
        </p>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 mb-5">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300 leading-relaxed font-sans">{error}</p>
        </div>
      )}

      <div className="space-y-5 flex-1">
        {/* Airline — searchable */}
        <GlassSelect
          label="Airline"
          options={airlineOptions}
          value={form.airline}
          onChange={(v) => setForm({...form, airline: v as string})}
          searchable={true}
          placeholder="Select airline..."
        />

        {/* Route — searchable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassSelect
            label="Departing From"
            options={airportOptions}
            value={form.origin_airport}
            onChange={(v) => setForm({...form, origin_airport: v as string})}
            searchable={true}
            placeholder="Select airport..."
          />
          <GlassSelect
            label="Flying To"
            options={airportOptions}
            value={form.destination_airport}
            onChange={(v) => setForm({...form, destination_airport: v as string})}
            searchable={true}
            placeholder="Select airport..."
          />
        </div>

        {/* Date — no search needed */}
        <div className="grid grid-cols-2 gap-6">
          <GlassSelect
            label="Month"
            options={MONTHS}
            value={form.month}
            onChange={(v) => setForm({...form, month: v as number})}
          />
          <GlassSelect
            label="Day of Week"
            options={WEEKDAYS}
            value={form.day_of_week}
            onChange={(v) => setForm({...form, day_of_week: v as number})}
          />
        </div>

        {/* Departure Time — fixed slider (minutes-based) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Departure Time</span>
            <span className="text-white font-mono font-black text-sm">{formatTime(form.departure_minutes)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1439"
            step="5"
            value={form.departure_minutes} 
            onChange={e=>setForm({...form, departure_minutes: +e.target.value})} 
            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white" 
          />
        </div>
      </div>

      <button 
        disabled={isLoading} 
        onClick={handleSubmit} 
        className="w-full mt-8 bg-white hover:bg-slate-200 text-black font-black font-sans tracking-widest py-5 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3 group"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            GENERATE PREDICTION
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <div className="mt-10 pt-10 border-t border-white/5 opacity-60">
        <p className="text-[10px] text-slate-300 font-sans italic leading-relaxed text-center uppercase tracking-widest">
          Research Pipeline: Processed 5.8 Million historical FAA records, downsampled to a 500,000 optimized Parquet validation set.
        </p>
      </div>
    </div>
  );
}

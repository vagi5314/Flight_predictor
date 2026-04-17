"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface GlassSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  label: string;
  searchable?: boolean;
  placeholder?: string;
}

export default function GlassSelect({ options, value, onChange, label, searchable = false, placeholder = "Select..." }: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(o => o.value === value);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div className="group relative" ref={containerRef}>
      <label className="text-xs font-mono font-bold text-slate-400 uppercase mb-3 block tracking-[0.2em] group-hover:text-white transition-colors">
        {label}
      </label>
      
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel - Expanded width to prevent name clipping */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 left-0 min-w-full w-max max-w-[85vw] md:max-w-md mt-2"
          >
            <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
              {/* Search Bar */}
              {searchable && (
                <div className="p-3 border-b border-white/5">
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Type to search..."
                      className="bg-transparent text-sm text-white outline-none w-full placeholder:text-slate-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="max-h-[240px] overflow-y-auto py-1">
                {filtered.length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500 italic">No results found</div>
                )}
                {filtered.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all cursor-pointer flex items-start gap-3 ${
                      option.value === value
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {option.value === value && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0 mt-1.5" />
                    )}
                    <span className="whitespace-normal leading-snug">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

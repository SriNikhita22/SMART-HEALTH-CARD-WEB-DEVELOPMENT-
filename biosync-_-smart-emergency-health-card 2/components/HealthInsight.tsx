
import React, { useState, useEffect } from 'react';
import { UserHealthData } from '../types';
import { getHealthInsight } from '../services/geminiService';

interface HealthInsightProps {
  data: UserHealthData;
  theme: 'dark' | 'light';
}

export const HealthInsight: React.FC<HealthInsightProps> = ({ data, theme }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsight() {
      setLoading(true);
      const result = await getHealthInsight(data);
      setInsight(result);
      setLoading(false);
    }
    fetchInsight();
  }, [data]);

  return (
    <div className="glass p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <span className="flex h-4 w-4 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
          </span>
          <h3 className="text-red-500 font-black text-[12px] uppercase tracking-[0.4em]">Action-Oriented Protocol</h3>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className={`h-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'} rounded-lg animate-pulse w-full`}></div>
            <div className={`h-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'} rounded-lg animate-pulse w-11/12`}></div>
            <div className={`h-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'} rounded-lg animate-pulse w-10/12`}></div>
          </div>
        ) : (
          <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-2xl leading-snug whitespace-pre-line font-black tracking-tight italic uppercase`}>
            {insight}
          </div>
        )}
      </div>
    </div>
  );
};

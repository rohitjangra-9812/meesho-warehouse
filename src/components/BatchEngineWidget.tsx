import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Database, RefreshCw, Zap } from 'lucide-react';

export function BatchEngineWidget() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(new Date());
  const [nextRunMinutes, setNextRunMinutes] = useState(30);
  
  useEffect(() => {
    // Countdown timer for next automated batch run
    const timer = setInterval(() => {
      setNextRunMinutes((prev) => {
        if (prev <= 1) {
           return 30; // reset to 30 after it fires on backend
        }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const triggerManualBatch = async () => {
    try {
      setIsGenerating(true);
      await fetchApi('/system/batch-generate', { method: 'POST' });
      setLastRun(new Date());
      setNextRunMinutes(30); // reset countdown
      // trigger global refresh event so all active views reload
      window.dispatchEvent(new Event('auto-refresh'));
      alert('Batch Generation Complete! Added 20 new entries across all modules.');
    } catch (e) {
      console.error(e);
      alert('Failed to generate batch data.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl shadow-lg border border-indigo-500 overflow-hidden mb-6 flex flex-col md:flex-row items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="bg-blue-500/30 p-3 rounded-xl border border-blue-400/50 flex items-center justify-center relative">
          <Database className="w-6 h-6 text-blue-200" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            Automated Batch Generator
            <span className="bg-blue-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white tracking-widest">Active</span>
          </h3>
          <p className="text-blue-200 text-sm">
            Injecting 20 records across all modules every 30 mins to keep data fresh.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6 mt-4 md:mt-0">
        <div className="text-right">
          <p className="text-xs text-blue-300 uppercase font-semibold tracking-wider">Next Auto Run</p>
          <p className="font-mono text-xl text-white font-light">
            In {nextRunMinutes} min
          </p>
        </div>
        
        <button 
          onClick={triggerManualBatch}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-md ${isGenerating ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-white text-indigo-900 hover:bg-blue-50 hover:shadow-lg'}`}
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
          {isGenerating ? 'Generating Data...' : 'Force Generation Now'}
        </button>
      </div>
    </div>
  );
}

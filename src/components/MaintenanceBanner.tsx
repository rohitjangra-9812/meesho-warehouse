import React from 'react';
import { AlertTriangle, Clock, Lock, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';
import { useMaintenance } from '../lib/maintenance';

export function MaintenanceBanner() {
  const { isMaintenance, isSimulated, toggleSimulation, currentIstTime, formattedRemaining } = useMaintenance();

  if (!isMaintenance) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg border-b border-amber-500/50 relative z-50 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/25 rounded-xl border border-white/20 shadow-inner flex items-center justify-center shrink-0 animate-pulse">
              <ShieldAlert className="text-amber-200" size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/30 border border-white/20 text-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
                  Maintenance Active
                </span>
                <span className="text-xs font-mono font-bold bg-white/15 px-2 py-0.5 rounded text-white border border-white/10">
                  {currentIstTime}
                </span>
                {isSimulated && (
                  <span className="px-2 py-0.5 bg-purple-900/60 text-purple-200 text-[10px] font-black rounded border border-purple-400/40">
                    SIMULATED IST WINDOW
                  </span>
                )}
              </div>
              <p className="text-sm font-black text-white mt-1 leading-snug tracking-tight">
                System Maintenance in Progress - 1:00 PM to 1:15 PM. Data entry and transactions are temporarily disabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <Clock size={16} className="text-amber-200" />
              <div className="text-xs font-medium">
                <span className="text-amber-200 font-semibold">Resumes in: </span>
                <span className="font-mono font-black text-white text-sm">{formattedRemaining}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-900/40 border border-amber-300/30 rounded-lg text-xs font-bold text-amber-100">
                <Lock size={12} /> Forms Locked
              </span>
              <button
                onClick={toggleSimulation}
                className="px-2.5 py-1.5 bg-black/40 hover:bg-black/60 text-white/90 hover:text-white rounded-lg text-[11px] font-bold border border-white/20 transition-all flex items-center gap-1"
                title="Toggle simulated maintenance test mode"
              >
                {isSimulated ? 'Exit Test Mode' : 'Test Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MaintenanceClockWidget() {
  const { isMaintenance, isSimulated, toggleSimulation, currentIstTime } = useMaintenance();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleSimulation}
        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
          isMaintenance
            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
        }`}
        title="Click to toggle/test 1:00 PM - 1:15 PM IST Scheduled Maintenance Window"
      >
        <Clock size={13} className={isMaintenance ? 'text-amber-600 animate-spin' : 'text-gray-500'} />
        <span className="font-mono">{currentIstTime || 'IST Clock'}</span>
        {isMaintenance ? (
          <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase">
            Maintenance
          </span>
        ) : (
          <span className="text-[10px] text-gray-500 hidden xl:inline">
            (Maint: 1:00-1:15 PM)
          </span>
        )}
      </button>
    </div>
  );
}

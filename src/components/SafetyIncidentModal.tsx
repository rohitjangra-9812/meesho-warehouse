import React, { useEffect, useState, useRef } from 'react';
import { fetchApi } from '../lib/api.ts';
import { ShieldAlert, AlertTriangle, Siren, CheckCircle2, UserCheck, MapPin, X, Plus, VolumeX, Volume2 } from 'lucide-react';

interface SafetyIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafetyIncidentModal({ isOpen, onClose }: SafetyIncidentModalProps) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null);
  const [soundModeName, setSoundModeName] = useState<string>('Standard Wailing Siren');
  const [sirenSecondsLeft, setSirenSecondsLeft] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/safety/incidents');
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stopSiren = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {}
      gainNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setSirenSecondsLeft(0);
  };

  const startSiren = (emergencyType?: string) => {
    stopSiren();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let modeName = 'Standard Wailing Siren';
      const duration = 20;
      const startTime = ctx.currentTime;

      if (emergencyType && emergencyType.includes('Fire')) {
        modeName = 'Industrial Fire Horn (Temporal-3)';
        osc.type = 'square';
        const cycle = 0.5;
        for (let t = 0; t < duration; t += cycle) {
          const freq = (Math.floor(t / cycle) % 2 === 0) ? 880 : 660;
          osc.frequency.setValueAtTime(freq, startTime + t);
        }
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.setValueAtTime(0.15, startTime + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      } else if (emergencyType && emergencyType.includes('Forklift')) {
        modeName = 'Fast Sweeping Yelp Siren (Forklift)';
        osc.type = 'sawtooth';
        const sweepPeriod = 1 / 3;
        for (let t = 0; t < duration; t += sweepPeriod) {
          osc.frequency.setValueAtTime(500, startTime + t);
          osc.frequency.linearRampToValueAtTime(1200, startTime + t + sweepPeriod / 2);
          osc.frequency.linearRampToValueAtTime(500, startTime + t + sweepPeriod);
        }
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      } else if (emergencyType && emergencyType.includes('Chemical')) {
        modeName = 'Staccato Hazmat Warning Beeps (Chemical)';
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, startTime);
        const onTime = 0.2;
        const offTime = 0.15;
        const period = onTime + offTime;
        for (let t = 0; t < duration; t += period) {
          gain.gain.setValueAtTime(0.2, startTime + t);
          gain.gain.setValueAtTime(0.2, startTime + t + onTime);
          gain.gain.setValueAtTime(0.0001, startTime + t + onTime + 0.01);
        }
      } else if (emergencyType && emergencyType.includes('Medical')) {
        modeName = 'European Ambulance Two-Tone Nee-Naw (Medical)';
        osc.type = 'sine';
        const neeNawCycle = 1.5;
        for (let t = 0; t < duration; t += neeNawCycle) {
          osc.frequency.setValueAtTime(700, startTime + t);
          osc.frequency.setValueAtTime(450, startTime + t + 0.75);
        }
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      } else {
        modeName = 'Standard Emergency Wailing Siren';
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, startTime);
        const cycleTime = 1.2;
        for (let t = 0; t < duration; t += cycleTime) {
          osc.frequency.linearRampToValueAtTime(950, startTime + t + cycleTime / 2);
          osc.frequency.linearRampToValueAtTime(600, startTime + t + cycleTime);
        }
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      }

      setSoundModeName(modeName);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      setSirenSecondsLeft(20);
      countdownRef.current = setInterval(() => {
        setSirenSecondsLeft(prev => {
          if (prev <= 1) {
            stopSiren();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        stopSiren();
      }, duration * 1000);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadIncidents();
      startSiren();
    } else {
      stopSiren();
    }
    return () => {
      stopSiren();
    };
  }, [isOpen]);

  const triggerSOS = async (type: string, zone: string, marshal: string) => {
    try {
      setActiveAlarm(type);
      startSiren(type);
      await fetchApi('/safety/incidents', {
        method: 'POST',
        body: JSON.stringify({ type, zone, marshal })
      });
      await loadIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const resolveIncident = async (id: number) => {
    try {
      await fetchApi(`/safety/incidents/${id}/resolve`, { method: 'POST' });
      await loadIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    stopSiren();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-red-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <Siren size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide">Emergency SOS & Floor Safety Command</h3>
              <p className="text-xs text-red-100">Active floor broadcast, safety marshals dispatch, and incident audit tracking</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Siren Active Banner / Countdown */}
          {sirenSecondsLeft > 0 ? (
            <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3">
                <Siren size={28} className="animate-spin shrink-0" />
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-yellow-300 w-max mb-1">
                    🔊 Sound Mode: {soundModeName}
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-wider">
                    Siren Active: {sirenSecondsLeft}s remaining... ({activeAlarm || 'Emergency SOS Broadcast'})
                  </h4>
                  <p className="text-xs text-red-100">Warehouse audio alarm active. Auto-shuts off in {sirenSecondsLeft} seconds.</p>
                </div>
              </div>
              <button
                onClick={stopSiren}
                className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <VolumeX size={16} /> Silence Alarm / Mute
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 border border-gray-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Volume2 size={16} className="text-gray-400" />
                <span>Siren Muted / Standby. Click any emergency trigger below to sound the unique warehouse alarm profile.</span>
              </div>
              <button
                onClick={() => startSiren('Standard Wailing Siren')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Test Siren (20s)
              </button>
            </div>
          )}

          {/* One-Click Triggers */}
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-600" /> One-Click Emergency Floor SOS Triggers & Distinct Sound Profiles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => triggerSOS('Forklift Collision', 'Dock Bay 03', 'Marshal Rajesh Kumar')}
                className="p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl text-left transition-all shadow-sm group"
              >
                <div className="text-xs font-bold text-red-600 group-hover:underline">🚜 Forklift Collision</div>
                <p className="text-[11px] text-gray-500 mt-0.5">Sound: Fast Yelp Sweep</p>
              </button>
              <button
                onClick={() => triggerSOS('Fire Hazard / Smoke', 'Aisle Zone A-M', 'Marshal Priya Sharma')}
                className="p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl text-left transition-all shadow-sm group"
              >
                <div className="text-xs font-bold text-red-600 group-hover:underline">🔥 Fire Hazard / Smoke</div>
                <p className="text-[11px] text-gray-500 mt-0.5">Sound: Industrial Fire Horn</p>
              </button>
              <button
                onClick={() => triggerSOS('Chemical / Liquid Spill', 'High-Value Vault', 'Marshal Amit Verma')}
                className="p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl text-left transition-all shadow-sm group"
              >
                <div className="text-xs font-bold text-red-600 group-hover:underline">🧪 Chemical Spill</div>
                <p className="text-[11px] text-gray-500 mt-0.5">Sound: Staccato Hazmat Beeps</p>
              </button>
              <button
                onClick={() => triggerSOS('Medical Emergency', 'Outbound Packing', 'Marshal Sunita Rao')}
                className="p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl text-left transition-all shadow-sm group"
              >
                <div className="text-xs font-bold text-red-600 group-hover:underline">🚑 Medical Emergency</div>
                <p className="text-[11px] text-gray-500 mt-0.5">Sound: European Nee-Naw</p>
              </button>
            </div>
          </div>

          {/* Incident Log & Marshals */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-900">Active & Historical Incident Audit Log</h4>
              <span className="text-xs text-gray-500 font-semibold">{incidents.length} total logged incidents</span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                    <th className="px-4 py-3">Emergency Type</th>
                    <th className="px-4 py-3">GPS / Zone Location</th>
                    <th className="px-4 py-3">Assigned Safety Marshal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading incidents...</td></tr>
                  ) : incidents.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No safety incidents recorded.</td></tr>
                  ) : incidents.map((inc: any) => (
                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle size={16} className={inc.status === 'Active' ? 'text-red-600 animate-pulse' : 'text-amber-500'} />
                        {inc.type}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {inc.zone}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 flex items-center gap-1">
                        <UserCheck size={14} className="text-blue-600" />
                        {inc.marshal}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                          inc.status === 'Active' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'
                        }`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inc.status === 'Active' ? (
                          <button
                            onClick={() => resolveIncident(inc.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            Resolve Now
                          </button>
                        ) : (
                          <span className="text-xs font-mono font-medium text-gray-500">
                            Resolved in {inc.resolutionTime || '12 mins'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

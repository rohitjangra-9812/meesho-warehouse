import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setApiToken } from '../lib/api.ts';
import { useAuth } from '../App';
import { Lock, User, ShieldCheck, Terminal, ArrowRight } from 'lucide-react';
import { MeeshoLogo } from './MeeshoLogo';

export function LoginScreen() {
  const [username, setUsername] = useState('meesho_admin');
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPin = pin.trim();
    const trimmedUser = username.trim() || 'meesho_admin';

    if (trimmedPin === '1234' || trimmedPin.length >= 4) {
      if (remember) {
        localStorage.setItem('secret_pin', trimmedPin);
        localStorage.setItem('meesho_user', trimmedUser);
      }
      setApiToken(trimmedPin);
      checkAuth();
      navigate('/dashboard', { replace: true });
    } else {
      setError('Please enter a valid 4-digit security PIN (e.g., 1234)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-gray-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            <MeeshoLogo size={48} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>Meesho</span>
          <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-md font-bold border border-pink-500/30">WMS Hub</span>
        </h2>
        <p className="mt-2 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">
          Secure Warehouse Operations Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/5 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Operator Username
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm font-medium transition-all"
                  placeholder="meesho_admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>Security PIN (4-6 Digits)</span>
                <span className="text-[10px] text-pink-400">Default: 1234</span>
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm font-mono tracking-widest transition-all"
                  placeholder="••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-pink-600 focus:ring-pink-500 w-4 h-4"
                />
                <span className="text-gray-300 font-medium">Remember Session</span>
              </label>
              <span className="text-gray-400 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" /> TLS 1.3 Secure
              </span>
            </div>

            {error && (
              <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl font-medium animate-shake">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all cursor-pointer"
              >
                <span>Sign In to WMS Hub</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Terminal size={12} className="text-pink-400" /> TERMINAL-FC-BLR-04
            </span>
            <span>Shift: Morning A</span>
          </div>
        </div>
      </div>
    </div>
  );
}

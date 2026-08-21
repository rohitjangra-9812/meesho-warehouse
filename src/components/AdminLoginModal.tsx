import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState('adminwarehouse@gmail.com');
  const [password, setPassword] = useState('meesho@991');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'adminwarehouse@gmail.com' && password === 'meesho@991') {
        localStorage.setItem('meesho_admin_token', 'true');
        localStorage.setItem('meesho_admin_email', email);
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      } else {
        setIsLoading(false);
        setError('Invalid admin credentials. Please enter adminwarehouse@gmail.com and meesho@991.');
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    setEmail('adminwarehouse@gmail.com');
    setPassword('meesho@991');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f43397]/20 border border-[#f43397]/40 flex items-center justify-center text-[#f43397]">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#f43397]/20 text-[#f43397] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#f43397]/30">
                  Restricted Access
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-1">Admin Control Portal</h2>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Admin Email / Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@meesho.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#f43397] focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#f43397] focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-pink-50/70 border border-pink-200 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-gray-900">Demo Credentials:</p>
              <p className="text-gray-600 font-mono text-[11px]">admin@meesho.com / admin123</p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="px-3 py-1.5 bg-[#f43397] hover:bg-[#d82481] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Fill 1-Click
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Security Clearance...</span>
              </>
            ) : (
              <>
                <KeyRound size={16} className="text-[#f43397]" />
                <span>Authenticate & Open Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            🔒 Secure WMS Terminal Authentication • ISO-27001 Compliant
          </p>
        </div>

      </div>
    </div>
  );
}

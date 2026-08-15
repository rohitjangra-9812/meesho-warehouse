/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchApi, setApiToken } from './lib/api.ts';
import { InventoryScreen } from './components/InventoryScreen.tsx';
import { EmployeesScreen } from './components/EmployeesScreen.tsx';
import { ManagementScreen } from './components/ManagementScreen.tsx';
import { NoticesScreen } from './components/NoticesScreen.tsx';
import { SalaryScreen } from './components/SalaryScreen.tsx';
import { AttendanceScreen } from './components/AttendanceScreen.tsx';
import { AnalyticsScreen } from './components/AnalyticsScreen.tsx';
import { VendorScreen } from './components/VendorScreen.tsx';
import { HrScreen } from './components/HrScreen.tsx';
import { HubsScreen } from './components/HubsScreen.tsx';
import { FulfillmentScreen } from './components/FulfillmentScreen.tsx';
import { TreasuryScreen } from './components/TreasuryScreen.tsx';
import { DockManagementScreen } from './components/DockManagementScreen.tsx';
import { LossRecoveryScreen } from './components/LossRecoveryScreen.tsx';
import { ScannerHubScreen } from './components/ScannerHubScreen.tsx';
import { Boxes, LogOut, Users, Briefcase, FileText, IndianRupee, Clock, Activity, Truck, Shield, MapPin, PackageOpen, Landmark, Navigation, ScanBarcode, Cloud, RefreshCw, CheckCircle2, Database, AlertTriangle, X } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, login: () => {}, logout: () => {} });

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('secret_pin'));

  const login = (pin: string) => {
    localStorage.setItem('secret_pin', pin);
    setApiToken(pin);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('secret_pin');
    setApiToken(null);
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}

function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // Secret PIN
      login(pin);
    } else {
      setError('Invalid PIN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">Meesho WMS</h1>
        <p className="text-gray-500 mb-8">Enter secret PIN (1234) to access the dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            placeholder="Enter PIN"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-left">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());
  const [showTrafficAlert, setShowTrafficAlert] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    // Detect high traffic alert based on the timestamp constraint (2 hours)
    const alertCreatedAt = new Date('2026-08-10T23:54:42-07:00').getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now < alertCreatedAt + twoHoursMs && !alertDismissed) {
      setShowTrafficAlert(true);
      
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'square';
          // Create a loud two-tone siren effect for 20 seconds
          const duration = 20.0;
          for (let i = 0; i < duration; i += 0.8) {
            osc.frequency.setValueAtTime(880, ctx.currentTime + i);
            if (i + 0.4 < duration) {
              osc.frequency.setValueAtTime(1100, ctx.currentTime + i + 0.4);
            }
          }
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1); // High volume
          gainNode.gain.setValueAtTime(0.5, ctx.currentTime + duration - 0.1);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }
      } catch (err) {
        console.error("Audio playback failed", err);
      }
      
      // Auto-hide the urgent banner after 10 minutes (600000 ms)
      const timer = setTimeout(() => {
        setShowTrafficAlert(false);
      }, 600000);
      
      return () => clearTimeout(timer);
    }
  }, [alertDismissed]);

  useEffect(() => {
    const syncData = async () => {
      try {
        setIsSyncing(true);
        await fetchApi('/auth/sync', { method: 'POST' });
        setLastSynced(new Date());
      } catch (e) {
        console.warn("Sync failed - server might be restarting or unreachable", e);
      } finally {
        setIsSyncing(false);
      }
    };
    
    syncData();
    const interval = setInterval(syncData, 60000);
    
    const handleRefresh = () => syncData();
    window.addEventListener('auto-refresh', handleRefresh);
    return () => {
       clearInterval(interval);
       window.removeEventListener('auto-refresh', handleRefresh);
    };
  }, []);
  
  const navItems = [
    { path: '/analytics', label: 'Analytics', icon: Activity },
    { path: '/fulfillment', label: 'Fulfillment & Shipping', icon: PackageOpen },
    { path: '/docks', label: 'Dock Management', icon: Navigation },
    { path: '/scanners', label: 'Barcode & RFID', icon: ScanBarcode },
    { path: '/inventory', label: 'Inventory', icon: Boxes },
    { path: '/vendors', label: 'Vendors', icon: Truck },
    { path: '/treasury', label: 'Bank & Treasury', icon: Landmark },
    { path: '/hubs', label: 'Hubs & Transfers', icon: MapPin },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/hr', label: 'HR & Compliance', icon: Shield },
    { path: '/management', label: 'Management', icon: Briefcase },
    { path: '/notices', label: 'Notices', icon: FileText },
    { path: '/salary', label: 'Salary', icon: IndianRupee },
    { path: '/attendance', label: 'Attendance', icon: Clock },
    { path: '/loss-recovery', label: 'Loss & Recovery', icon: AlertTriangle },
  ];

  const meeshoWatermarkSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><text x="200" y="100" font-family="Arial" font-size="40" font-weight="bold" fill="rgba(0,0,0,0.03)" text-anchor="middle" transform="rotate(-30, 200, 100)">MEESHO WAREHOUSE</text></svg>`;

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative z-0">
      <div 
        className="absolute inset-0 pointer-events-none z-[-1] opacity-50"
        style={{ backgroundImage: `url('${meeshoWatermarkSvg}')`, backgroundRepeat: 'repeat', backgroundSize: '400px 200px' }}
      ></div>
      <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meesho WMS</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Warehouse Operations</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              WA
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">Warehouse Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@meesho.com</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2">
         {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
      </div>

      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-2">
             <h2 className="text-lg font-semibold text-gray-800 md:hidden">Meesho WMS</h2>
          </div>
          <div className="flex items-center gap-3 ml-auto">
             <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <span className="text-gray-600 font-medium">
                   {isSyncing ? 'Syncing...' : `Synced ${lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}
                </span>
                {!isSyncing && <Database className="w-3.5 h-3.5 text-gray-400 ml-1" />}
             </div>
          </div>
        </header>
        {showTrafficAlert && (
          <div className="bg-red-600 text-white px-4 md:px-6 py-3 flex items-start sm:items-center justify-between shadow-md z-10 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-start sm:items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide">HIGH TRAFFIC DETECTED</p>
                <p className="text-xs text-red-100 mt-0.5">High traffic patterns detected at warehouse packing areas and dock gates. Please review orders on the portal.</p>
              </div>
            </div>
            <button 
              onClick={() => { setShowTrafficAlert(false); setAlertDismissed(true); }} 
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors ml-4 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto p-6 md:p-8 max-w-7xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Automated recurring updates every 30 minutes
    const interval = setInterval(() => {
      window.dispatchEvent(new Event('auto-refresh'));
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<Navigate to="/analytics" />} />
          <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/docks" element={<ProtectedRoute><DashboardLayout><DockManagementScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/scanners" element={<ProtectedRoute><DashboardLayout><ScannerHubScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/fulfillment" element={<ProtectedRoute><DashboardLayout><FulfillmentScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><DashboardLayout><InventoryScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><DashboardLayout><VendorScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/treasury" element={<ProtectedRoute><DashboardLayout><TreasuryScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/hubs" element={<ProtectedRoute><DashboardLayout><HubsScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeesScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute><DashboardLayout><HrScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management" element={<ProtectedRoute><DashboardLayout><ManagementScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><DashboardLayout><NoticesScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/salary" element={<ProtectedRoute><DashboardLayout><SalaryScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><DashboardLayout><AttendanceScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/loss-recovery" element={<ProtectedRoute><DashboardLayout><LossRecoveryScreen /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

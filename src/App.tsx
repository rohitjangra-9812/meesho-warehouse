import { ReturnsScreen } from './components/ReturnsScreen';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Video,
  LayoutDashboard, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  PackageSearch, 
  RotateCcw, 
  Search, 
  ScanLine,
  LogOut,
  X,
  Landmark, 
  Users, 
  BookOpen, 
  Truck, 
  BrainCircuit, 
  ScanBarcode, 
  Shield, 
  FileBarChart, 
  RefreshCw, 
  Siren,
  UtensilsCrossed,
  ShieldCheck,
  KeyRound,
  Lock
} from "lucide-react";
import { setApiToken, fetchApi } from './lib/api.ts';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { InboundScreen } from './components/InboundScreen';
import { OutboundScreen } from './components/OutboundScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { MeeshoLogo } from './components/MeeshoLogo';

import { BankingScreen } from './components/BankingScreen';
import { EmployeeScreen } from './components/EmployeeScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { DockScreen } from './components/DockScreen';
import { AIOperationsScreen } from './components/AIOperationsScreen';
import { ScannerScreen } from './components/ScannerScreen';
import { LeadershipScreen } from './components/LeadershipScreen';
import { SurveillanceScreen } from './components/SurveillanceScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { CanteenScreen } from './components/CanteenScreen';
import { SafetyIncidentModal } from './components/SafetyIncidentModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MaintenanceProvider } from './lib/maintenance';
import { MaintenanceBanner, MaintenanceClockWidget } from './components/MaintenanceBanner';


export const AuthContext = createContext<{ isAuthenticated: boolean; checkAuth: () => void }>({ 
  isAuthenticated: false, 
  checkAuth: () => {} 
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('secret_pin'));
  
  const checkAuth = () => {
    setIsAuthenticated(!!localStorage.getItem('secret_pin'));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('meesho_admin_token') === 'true');
  const [isModalOpen, setIsModalOpen] = useState(!isAdmin);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-pink-100 text-[#f43397] flex items-center justify-center shadow-md">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin Authentication Required</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Access to the Enterprise Control Panel requires master administrator clearance. Please authenticate below.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#f43397] hover:bg-[#d82481] text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <KeyRound size={16} />
          <span>Open Admin Login Gateway</span>
        </button>
        <AdminLoginModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLoginSuccess={() => {
            setIsAdmin(true);
            setIsModalOpen(false);
          }}
        />
      </div>
    );
  }
  return <>{children}</>;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Landmark, label: 'Banking', path: '/banking' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: UtensilsCrossed, label: 'Canteen & Meals', path: '/canteen' },
  { icon: Shield, label: 'Leadership', path: '/leadership' },
  { icon: BookOpen, label: 'Catalog', path: '/catalog' },
  { icon: Truck, label: 'Docks', path: '/docks' },
  { icon: BrainCircuit, label: 'AI Operations', path: '/ai-operations' },
  { icon: ScanBarcode, label: 'Scan Station', path: '/scanner' },
  { icon: Video, label: 'CCTV Security', path: '/cctv' },
  { icon: FileBarChart, label: 'Reports & Issuance', path: '/reports' },
  { icon: RotateCcw, label: 'Returns & RTO', path: '/returns' }
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [isAdminAuth, setIsAdminAuth] = useState(localStorage.getItem('meesho_admin_token') === 'true');
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  // Secret shortcut: Ctrl + Shift + A or 5 clicks on logo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminLoginModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      setLogoClicks(0);
      setIsAdminLoginModalOpen(true);
    }
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const logout = () => {
    localStorage.removeItem('secret_pin');
    setApiToken(null);
    window.location.href = '/login';
  };

  const handleScanSimulate = () => {
    setIsScanning(true);
    setTimeout(() => {
      setSearchQuery('AWB-8349281X');
      setIsScanning(false);
    }, 800);
  };

  const [isSimulating, setIsSimulating] = useState(false);
  const [streamMessage, setStreamMessage] = useState<string | null>(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('00h 14m');

  useEffect(() => {
    let seconds = 840; // 14 mins
    const timer = setInterval(() => {
      seconds++;
      const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      setSessionDuration(`${hrs}h ${mins}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateTick = async () => {
    try {
      setIsSimulating(true);
      const res = await fetchApi('/system/stream-tick', { method: 'POST' });
      setStreamMessage(res.message || '10-Min Influx Engine executed successfully (+20 records across all modules)!');
      setTimeout(() => setStreamMessage(null), 6000);
      window.dispatchEvent(new CustomEvent('wms-data-updated', { detail: res }));
    } catch (err) {
      console.error(err);
      alert('Failed to simulate 10-min stream tick');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 z-20">
        <div 
          onClick={handleLogoClick}
          className="p-6 border-b border-gray-200 flex items-center gap-3 bg-gradient-to-br from-pink-50/50 to-white cursor-pointer select-none"
          title="Click 5 times for administrative gateway"
        >
          <MeeshoLogo size={36} />
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none flex items-center gap-1.5">
              <span>Meesho</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-pink-100 text-[#f43397] font-bold rounded">WMS</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Warehouse Fulfill</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-pink-50 text-[#f43397] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#f43397]' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2 pb-safe">
         {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive ? 'text-[#f43397]' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0 relative bg-gray-50">
          {/* Subtle Repeating Meesho Watermark Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center overflow-hidden z-0 select-none">
            <div className="grid grid-cols-3 gap-28 transform -rotate-12 scale-150">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center">
                  <MeeshoLogo size={64} />
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex flex-col h-full w-full">
        <MaintenanceBanner />
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between z-10 gap-4 shadow-sm">
          <div className="flex items-center gap-3 sm:hidden">
             <MeeshoLogo size={32} />
             <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
               <span>Meesho</span>
               <span className="text-xs px-1.5 py-0.5 bg-pink-100 text-[#f43397] rounded font-bold">WMS</span>
             </h2>
          </div>

          <div className="hidden sm:flex items-center gap-3">
             <MeeshoLogo size={36} />
             <div className="flex flex-col">
               <span className="font-black text-gray-900 text-sm tracking-tight">Meesho WMS</span>
               <span className="text-[10px] font-semibold text-gray-400">Operations Hub</span>
             </div>
          </div>
          
          {/* Universal Command Bar */}
          <div className="flex-1 max-w-2xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by Order ID, SKU, or AWB..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={handleScanSimulate}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isScanning ? 'bg-blue-100 text-blue-700' : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              <ScanLine size={18} className={isScanning ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Scan Barcode'}</span>
            </button>
            <button 
              onClick={handleSimulateTick}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold bg-[#f43397] hover:bg-[#d82481] text-white transition-colors shadow-sm whitespace-nowrap"
              title="Simulate 10-Minute Periodic Influx (+20 Live Records across all modules)"
            >
              <RefreshCw size={14} className={isSimulating ? 'animate-spin' : ''} />
              <span>{isSimulating ? 'Ingesting Influx...' : 'Simulate 10-Min Tick (+20 Data)'}</span>
            </button>
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-all shadow-md animate-pulse whitespace-nowrap"
              title="Emergency SOS & Incident Management"
            >
              <Siren size={16} />
              <span>🚨 SOS</span>
            </button>
            <MaintenanceClockWidget />
          </div>

          {/* User Session & IP Metadata Badge */}
          <div className="hidden xl:flex items-center gap-3 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            {isAdminAuth && (
              <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-[#f43397] animate-pulse"></span>
                <span className="font-black text-[#f43397]">Admin Active</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('meesho_admin_token');
                    setIsAdminAuth(false);
                    window.location.reload();
                  }}
                  className="ml-2 px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold"
                >
                  Logout
                </button>
              </div>
            )}

            <div className="flex flex-col text-right">
              <span className="font-bold text-gray-900">meesho_admin <span className="text-[10px] text-gray-500 font-normal">(Operations)</span></span>
              <span className="text-[10px] font-mono text-gray-500">IP: 192.168.1.104</span>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <button
              onClick={logout}
              className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              title="Logout / Switch Station"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {streamMessage && (
          <div className="bg-pink-50 border-b border-pink-200 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-pink-800 animate-fadeIn z-20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f43397] animate-ping"></span>
              <span>{streamMessage}</span>
            </div>
            <span className="text-[10px] text-pink-600 uppercase tracking-wider font-bold">Live Stream Ingested</span>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8 w-full h-full relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </div>
      </main>

      <SafetyIncidentModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminAuth(true);
          window.location.href = '/admin';
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <MaintenanceProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/canteen" element={<ProtectedRoute><DashboardLayout><CanteenScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/leadership" element={<ProtectedRoute><DashboardLayout><LeadershipScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><DashboardLayout><CatalogScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/docks" element={<ProtectedRoute><DashboardLayout><DockScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/ai-operations" element={<ProtectedRoute><DashboardLayout><AIOperationsScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><DashboardLayout><ScannerScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/cctv" element={<ProtectedRoute><DashboardLayout><SurveillanceScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><DashboardLayout><ReportsScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/returns" element={<ProtectedRoute><DashboardLayout><ReturnsScreen /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><DashboardLayout><AdminRoute><AdminPanel /></AdminRoute></DashboardLayout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MaintenanceProvider>
  );
}


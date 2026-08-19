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
  X
, Landmark, Users, BookOpen, Truck, BrainCircuit, ScanBarcode , Shield } from "lucide-react";
import { setApiToken } from './lib/api.ts';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { InboundScreen } from './components/InboundScreen';
import { OutboundScreen } from './components/OutboundScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ReturnsScreen } from './components/ReturnsScreen';
import { BankingScreen } from './components/BankingScreen';
import { EmployeeScreen } from './components/EmployeeScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { DockScreen } from './components/DockScreen';
import { AIOperationsScreen } from './components/AIOperationsScreen';
import { ScannerScreen } from './components/ScannerScreen';
import { LeadershipScreen } from './components/LeadershipScreen';
import { SurveillanceScreen } from './components/SurveillanceScreen';

const AuthContext = createContext<{ isAuthenticated: boolean; checkAuth: () => void }>({ 
  isAuthenticated: false, 
  checkAuth: () => {} 
});

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

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Landmark, label: 'Banking', path: '/banking' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: Shield, label: 'Leadership', path: '/leadership' },
  { icon: BookOpen, label: 'Catalog', path: '/catalog' },
  { icon: Truck, label: 'Docks', path: '/docks' },
  { icon: BrainCircuit, label: 'AI Operations', path: '/ai-operations' },
  { icon: ScanBarcode, label: 'Scan Station', path: '/scanner' },
  { icon: Video, label: 'CCTV Security', path: '/cctv' }
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

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

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 z-20">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <PackageSearch size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">WMS Portal</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Warehouse Operations</p>
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
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between z-10 gap-4">
          <div className="flex items-center gap-2 sm:hidden">
             <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <PackageSearch size={20} />
             </div>
             <h2 className="text-lg font-bold text-gray-900">WMS Portal</h2>
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
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 w-full h-full relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />
        <Route path="/leadership" element={<ProtectedRoute><DashboardLayout><LeadershipScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/catalog" element={<ProtectedRoute><DashboardLayout><CatalogScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/docks" element={<ProtectedRoute><DashboardLayout><DockScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/ai-operations" element={<ProtectedRoute><DashboardLayout><AIOperationsScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><DashboardLayout><ScannerScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/cctv" element={<ProtectedRoute><DashboardLayout><SurveillanceScreen /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

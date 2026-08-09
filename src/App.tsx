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
import { ScannerHubScreen } from './components/ScannerHubScreen.tsx';
import { Boxes, LogOut, Users, Briefcase, FileText, IndianRupee, Clock, Activity, Truck, Shield, MapPin, PackageOpen, Landmark, Navigation, ScanBarcode } from 'lucide-react';

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

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-full">
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

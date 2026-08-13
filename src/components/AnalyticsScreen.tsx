import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Package, TrendingUp, AlertCircle, Clock, ScanBarcode, CheckCircle2 } from 'lucide-react';

interface DailyFulfillment {
  date: string;
  orders: number;
  returns: number;
}

interface StockDistribution {
  district: string;
  stock: number;
}

interface Productivity {
  department: string;
  itemsProcessed: number;
}

interface ActivityLog {
  id: number;
  action: string;
  timestamp: string;
  userName: string;
}

interface KPIMetrics {
  totalShippedUnits: number;
  avgDockWaitTime: number;
  scannerDowntime: number;
}

export function AnalyticsScreen() {
  const [dailyData, setDailyData] = useState<DailyFulfillment[]>([]);
  const [stockData, setStockData] = useState<StockDistribution[]>([]);
  const [productivity, setProductivity] = useState<Productivity[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [hasHighTrafficAlert, setHasHighTrafficAlert] = useState(false);

  useEffect(() => {
    const alertCreatedAt = new Date('2026-08-10T21:26:54-07:00').getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    
    if (Date.now() < alertCreatedAt + twoHoursMs) {
      setHasHighTrafficAlert(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsRes, logsRes] = await Promise.all([
          fetchApi('/analytics/metrics'),
          fetchApi('/activity-logs')
        ]);
        setDailyData(metricsRes.dailyFulfillment);
        setStockData(metricsRes.stockDistribution);
        setProductivity(metricsRes.productivity);
        setKpis(metricsRes.kpis);
        setActivityLogs(logsRes);
      } catch (err) {
        console.error(err);
      }
    };
    
    loadData();
    // Listen for global auto-refresh scheduled every 30 minutes
    window.addEventListener('auto-refresh', loadData);
    return () => window.removeEventListener('auto-refresh', loadData);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#ff7300'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Activity className="text-indigo-600 h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Warehouse Performance & Analytics</h2>
          <p className="text-sm text-gray-500">Live fulfillment rates, stock distribution, and department productivity</p>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-green-500 h-5 w-5" />
              <h3 className="font-semibold text-gray-700">Total Shipped Units</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {kpis.totalShippedUnits.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total items dispatched</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-500 h-5 w-5" />
              <h3 className="font-semibold text-gray-700">Avg Dock Wait Time</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {kpis.avgDockWaitTime} <span className="text-lg font-medium text-gray-500">mins</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">Average check-in to check-out</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <ScanBarcode className="text-red-500 h-5 w-5" />
              <h3 className="font-semibold text-gray-700">Scanner Downtime</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {kpis.scannerDowntime} <span className="text-lg font-medium text-gray-500">devices</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">Currently offline or in maintenance</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-blue-500 h-5 w-5" />
            <h3 className="font-semibold text-gray-700">Total Processed (Week)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dailyData.reduce((acc, curr) => acc + curr.orders, 0).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 flex items-center mt-1"><TrendingUp className="h-4 w-4 mr-1" /> +12% from last week</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-500 h-5 w-5" />
            <h3 className="font-semibold text-gray-700">Avg Return Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dailyData.length > 0 ? 
              ((dailyData.reduce((acc, curr) => acc + curr.returns, 0) / 
              dailyData.reduce((acc, curr) => acc + curr.orders, 0)) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Based on last 7 days</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-purple-500 h-5 w-5" />
            <h3 className="font-semibold text-gray-700">Highest Active Hub</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stockData.length > 0 ? stockData.reduce((prev, current) => (prev.stock > current.stock) ? prev : current).district : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Based on current stock holding</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900">Live Warehouse Floor Plan Heatmap</h3>
          {hasHighTrafficAlert && (
             <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
               HIGH TRAFFIC DETECTED
             </span>
          )}
        </div>
        <div className="relative w-full aspect-[2/1] bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {/* Outline */}
            <rect x="20" y="20" width="760" height="360" fill="transparent" stroke="#e5e7eb" strokeWidth="4" rx="8" />
            
            {/* Zones */}
            {/* Storage A */}
            <rect x="40" y="40" width="200" height="150" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="4" />
            <text x="140" y="115" textAnchor="middle" fill="#6b7280" fontSize="14" fontWeight="bold">Storage Zone A</text>
            
            {/* Storage B */}
            <rect x="260" y="40" width="200" height="150" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="4" />
            <text x="360" y="115" textAnchor="middle" fill="#6b7280" fontSize="14" fontWeight="bold">Storage Zone B</text>

            {/* Quality Check */}
            <rect x="480" y="40" width="280" height="80" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="4" />
            <text x="620" y="85" textAnchor="middle" fill="#6b7280" fontSize="14" fontWeight="bold">Quality Control</text>

            {/* Packing Area - Highlight if alert */}
            <rect x="40" y="210" width="420" height="150" fill={hasHighTrafficAlert ? "#fee2e2" : "#f3f4f6"} stroke={hasHighTrafficAlert ? "#ef4444" : "#d1d5db"} strokeWidth="2" rx="4" className={hasHighTrafficAlert ? "animate-pulse" : ""} style={{ animationDuration: '3s' }} />
            <text x="250" y="285" textAnchor="middle" fill={hasHighTrafficAlert ? "#b91c1c" : "#6b7280"} fontSize="14" fontWeight="bold">Packing &amp; Sorting</text>
            
            {/* Docks Gate - Highlight if alert */}
            <rect x="480" y="140" width="280" height="220" fill={hasHighTrafficAlert ? "#fee2e2" : "#f3f4f6"} stroke={hasHighTrafficAlert ? "#ef4444" : "#d1d5db"} strokeWidth="2" rx="4" className={hasHighTrafficAlert ? "animate-pulse" : ""} style={{ animationDuration: '2s' }} />
            <text x="620" y="250" textAnchor="middle" fill={hasHighTrafficAlert ? "#b91c1c" : "#6b7280"} fontSize="14" fontWeight="bold">Docks Gate</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6">Daily Fulfillment vs Returns (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" name="Orders Fulfilled" stroke="#4f46e5" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line type="monotone" dataKey="returns" name="Returns Processed" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6">Department Productivity (Items/Shift)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="itemsProcessed" name="Items Processed" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6">Stock Distribution Across Haryana Districts</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="stock"
                  nameKey="district"
                  label={({ district, percent }) => `${district} ${(percent * 100).toFixed(0)}%`}
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6">Recent Activity Logs</h3>
          <div className="space-y-4">
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="bg-indigo-50 p-2 rounded-full mt-1">
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>By {log.userName}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

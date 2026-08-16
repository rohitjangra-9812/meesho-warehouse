import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { ScanBarcode, Wifi, WifiOff, Battery, BatteryWarning, BatteryFull, Activity, CheckCircle2, XCircle, AlertTriangle, PenTool } from 'lucide-react';

interface Scanner {
  id: number;
  name: string;
  type: string;
  macAddress: string;
  status: string;
  batteryLevel: number;
  location: string;
  lastPing: string;
}

interface ScanLog {
  id: number;
  scannerId: number;
  scannerName: string;
  itemSku: string;
  scanType: string;
  status: string;
  errorMessage: string | null;
  timestamp: string;
}

interface MaintenanceLog {
  id: number;
  scannerId: number;
  scannerName: string;
  maintenanceType: string;
  description: string;
  date: string;
  technician: string;
}

export function ScannerHubScreen() {
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scannersRes, logsRes, maintenanceRes] = await Promise.all([
        fetchApi('/scanners'),
        fetchApi('/scanners/logs'),
        fetchApi('/scanners/maintenance')
      ]);
      setScanners(scannersRes);
      setLogs(logsRes);
      setMaintenanceLogs(maintenanceRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Simulate live logs polling
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
    window.addEventListener('auto-refresh', loadData);
  return () => window.removeEventListener('auto-refresh', loadData);
}, []);

  const handleSeed = async () => {
    try {
      await fetchApi('/scanners/seed', { method: 'POST' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level > 80) return <BatteryFull className="w-4 h-4 text-green-500" />;
    if (level > 20) return <Battery className="w-4 h-4 text-blue-500" />;
    return <BatteryWarning className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl">
            <ScanBarcode className="text-purple-700 h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Scanner & RFID Hub</h2>
            <p className="text-sm text-gray-500">Monitor deployed hardware and view live scan logs.</p>
          </div>
        </div>
        {scanners.length === 0 && (
          <button onClick={handleSeed} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Initialize Scanners
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" /> Live Scan Logs
              </h3>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Live
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item & Scanner</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{log.itemSku}</span>
                          <span className="text-xs text-gray-500">via {log.scannerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
                          {log.scanType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status === 'Success' ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Success
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                              <XCircle className="w-4 h-4" /> Error
                            </div>
                            {log.errorMessage && (
                              <span className="text-xs text-red-500 mt-0.5">{log.errorMessage}</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">No recent scans logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-gray-500" /> Maintenance History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Scanner</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Technician & Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {maintenanceLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {log.scannerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          log.maintenanceType === 'Repair' ? 'bg-red-100 text-red-700' :
                          log.maintenanceType === 'Firmware Update' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {log.maintenanceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{log.technician}</span>
                          <span className="text-xs text-gray-500">{log.description}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {maintenanceLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">No maintenance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-gray-500" /> Deployed Devices
            </h3>
            <div className="space-y-3">
              {scanners.map(scanner => (
                <div key={scanner.id} className={`p-4 border rounded-xl ${scanner.batteryLevel < 20 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${scanner.batteryLevel < 20 ? 'text-red-900' : 'text-gray-900'}`}>{scanner.name}</h4>
                        {scanner.batteryLevel < 20 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 uppercase tracking-wider">
                            Low Battery
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${scanner.batteryLevel < 20 ? 'text-red-600/80' : 'text-gray-500'}`}>{scanner.type} • {scanner.location}</p>
                    </div>
                    {scanner.status === 'Online' ? (
                      <Wifi className={`w-4 h-4 ${scanner.batteryLevel < 20 ? 'text-red-400' : 'text-green-500'}`} />
                    ) : (
                      <WifiOff className={`w-4 h-4 ${scanner.batteryLevel < 20 ? 'text-red-300' : 'text-gray-400'}`} />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className={`flex items-center gap-1.5 ${scanner.batteryLevel < 20 ? 'text-red-700' : 'text-gray-600'}`}>
                      {getBatteryIcon(scanner.batteryLevel)}
                      <span className="font-medium text-xs">{scanner.batteryLevel}%</span>
                    </div>
                    
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      scanner.status === 'Online' 
                        ? scanner.batteryLevel < 20 ? 'bg-red-100/50 text-red-700' : 'bg-green-100 text-green-700'
                        : scanner.status === 'Offline' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                    }`}>
                      {scanner.status}
                    </span>
                  </div>
                </div>
              ))}
              {scanners.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No devices initialized.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

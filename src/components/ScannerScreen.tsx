import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, ScanBarcode, PackageSearch, CheckCircle2, XCircle, AlertTriangle, 
  Activity, Users, BatteryMedium, Cpu, Search, Fingerprint, Zap, ArrowRight,
  TrendingUp, BarChart3, Target, Crosshair
} from 'lucide-react';

export function ScannerScreen() {
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLogs, setScanLogs] = useState<any[]>([
    { id: 1, time: '10:42:15 AM', station: 'ST-04', operator: 'Raj Patel', code: 'AWB-8349281X', action: 'Inbound GRN', status: 'Success' },
    { id: 2, time: '10:41:30 AM', station: 'ST-04', operator: 'Raj Patel', code: 'SKU-ELECT-092', action: 'Wave Pick', status: 'Success' },
    { id: 3, time: '10:40:12 AM', station: 'ST-02', operator: 'Anita Sharma', code: 'AWB-UNKNOWN', action: 'Dispatch Sort', status: 'Mismatch' },
    { id: 4, time: '10:38:55 AM', station: 'ST-01', operator: 'Vikram Singh', code: 'SKU-FASH-118', action: 'Inbound GRN', status: 'Damaged' },
    { id: 5, time: '10:35:10 AM', station: 'ST-04', operator: 'Raj Patel', code: 'AWB-1122334X', action: 'Wave Pick', status: 'Success' },
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus the hidden input for barcode scanner guns
    inputRef.current?.focus();
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate API verification
    setTimeout(() => {
      const isDamaged = scanInput.includes('DAM');
      const isMismatch = scanInput.includes('ERR');
      let status = 'Success';
      let statusColor = 'text-green-600 bg-green-50 border-green-200';
      let icon = <CheckCircle2 className="text-green-500 w-16 h-16" />;
      
      if (isDamaged) {
        status = 'Damaged';
        statusColor = 'text-orange-600 bg-orange-50 border-orange-200';
        icon = <AlertTriangle className="text-orange-500 w-16 h-16" />;
      } else if (isMismatch) {
        status = 'Mismatch';
        statusColor = 'text-red-600 bg-red-50 border-red-200';
        icon = <XCircle className="text-red-500 w-16 h-16" />;
      }

      const result = {
        code: scanInput.toUpperCase(),
        status,
        statusColor,
        icon,
        details: {
          category: isDamaged ? 'Flagged / Needs QC' : 'Electronics / Consumer',
          weight: '1.2 kg',
          targetBin: isMismatch ? 'HOLDING AREA' : 'Zone A / Rack 4',
          action: 'Inbound GRN'
        }
      };
      
      setScanResult(result);
      setIsScanning(false);
      
      // Prepend to logs
      setScanLogs(prev => [{
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        station: 'ST-04 (Active)',
        operator: 'Current User',
        code: scanInput.toUpperCase(),
        action: 'Inbound GRN',
        status: status
      }, ...prev].slice(0, 15));
      
      setScanInput('');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScanLine className="text-blue-600" /> Advanced Scanning Terminal
        </h2>
        <p className="text-sm text-gray-500 mt-1">Live barcode processing and scanner telemetry.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Target size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Items Scanned</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">14,293</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Scan Velocity</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">1,240 <span className="text-sm text-gray-400 font-medium">/ hr</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Crosshair size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Accuracy Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">99.4%</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Activity size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Scan-to-Shelf</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">4.2 <span className="text-sm text-gray-400 font-medium">mins</span></h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Terminal */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Cpu size={18} className="text-blue-400" /> Station ST-04 
              </h3>
              <div className="flex gap-3 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1"><BatteryMedium size={14} className="text-green-400" /> 84%</span>
                <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> Active</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col bg-gray-50">
              <form onSubmit={handleScanSubmit} className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  {isScanning ? <ScanLine className="animate-pulse text-blue-500" /> : <Fingerprint className="text-gray-400" />}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan SKU, Order ID, or AWB..."
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-lg font-bold font-mono uppercase transition-all shadow-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                  <ScanLine size={12}/> Ready for barcode laser input. Type "DAM" or "ERR" in string to test errors.
                </p>
              </form>

              {/* Live Result Feedback Area */}
              <div className="flex-1 min-h-[250px] bg-white rounded-xl border border-gray-200 shadow-inner flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {!scanResult && !isScanning && (
                  <div className="text-gray-400 flex flex-col items-center animate-pulse">
                    <ScanBarcode size={64} className="mb-4 opacity-20" />
                    <p className="font-bold tracking-widest uppercase">Awaiting Scan</p>
                  </div>
                )}

                {isScanning && (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-1 bg-blue-500 rounded-full animate-ping mb-6"></div>
                    <p className="font-bold text-blue-600 animate-pulse tracking-wider">PROCESSING...</p>
                  </div>
                )}

                {scanResult && !isScanning && (
                  <div className={`w-full h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200 ${scanResult.statusColor.split(' ')[0]}`}>
                    <div className="mb-4">{scanResult.icon}</div>
                    <h2 className="text-2xl font-black mb-1">{scanResult.status}</h2>
                    <p className="font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg mb-6 text-sm">{scanResult.code}</p>
                    
                    <div className="w-full text-left bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-semibold">Action:</span>
                        <span className="font-bold text-gray-900">{scanResult.details.action}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-semibold">Category:</span>
                        <span className="font-bold text-gray-900">{scanResult.details.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-semibold">Target Bin:</span>
                        <span className="font-bold text-gray-900">{scanResult.details.targetBin}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Log & Distribution */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600"/> Zone Activity Log
                </h3>
                <p className="text-sm text-gray-500 mt-1">Real-time scan manifestations across all terminals.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Terminal / Operator</th>
                    <th className="px-6 py-4">Barcode / SKU</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scanLogs.map((log, i) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs font-semibold">{log.time}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1">{log.station}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{log.operator} • {log.action}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-700">
                        {log.code}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold px-2 py-1 rounded-md text-xs uppercase \${
                          log.status === 'Success' ? 'bg-green-100 text-green-700' :
                          log.status === 'Mismatch' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
               <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Inbound Match Rate</h4>
                  <div className="text-2xl font-black text-gray-900 mt-1">98.2%</div>
               </div>
               <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-green-200 rotate-45"></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
               <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Exception Queue</h4>
                  <div className="text-2xl font-black text-gray-900 mt-1">14 <span className="text-sm font-medium text-gray-400 normal-case">items</span></div>
               </div>
               <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-orange-200 rotate-[120deg]"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

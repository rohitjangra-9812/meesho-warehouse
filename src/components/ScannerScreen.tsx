import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, ScanBarcode, PackageSearch, CheckCircle2, XCircle, AlertTriangle, 
  Activity, Users, BatteryMedium, Cpu, Search, Fingerprint, Zap, ArrowRight,
  TrendingUp, BarChart3, Target, Crosshair, Layers, Check, Box
} from 'lucide-react';

export function ScannerScreen() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'putwall'>('scanner');
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  
  // Put-Wall state
  const [selectedTote, setSelectedTote] = useState('TOTE-4091 (Batch #W-89)');
  const [cubbies, setCubbies] = useState([
    { id: 'A1', orderId: 'ORD-9021', customer: 'Rohit S.', itemsTotal: 3, itemsScanned: 3, status: 'Complete', sku: 'SKU-FASH-88' },
    { id: 'A2', orderId: 'ORD-9022', customer: 'Priya M.', itemsTotal: 2, itemsScanned: 1, status: 'In Progress', sku: 'SKU-ELEC-44' },
    { id: 'A3', orderId: 'ORD-9023', customer: 'Amit K.', itemsTotal: 4, itemsScanned: 0, status: 'Waiting', sku: 'SKU-HOME-10' },
    { id: 'A4', orderId: 'ORD-9024', customer: 'Sneha R.', itemsTotal: 1, itemsScanned: 1, status: 'Complete', sku: 'SKU-FASH-55' },
    { id: 'B1', orderId: 'ORD-9025', customer: 'Vikram V.', itemsTotal: 3, itemsScanned: 2, status: 'In Progress', sku: 'SKU-ELEC-91' },
    { id: 'B2', orderId: 'ORD-9026', customer: 'Neha G.', itemsTotal: 2, itemsScanned: 2, status: 'Complete', sku: 'SKU-HOME-33' },
    { id: 'B3', orderId: 'ORD-9027', customer: 'Rahul D.', itemsTotal: 5, itemsScanned: 4, status: 'In Progress', sku: 'SKU-FASH-12' },
    { id: 'B4', orderId: 'ORD-9028', customer: 'Anjali P.', itemsTotal: 2, itemsScanned: 0, status: 'Waiting', sku: 'SKU-ELEC-77' },
  ]);
  const [activeIlluminatedCubby, setActiveIlluminatedCubby] = useState<string | null>('A2');
  const [putwallToast, setPutwallToast] = useState<string | null>(null);

  const showPutwallToast = (msg: string) => {
    setPutwallToast(msg);
    setTimeout(() => setPutwallToast(null), 4000);
  };

  const handlePutwallScan = (cubbyId: string) => {
    setActiveIlluminatedCubby(cubbyId);
    setCubbies(prev => prev.map(c => {
      if (c.id === cubbyId) {
        const nextScanned = Math.min(c.itemsTotal, c.itemsScanned + 1);
        const nextStatus = nextScanned === c.itemsTotal ? 'Complete' : 'In Progress';
        if (nextStatus === 'Complete') {
          showPutwallToast(`📦 Cubby ${cubbyId} (${c.orderId}) is now COMPLETE and ready for packing!`);
        } else {
          showPutwallToast(`⚡ Scanned item routed to Cubby ${cubbyId} (${nextScanned}/${c.itemsTotal})`);
        }
        return { ...c, itemsScanned: nextScanned, status: nextStatus };
      }
      return c;
    }));
  };

  const [scanLogs, setScanLogs] = useState<any[]>([
    { id: 1, time: '10:42:15 AM', station: 'ST-04', operator: 'Raj Patel', code: 'AWB-8349281X', action: 'Inbound GRN', status: 'Success' },
    { id: 2, time: '10:41:30 AM', station: 'ST-04', operator: 'Raj Patel', code: 'SKU-ELECT-092', action: 'Wave Pick', status: 'Success' },
    { id: 3, time: '10:40:12 AM', station: 'ST-02', operator: 'Anita Sharma', code: 'AWB-UNKNOWN', action: 'Dispatch Sort', status: 'Mismatch' },
    { id: 4, time: '10:38:55 AM', station: 'ST-01', operator: 'Vikram Singh', code: 'SKU-FASH-118', action: 'Inbound GRN', status: 'Damaged' },
    { id: 5, time: '10:35:10 AM', station: 'ST-04', operator: 'Raj Patel', code: 'AWB-1122334X', action: 'Wave Pick', status: 'Success' },
  ]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext policy catch
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    
    playBeep();
    setIsScanning(true);
    setScanResult(null);
    
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
      {putwallToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-pink-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <Zap className="text-[#f43397] animate-pulse" size={20} />
          <span className="text-sm font-semibold">{putwallToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScanLine className="text-blue-600" /> Advanced Scanning Terminal & Put-Wall Sortation
          </h2>
          <p className="text-sm text-gray-500 mt-1">Live barcode processing, pick-to-light sorting, and batch consolidation.</p>
        </div>
        
        {/* Tab switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'scanner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ScanBarcode size={16} /> Barcode Terminal
          </button>
          <button
            onClick={() => setActiveTab('putwall')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'putwall' ? 'bg-white text-[#f43397] shadow-sm font-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={16} /> Put-Wall Sortation
          </button>
        </div>
      </div>

      {activeTab === 'putwall' ? (
        /* Put-Wall Sortation & Batch Order Consolidation Module */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-white p-6 rounded-2xl border border-pink-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-gray-900">Put-Wall Sortation Matrix (Wall #04)</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#f43397]">
                  Active Tote: {selectedTote}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Scan items from picked tote to illuminate target cubby. Sorting units for multi-item order consolidation.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => showPutwallToast('🔄 Tote batch re-assigned. Wall #04 cleared.')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl shadow-sm"
              >
                Change Tote Batch
              </button>
            </div>
          </div>

          {/* Interactive Cubby Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cubbies.map((cubby) => {
              const isIlluminated = activeIlluminatedCubby === cubby.id;
              const isComplete = cubby.status === 'Complete';
              return (
                <div 
                  key={cubby.id}
                  onClick={() => handlePutwallScan(cubby.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isIlluminated ? 'border-[#f43397] bg-pink-50/70 shadow-lg ring-4 ring-pink-500/20 animate-pulse' :
                    isComplete ? 'border-emerald-300 bg-emerald-50/40 shadow-sm' :
                    'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {isIlluminated && (
                    <div className="absolute top-0 right-0 bg-[#f43397] text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      ⚡ PUT HERE
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-xl text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-xl">
                      Cubby {cubby.id}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isComplete ? 'bg-emerald-100 text-emerald-800' :
                      cubby.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {cubby.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-semibold">Order ID:</span>
                      <strong className="text-gray-900">{cubby.orderId}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-semibold">Customer:</span>
                      <strong className="text-gray-900">{cubby.customer}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-semibold">SKU:</span>
                      <span className="font-mono text-gray-700 text-[11px]">{cubby.sku}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Progress: <strong className="text-gray-900">{cubby.itemsScanned} / {cubby.itemsTotal}</strong></span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePutwallScan(cubby.id); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                        isComplete ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#f43397] text-white hover:bg-[#d82481]'
                      }`}
                    >
                      {isComplete ? 'Ready to Pack' : 'Scan & Put'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Barcode Terminal */
        <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
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
                    {scanLogs.map((log) => (
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
                          <span className={`font-bold px-2 py-1 rounded-md text-xs uppercase ${
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
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Camera, Package, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReturnsScreen() {
  const [returnId, setReturnId] = useState('');
  const mockReturns = [
    { id: 'RET-99218', awb: 'AWB-8349281X', item: 'Meesho Women Ethnic Kurti', customer: 'Pooja Verma', reason: 'Size too large / Fit issue', date: '2026-08-19' },
    { id: 'RET-99219', awb: 'AWB-1122334X', item: 'Cotton Printed Bedsheet Set', customer: 'Rahul Sharma', reason: 'Defective Stitching', date: '2026-08-19' },
    { id: 'RET-99220', awb: 'AWB-5566778Y', item: 'Stainless Steel Water Bottle', customer: 'Sneha Gupta', reason: 'Incorrect Item Received', date: '2026-08-18' },
  ];

  const [selectedReturn, setSelectedReturn] = useState<any>(mockReturns[0]);
  const [qcStatus, setQcStatus] = useState<string | null>(null);
  const [qcNotes, setQcNotes] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [restockBin, setRestockBin] = useState<string | null>(null);

  // 3-step QC Checklist state
  const [step1Package, setStep1Package] = useState<'Pass' | 'Damaged' | 'Tampered'>('Pass');
  const [step2SkuTag, setStep2SkuTag] = useState<'Matched' | 'Mismatched' | 'Missing'>('Matched');
  const [step3Weight, setStep3Weight] = useState<'Match' | 'Variance'>('Match');
  const [liquidizeTag, setLiquidizeTag] = useState<'Restockable (Zone A)' | 'Liquidate (B2B RTV)' | 'Refurbish' | 'Quarantine'>('Restockable (Zone A)');

  const handleSelectReturn = (ret: any) => {
    setSelectedReturn(ret);
    setQcStatus(null);
    setQcNotes('');
    setPhotoCaptured(false);
    setRestockBin(null);
    setStep1Package('Pass');
    setStep2SkuTag('Matched');
    setStep3Weight('Match');
    setLiquidizeTag('Restockable (Zone A)');
  };

  const handleCompleteQC = (status: string, tag?: string) => {
    setQcStatus(status);
    if (tag) setLiquidizeTag(tag as any);
    if (status === 'Pass' || status === 'Refurbish') {
      setRestockBin('Bin-A12-QuickRestock');
    } else if (status === 'Damaged') {
      setRestockBin('Bin-Z99-RTV-Liquidate');
    } else {
      setRestockBin('Bin-Q05-DiscrepancyQuarantine');
    }
  };

  const generateQCCertificate = () => {
    if (!selectedReturn) return;
    const doc = new jsPDF();
    doc.text('Meesho Reverse Logistics - Quality Check Certificate', 14, 20);
    doc.setFontSize(10);
    doc.text(`Return ID: ${selectedReturn.id}`, 14, 30);
    doc.text(`AWB / Order: ${selectedReturn.awb}`, 14, 36);
    doc.text(`Item: ${selectedReturn.item}`, 14, 42);
    doc.text(`Customer Reason: ${selectedReturn.reason}`, 14, 48);
    doc.text(`QC Status Result: ${qcStatus}`, 14, 56);
    doc.text(`Assigned Restock Bin: ${restockBin}`, 14, 62);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 14, 68);
    
    autoTable(doc, {
      startY: 75,
      head: [['Inspection Parameter', 'Result', 'Notes']],
      body: [
        ['Packaging Integrity', qcStatus === 'Pass' ? 'Passed' : 'Failed', qcNotes || 'Standard inspection'],
        ['Tag & Barcode Scan', 'Matched', 'Valid SKU verified'],
        ['Physical Defect Check', qcStatus, 'Inspected via AI Camera & Inspector'],
      ]
    });
    
    doc.save(`QC_Certificate_${selectedReturn.id}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Return to Origin (RTO) & Reverse Logistics QC</h2>
          <p className="text-sm text-gray-500 mt-1">Inspect customer returns, grade item condition, and assign automated restocking bins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Returns Queue */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
            <span>Pending Returns Queue</span>
            <span className="bg-pink-50 text-[#f43397] px-2 py-0.5 rounded-full text-xs font-bold">{mockReturns.length}</span>
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {mockReturns.map(ret => (
              <div 
                key={ret.id}
                onClick={() => handleSelectReturn(ret)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedReturn?.id === ret.id ? 'border-[#f43397] bg-pink-50/50 shadow-sm' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900 text-sm">{ret.id}</span>
                  <span className="text-xs font-mono text-gray-500">{ret.date}</span>
                </div>
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{ret.item}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Reason: <strong className="text-gray-700">{ret.reason}</strong></span>
                  <span className="font-mono text-[#f43397] font-bold">{ret.awb}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Check Inspection Workbench */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-4">Inspection & QC Workbench</h3>
          {selectedReturn ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Selected Item</p>
                  <p className="font-bold text-gray-900">{selectedReturn.item}</p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">AWB: {selectedReturn.awb}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer Reported Reason</p>
                  <p className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block mt-1 text-xs">{selectedReturn.reason}</p>
                </div>
              </div>

              {/* Photo Simulation */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">Item Condition Photo Capture</p>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-24 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
                    {photoCaptured ? (
                      <div className="absolute inset-0 bg-pink-50 flex flex-col items-center justify-center text-[#f43397]">
                        <CheckCircle2 size={24} />
                        <span className="text-[10px] font-bold mt-1">Captured OK</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px]">No Photo</span>
                      </>
                    )}
                  </div>
                  <div>
                    <button 
                      onClick={() => setPhotoCaptured(true)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      {photoCaptured ? 'Retake Inspection Photo' : 'Capture Item Photo'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">AI automatically inspects packaging tags and physical defects.</p>
                  </div>
                </div>
              </div>

              {/* 3-Step QC Inspection Checklist */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#f43397]" /> 3-Step QC Inspection Checklist
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-500 block mb-1">1. Package Condition</span>
                    <select 
                      value={step1Package} 
                      onChange={e => setStep1Package(e.target.value as any)}
                      className="w-full p-1.5 border rounded font-medium text-gray-800 bg-gray-50"
                    >
                      <option value="Pass">Pass / Intact Box</option>
                      <option value="Damaged">Damaged / Torn</option>
                      <option value="Tampered">Tampered Seal</option>
                    </select>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-500 block mb-1">2. SKU Tag Verification</span>
                    <select 
                      value={step2SkuTag} 
                      onChange={e => setStep2SkuTag(e.target.value as any)}
                      className="w-full p-1.5 border rounded font-medium text-gray-800 bg-gray-50"
                    >
                      <option value="Matched">Matched Barcode</option>
                      <option value="Mismatched">Mismatched SKU</option>
                      <option value="Missing">Missing Barcode</option>
                    </select>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-500 block mb-1">3. Weight Check (1.2 kg)</span>
                    <select 
                      value={step3Weight} 
                      onChange={e => setStep3Weight(e.target.value as any)}
                      className="w-full p-1.5 border rounded font-medium text-gray-800 bg-gray-50"
                    >
                      <option value="Match">Exact Match (±0.05kg)</option>
                      <option value="Variance">Weight Variance (&gt;15%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* QC Decision Buttons */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">Assign Quality Grade</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => handleCompleteQC('Pass')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      qcStatus === 'Pass' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <CheckCircle2 size={18} /> Pass / Like New
                  </button>
                  <button 
                    onClick={() => handleCompleteQC('Refurbish')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      qcStatus === 'Refurbish' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <RefreshCw size={18} /> Refurbish
                  </button>
                  <button 
                    onClick={() => handleCompleteQC('Damaged')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      qcStatus === 'Damaged' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <XCircle size={18} /> Damaged / RTV
                  </button>
                  <button 
                    onClick={() => handleCompleteQC('Incorrect Item')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      qcStatus === 'Incorrect Item' ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    <AlertTriangle size={18} /> Incorrect Item
                  </button>
                </div>
              </div>

              {/* Inspector Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Inspector Notes</label>
                <input 
                  type="text" 
                  placeholder="Enter remarks (e.g. minor box tear, seal intact)..."
                  value={qcNotes}
                  onChange={e => setQcNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f43397]"
                />
              </div>

              {/* Restock Recommendation & Certificate */}
              {qcStatus && (
                <div className="bg-pink-50/60 border border-pink-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                  <div>
                    <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Automated System Recommendation</span>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">Route to Restock Bin: <span className="font-mono text-pink-700">{restockBin}</span></p>
                  </div>
                  <button 
                    onClick={generateQCCertificate}
                    className="px-4 py-2 bg-[#f43397] text-white rounded-lg font-bold text-xs hover:bg-pink-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <FileText size={16} /> Export QC Certificate PDF
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <RotateCcw size={48} className="mb-3 text-gray-300 animate-spin" />
              <p className="text-sm font-semibold text-gray-600">Select a return item from the queue to initiate QC inspection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

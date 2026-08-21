import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { useMaintenance } from '../lib/maintenance';
import { Landmark, ArrowUpRight, ArrowDownRight, ShieldCheck, RefreshCw, FileText, Download, CheckCircle, ShieldAlert, Lock, Unlock, FileSignature, Check, AlertTriangle, X, Pin, FileSpreadsheet, Receipt, Building2, Calendar, CreditCard, ExternalLink, Percent, Sparkles, Clock, Layers } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function MonthlyGstComplianceView({ onChallanPaid }: { onChallanPaid?: () => void }) {
  const { isMaintenance, checkAndBlockAction } = useMaintenance();
  const [gstData, setGstData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<any>(null);

  const fetchGst = async () => {
    try {
      const res = await fetchApi('/bank/gst-summary');
      setGstData(res);
    } catch (e) {
      console.error('Failed to fetch GST summary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGst();
  }, []);

  const handlePayTaxChallan = async () => {
    if (checkAndBlockAction("Tax Challan Payments")) {
      return;
    }
    if (!gstData) return;
    setIsPaying(true);
    try {
      const res = await fetchApi('/bank/pay-tax-challan', {
        method: 'POST',
        body: JSON.stringify({
          amount: gstData.netTaxPayable.total,
          challanType: 'GST PMT-06 / GSTR-3B Challan',
          remarks: `Monthly Tax Settlement for ${gstData.currentMonth} via SBI Escrow`
        })
      });
      if (res.success) {
        setGstData(res.gstCompliance);
        setPaidReceipt(res);
        setIsPayModalOpen(false);
        if (onChallanPaid) onChallanPaid();
      }
    } catch (err) {
      alert("Failed to pay tax challan. Please check bank balance and retry.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleDownloadGstCsv = () => {
    if (!gstData) return;
    const rows = [
      ['MEESHO WMS - MONTHLY GST & TAX COMPLIANCE REPORT'],
      ['Tax Period', gstData.currentMonth],
      ['GSTIN', gstData.gstin],
      ['Entity Name', gstData.registeredEntity],
      ['State Code', gstData.stateCode],
      ['Generated On', new Date().toLocaleString('en-IN')],
      [],
      ['1. TAX OVERVIEW & NET TAX LIABILITY COMPUTATION'],
      ['Category', 'CGST (INR)', 'SGST (INR)', 'IGST (INR)', 'Total Tax (INR)'],
      ['Output GST (Customer Dispatches)', gstData.outputGst.cgst, gstData.outputGst.sgst, gstData.outputGst.igst, gstData.outputGst.total],
      ['Input Tax Credit (ITC from 3PL/Vendors)', gstData.inputTaxCredit.cgst, gstData.inputTaxCredit.sgst, gstData.inputTaxCredit.igst, gstData.inputTaxCredit.total],
      ['Net Tax Payable (Output - ITC)', gstData.netTaxPayable.cgst, gstData.netTaxPayable.sgst, gstData.netTaxPayable.igst, gstData.netTaxPayable.total],
      [],
      ['2. SECTION 194O TCS SUMMARY (E-COMMERCE OPERATOR)'],
      ['Gross Marketplace GMV (INR)', gstData.section194OTcs.grossMarketplaceGmv],
      ['TCS Rate', gstData.section194OTcs.tcsRate],
      ['TCS Amount Collected (INR)', gstData.section194OTcs.tcsCollected],
      ['Filing Form', gstData.section194OTcs.filingForm],
      ['TCS Deposit Status', gstData.section194OTcs.status],
      ['TCS Due Date', gstData.section194OTcs.dueDate],
      [],
      ['3. STATUTORY FILING STATUS'],
      ['Return Form', 'Period', 'Due Date', 'Status', 'Details'],
      ['GSTR-1 (Outward Supplies)', gstData.gstr1.period, gstData.gstr1.dueDate, gstData.gstr1.status, `${gstData.gstr1.invoiceCount} Invoices (${gstData.gstr1.b2bCount} B2B, ${gstData.gstr1.b2cCount} B2C)`],
      ['GSTR-3B (Summary & Tax Settlement)', gstData.gstr3b.period, gstData.gstr3b.dueDate, gstData.netTaxPayable.isPaid ? 'Paid & Settled' : gstData.gstr3b.status, `Net Payable: INR ${gstData.netTaxPayable.total} (Challan: ${gstData.netTaxPayable.challanRef || 'Pending'})`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GST_Compliance_Report_${gstData.currentMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGstPdf = () => {
    if (!gstData) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEESHO LOGISTICS - MONTHLY GST & TAX COMPLIANCE', 14, 16);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`GSTIN: ${gstData.gstin} | State: ${gstData.stateCode} | Period: ${gstData.currentMonth}`, 14, 26);
    doc.text(`Entity: ${gstData.registeredEntity}`, 14, 32);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Net Tax Liability & ITC Reconciliation Summary', 14, 48);

    // Summary Table
    const taxTableData = [
      [
        'Output GST Collected (Customer Dispatches)',
        `INR ${gstData.outputGst.cgst.toLocaleString('en-IN')}`,
        `INR ${gstData.outputGst.sgst.toLocaleString('en-IN')}`,
        `INR ${gstData.outputGst.igst.toLocaleString('en-IN')}`,
        `INR ${gstData.outputGst.total.toLocaleString('en-IN')}`
      ],
      [
        'Less: Input Tax Credit (ITC - 3PL & Vendors)',
        `INR ${gstData.inputTaxCredit.cgst.toLocaleString('en-IN')}`,
        `INR ${gstData.inputTaxCredit.sgst.toLocaleString('en-IN')}`,
        `INR ${gstData.inputTaxCredit.igst.toLocaleString('en-IN')}`,
        `INR ${gstData.inputTaxCredit.total.toLocaleString('en-IN')}`
      ],
      [
        'Net Tax Payable to Govt (Output - ITC)',
        `INR ${gstData.netTaxPayable.cgst.toLocaleString('en-IN')}`,
        `INR ${gstData.netTaxPayable.sgst.toLocaleString('en-IN')}`,
        `INR ${gstData.netTaxPayable.igst.toLocaleString('en-IN')}`,
        `INR ${gstData.netTaxPayable.total.toLocaleString('en-IN')}`
      ]
    ];

    autoTable(doc, {
      startY: 52,
      head: [['Tax Description', 'CGST (9%)', 'SGST (9%)', 'IGST (18%)', 'Total Amount']],
      body: taxTableData,
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      theme: 'grid',
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    // Section 194O TCS & Filing status
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Section 194O E-Commerce TCS & Statutory Returns', 14, finalY);

    const filingTableData = [
      ['Section 194O TCS', `INR ${gstData.section194OTcs.grossMarketplaceGmv.toLocaleString('en-IN')}`, '0.10%', `INR ${gstData.section194OTcs.tcsCollected.toLocaleString('en-IN')}`, 'Form 26Q (Challan 281)', gstData.section194OTcs.dueDate],
      ['GSTR-1 Return', '14,280 Invoices Synced', '100% Match', 'Outward Supplies', 'Ready to File', gstData.gstr1.dueDate],
      ['GSTR-3B Return', `Tax: INR ${gstData.netTaxPayable.total.toLocaleString('en-IN')}`, 'Reconciled', gstData.netTaxPayable.isPaid ? 'PAID & SETTLED' : 'Pending Payment', gstData.netTaxPayable.challanRef || 'Challan PMT-06', gstData.gstr3b.dueDate]
    ];

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Compliance Item', 'Base Value', 'Rate/Metric', 'Tax/Status', 'Filing Form/Ref', 'Due Date']],
      body: filingTableData,
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    const finalY2 = (doc as any).lastAutoTable.finalY + 12;

    // Challan Payment Status Banner in PDF
    if (gstData.netTaxPayable.isPaid) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
      doc.roundedRect(14, finalY2, 182, 24, 3, 3, 'FD');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ GST CHALLAN PAID & SETTLED VIA SBI ESCROW ACCOUNT', 20, finalY2 + 9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Challan Ref No: ${gstData.netTaxPayable.challanRef} | Paid Date: ${new Date(gstData.netTaxPayable.paidAt).toLocaleString('en-IN')} | Debit Account: SBI Escrow (A/C: 98357632912)`, 20, finalY2 + 18);
    } else {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(239, 68, 68);
      doc.roundedRect(14, finalY2, 182, 24, 3, 3, 'FD');
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('! GST CHALLAN PAYMENT PENDING (GSTR-3B DUE 20 SEP 2026)', 20, finalY2 + 9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Net Payable: INR ${gstData.netTaxPayable.total.toLocaleString('en-IN')} (CGST: INR ${gstData.netTaxPayable.cgst} | SGST: INR ${gstData.netTaxPayable.sgst} | IGST: INR ${gstData.netTaxPayable.igst})`, 20, finalY2 + 18);
    }

    doc.save(`GST_Tax_Compliance_Report_${gstData.currentMonth.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading || !gstData) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
        <RefreshCw size={28} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-600">Loading Monthly GST & Tax Compliance Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Info & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
              <Receipt size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">Monthly GST & Tax Compliance</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                  {gstData.currentMonth}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                GSTIN: <span className="font-bold text-gray-800">{gstData.gstin}</span> • {gstData.registeredEntity}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={handleDownloadGstCsv}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={handleDownloadGstPdf}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileText size={15} className="text-red-600" /> Export PDF Report
          </button>
          {gstData.netTaxPayable.isPaid ? (
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <span>Challan Paid ({gstData.netTaxPayable.challanRef})</span>
            </div>
          ) : (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-sm transition-all animate-pulse"
            >
              <CreditCard size={16} /> Pay Tax Challan (PMT-06)
            </button>
          )}
        </div>
      </div>

      {paidReceipt && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-emerald-900 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black">GST Challan Paid Successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Challan Ref: <span className="font-mono font-bold">{paidReceipt.challanRef}</span> • Amount ₹{gstData.netTaxPayable.total.toLocaleString('en-IN')} debited from SBI Escrow A/C and recorded in Main Ledger.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setPaidReceipt(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 1. Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Output GST */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Output GST Collected</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">Dispatches</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">₹{gstData.outputGst.total.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-gray-500 mt-1">From 14,280 outbound customer dispatches</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>CGST (Central):</span>
              <span className="font-mono font-bold text-gray-900">₹{gstData.outputGst.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SGST (State):</span>
              <span className="font-mono font-bold text-gray-900">₹{gstData.outputGst.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>IGST (Integrated):</span>
              <span className="font-mono font-bold text-gray-900">₹{gstData.outputGst.igst.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Input Tax Credit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Tax Credit (ITC)</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">GSTR-2B Matched</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-600">₹{gstData.inputTaxCredit.total.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-gray-500 mt-1">From 3PL logistics, freight & packaging invoices</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>CGST (Input):</span>
              <span className="font-mono font-bold text-emerald-700">₹{gstData.inputTaxCredit.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SGST (Input):</span>
              <span className="font-mono font-bold text-emerald-700">₹{gstData.inputTaxCredit.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>IGST (Input):</span>
              <span className="font-mono font-bold text-emerald-700">₹{gstData.inputTaxCredit.igst.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Net Tax Payable (Output - ITC) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Net Tax Payable (Output - ITC)</span>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded ${gstData.netTaxPayable.isPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {gstData.netTaxPayable.isPaid ? 'Settled' : 'Payable'}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-white">₹{gstData.netTaxPayable.total.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-slate-300 mt-1">Output (₹18.45L) - ITC (₹11.20L)</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-1.5 text-xs text-slate-200">
            <div className="flex justify-between">
              <span>Net CGST:</span>
              <span className="font-mono font-bold text-amber-300">₹{gstData.netTaxPayable.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Net SGST:</span>
              <span className="font-mono font-bold text-amber-300">₹{gstData.netTaxPayable.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Net IGST:</span>
              <span className="font-mono font-bold text-amber-300">₹{gstData.netTaxPayable.igst.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Section 194O TCS Summary */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sec 194O TCS Summary</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded">E-Comm Operator</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-purple-700">₹{gstData.section194OTcs.tcsCollected.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-gray-500 mt-1">@ 0.10% on Gross GMV (₹1.84 Cr)</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Gross Marketplace GMV:</span>
              <span className="font-mono font-bold text-gray-900">₹{gstData.section194OTcs.grossMarketplaceGmv.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Filing Form:</span>
              <span className="font-semibold text-gray-800">{gstData.section194OTcs.filingForm}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Deposit Due Date:</span>
              <span className="font-bold text-blue-600">{gstData.section194OTcs.dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filing & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GSTR-1 Monthly Filing Status */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">GSTR-1 Monthly Outward Supplies</h4>
                <p className="text-xs text-gray-500">Period: {gstData.gstr1.period} • Table 4 & Table 7</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
              {gstData.gstr1.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-medium block mb-1">Statutory Due Date</span>
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm">
                <Calendar size={14} />
                <span>{gstData.gstr1.dueDate}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-medium block mb-1">Invoice Synchronization</span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <CheckCircle size={14} />
                <span>{gstData.gstr1.readinessScore}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-gray-700 space-y-2">
            <div className="flex justify-between items-center">
              <span>B2C E-Commerce Invoices (Table 7):</span>
              <span className="font-mono font-bold text-gray-900">{gstData.gstr1.b2cCount.toLocaleString('en-IN')} Orders</span>
            </div>
            <div className="flex justify-between items-center">
              <span>B2B Seller Hub Invoices (Table 4A):</span>
              <span className="font-mono font-bold text-gray-900">{gstData.gstr1.b2bCount} Registered Sellers</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-100 text-blue-900 font-bold">
              <span>Total Synced Taxable Turnover:</span>
              <span className="font-mono">₹{gstData.taxableSupplyValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* GSTR-3B Monthly Filing Status */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">GSTR-3B Summary Return & Challan</h4>
                <p className="text-xs text-gray-500">Period: {gstData.gstr3b.period} • Output Liability vs Input Tax Credit</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-black rounded-full border ${
              gstData.netTaxPayable.isPaid 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {gstData.netTaxPayable.isPaid ? 'Challan Paid' : gstData.gstr3b.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-medium block mb-1">Return Due Date</span>
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm">
                <Calendar size={14} />
                <span>{gstData.gstr3b.dueDate}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-medium block mb-1">Challan Payment Status</span>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                {gstData.netTaxPayable.isPaid ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle size={14} /> Paid & Cleared
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1">
                    <Clock size={14} /> Pending Payment
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-gray-700 space-y-2">
            <div className="flex justify-between items-center">
              <span>Debit Account:</span>
              <span className="font-semibold text-gray-900">State Bank of India (Escrow #98357632912)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Net Tax Payable:</span>
              <span className="font-mono font-black text-red-600">₹{gstData.netTaxPayable.total.toLocaleString('en-IN')}</span>
            </div>
            {gstData.netTaxPayable.challanRef && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-emerald-800 font-bold">
                <span>Challan Ref (CPIN):</span>
                <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-[11px]">{gstData.netTaxPayable.challanRef}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Tax Challan Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Receipt size={22} className="text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">GST PMT-06 Tax Challan Payment</h3>
                  <p className="text-[11px] text-slate-300">Period: {gstData.currentMonth} • State Bank of India Escrow</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs space-y-1.5">
                <p className="font-bold text-blue-900">Tax Payment Breakdown for Goods and Services Tax Network (GSTN):</p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[10px]">CGST</span>
                    <span className="font-bold font-mono text-gray-900">₹{gstData.netTaxPayable.cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[10px]">SGST</span>
                    <span className="font-bold font-mono text-gray-900">₹{gstData.netTaxPayable.sgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[10px]">IGST</span>
                    <span className="font-bold font-mono text-gray-900">₹{gstData.netTaxPayable.igst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Beneficiary:</span>
                  <span className="font-bold text-gray-900">GST Portal (Govt of India / GSTN)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Debit Source Account:</span>
                  <span className="font-semibold text-gray-900">State Bank of India (A/C: 98357632912)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Gross Outward Tax:</span>
                  <span className="font-mono text-gray-800">₹{gstData.outputGst.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Eligible ITC Offset:</span>
                  <span className="font-mono text-emerald-600">-₹{gstData.inputTaxCredit.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 text-gray-900">
                  <span>Total Net Debit:</span>
                  <span className="font-mono text-base font-black text-red-600">₹{gstData.netTaxPayable.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500">
                Clicking confirm will generate the e-Challan (PMT-06), instantly debit the escrow balance, and record the transaction in the Main Live Ledger.
              </p>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayTaxChallan}
                  disabled={isPaying}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isPaying ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  <span>{isPaying ? 'Processing Settlement...' : 'Authorize & Pay ₹' + gstData.netTaxPayable.total.toLocaleString('en-IN')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DailyLedgerView() {
  const { checkAndBlockAction } = useMaintenance();
  const [ledger, setLedger] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSignOffOpen, setIsSignOffOpen] = React.useState(false);
  const [managerId, setManagerId] = React.useState('');
  const [remarks, setRemarks] = React.useState('');

  const fetchLedger = async () => {
    try {
      const res = await fetchApi('/v3/finance/daily-ledger');
      setLedger(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerify = async () => {
    if (checkAndBlockAction("Ledger Approvals and Audits")) {
      return;
    }
    if (!managerId) {
      alert("Manager ID is required for verification.");
      return;
    }
    
    try {
      const res = await fetchApi('/v3/finance/daily-ledger/verify', {
        method: 'POST',
        body: JSON.stringify({
          date: ledger.date,
          managerId,
          remarks,
          data: ledger
        })
      });
      if (res.success) {
        setLedger({ ...res.verifiedLedger, isVerified: true });
        setIsSignOffOpen(false);
      }
    } catch (e) {
      alert("Verification failed.");
    }
  };

  const handleDownloadPDF = () => {
    if (!ledger) return;
    const doc = new jsPDF();
    doc.text(`Daily Sales, Loss & Financial Audit Report`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${ledger.date}`, 14, 30);
    doc.text(`Gross Sales: INR ${ledger.grossSales.toLocaleString()}`, 14, 40);
    doc.text(`COGS: INR ${ledger.cogs.toLocaleString()}`, 14, 48);
    doc.text(`Overheads: INR ${ledger.overhead.toLocaleString()}`, 14, 56);
    doc.text(`Total Losses: INR ${ledger.totalLossAmount.toLocaleString()}`, 14, 64);
    doc.text(`Net Profit: INR ${ledger.netDailyProfit.toLocaleString()} (${ledger.profitMargin.toFixed(2)}%)`, 14, 72);
    
    if (ledger.isVerified) {
      doc.setTextColor(0, 128, 0);
      doc.text(`VERIFIED by Manager: ${ledger.managerId} at ${new Date(ledger.verifiedAt).toLocaleString()}`, 14, 82);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(255, 0, 0);
      doc.text(`STATUS: PENDING REVIEW`, 14, 82);
      doc.setTextColor(0, 0, 0);
    }
    
    const tableData = ledger.dailyLosses.map((l: any) => [
      l.sku, l.category, `INR ${l.amount.toLocaleString()}`, l.station
    ]);
    
    autoTable(doc, {
      startY: 90,
      head: [['SKU/Order ID', 'Issue Category', 'Loss Amount', 'Terminal/Station']],
      body: tableData,
    });
    
    doc.save(`Financial_Audit_${ledger.date}.pdf`);
  };

  if (loading || !ledger) return <div className="text-center py-12">Loading daily ledger...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${ledger.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
             {ledger.isVerified ? <Lock size={24} /> : <Unlock size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Daily Financial Ledger</h3>
            <p className="text-sm font-semibold text-gray-500">Date: {ledger.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Download size={16} /> PDF Export
          </button>
          {!ledger.isVerified ? (
            <button 
              onClick={() => setIsSignOffOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <FileSignature size={16} /> Review & Sign-Off
            </button>
          ) : (
            <span className="px-4 py-2 bg-green-100 text-green-800 border border-green-200 font-bold text-sm rounded-lg flex items-center gap-2">
              <CheckCircle size={16} /> Verified Sealed
            </span>
          )}
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-semibold text-gray-500">Gross Sales Revenue</span>
           <span className="text-2xl font-black text-gray-900 mt-2">₹{ledger.grossSales.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-semibold text-gray-500">COGS</span>
           <span className="text-2xl font-bold text-orange-600 mt-2">-₹{ledger.cogs.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-semibold text-gray-500">Overhead (Fixed)</span>
           <span className="text-2xl font-bold text-orange-600 mt-2">-₹{ledger.overhead.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-bold text-red-700">Daily Shrink / Losses</span>
           <span className="text-2xl font-bold text-red-700 mt-2">-₹{ledger.totalLossAmount.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-green-200 bg-green-50 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-bold text-green-700">Net Daily Profit ({ledger.profitMargin.toFixed(1)}%)</span>
           <span className="text-2xl font-black text-green-700 mt-2">₹{ledger.netDailyProfit.toLocaleString()}</span>
         </div>
      </div>
      
      {/* Issues Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={18} />
          <h3 className="font-bold text-gray-900">Daily Issue & Loss Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-200">
               <tr>
                 <th className="px-6 py-3">SKU / Order ID</th>
                 <th className="px-6 py-3">Issue Category</th>
                 <th className="px-6 py-3">Responsible Station</th>
                 <th className="px-6 py-3 text-right">Financial Loss</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {ledger.dailyLosses.map((loss: any) => (
                 <tr key={loss.id}>
                   <td className="px-6 py-4 font-mono font-bold text-gray-900">{loss.sku}</td>
                   <td className="px-6 py-4">
                     <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">{loss.category}</span>
                   </td>
                   <td className="px-6 py-4 font-medium text-gray-600">{loss.station}</td>
                   <td className="px-6 py-4 text-right font-bold text-red-600">-₹{loss.amount.toLocaleString()}</td>
                 </tr>
               ))}
               {ledger.dailyLosses.length === 0 && (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No losses recorded for today.</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

      {ledger.isVerified && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
             <ShieldCheck size={32} className="text-green-600" />
          </div>
          <h4 className="text-lg font-black text-green-900">VERIFIED & SEALED</h4>
          <p className="text-sm font-semibold text-green-700 mt-1">
            Manager ID: <span className="font-mono">{ledger.managerId}</span> | 
            Verified At: {new Date(ledger.verifiedAt).toLocaleString()}
          </p>
          {ledger.remarks && <p className="text-sm italic text-green-800 mt-2">"{ledger.remarks}"</p>}
        </div>
      )}

      {/* Sign-Off Drawer/Modal */}
      {isSignOffOpen && !ledger.isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="text-blue-600" size={20} />
                Daily Report Sign-Off
              </h3>
              <button onClick={() => setIsSignOffOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 font-semibold mb-4">
                Sealing the ledger will lock the financial numbers for {ledger.date}. Ensure all discrepancy checks are completed.
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Financial Manager ID</label>
                <input 
                  type="text" 
                  value={managerId} 
                  onChange={e => setManagerId(e.target.value)} 
                  placeholder="e.g. FIN-MGR-402"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Audit Remarks (Optional)</label>
                <textarea 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                  placeholder="Notes regarding shrinkage or overhead adjustments..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsSignOffOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerify}
                  disabled={!managerId}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check size={18} /> Approve & Seal Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BankingScreen() {
  const { isMaintenance, checkAndBlockAction } = useMaintenance();
  const [data, setData] = useState<{ balance: number, transactions: any[], totalCredits?: number, totalDebits?: number, openingBalance?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'treasury' | 'ledger' | 'gst'>('treasury');
  
  // Verification Pending Queue state for Harsh Shara review
  const [pendingExpenditures, setPendingExpenditures] = useState<any[]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newCounterparty, setNewCounterparty] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newPaymentMode, setNewPaymentMode] = useState('Bank Transfer');
  const [newAmount, setNewAmount] = useState('');
  const [newOperatorName, setNewOperatorName] = useState('Rahul Operator');
  const [newType, setNewType] = useState('Debit');
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const fetchBanking = async () => {
    try {
      const res = await fetchApi('/bank/transactions');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingExpenditures = async () => {
    try {
      const res = await fetchApi('/bank/pending-expenditures');
      setPendingExpenditures(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBanking();
    fetchPendingExpenditures();
    const interval = setInterval(() => {
      fetchBanking();
      fetchPendingExpenditures();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRecordExpenditure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAndBlockAction("Recording Expenditures")) {
      return;
    }
    if (!newCounterparty || !newAmount) return;
    try {
      const res = await fetchApi('/bank/record-expenditure', {
        method: 'POST',
        body: JSON.stringify({
          counterparty: newCounterparty,
          purpose: newPurpose || 'Operational Expenditure',
          paymentMode: newPaymentMode,
          type: newType,
          amount: Number(newAmount),
          recordedBy: newOperatorName || 'WMS Operator'
        })
      });
      if (res.success) {
        setPendingExpenditures(res.pendingExpenditures);
        setIsRecordModalOpen(false);
        setNewCounterparty('');
        setNewPurpose('');
        setNewAmount('');
        setNewPaymentMode('Bank Transfer');
        setNewOperatorName('Rahul Operator');
      }
    } catch (err) {
      alert("Failed to record expenditure.");
    }
  };

  const handleApproveExpenditure = async (id: number) => {
    if (checkAndBlockAction("Expenditure Approvals")) {
      return;
    }
    setApprovingId(id);
    try {
      const res = await fetchApi('/bank/approve-expenditure', {
        method: 'POST',
        body: JSON.stringify({ id, approvedBy: 'Harsh Shara' })
      });
      if (res.success) {
        setPendingExpenditures(res.pendingExpenditures);
        fetchBanking();
      }
    } catch (err) {
      alert("Failed to approve expenditure.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banking & Finance</h2>
          <p className="text-sm text-gray-500 mt-1">Live treasury, payouts, settlements, verification queue & GST compliance</p>
        </div>
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('treasury')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'treasury' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Live Treasury
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'ledger' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Daily P&L Ledger
          </button>
          <button
            onClick={() => setActiveTab('gst')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'gst' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Receipt size={14} /> Monthly GST & Tax
          </button>
        </div>
      </div>
      
      {activeTab === 'treasury' ? (
        <div className="space-y-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setActiveTab('gst')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Receipt size={15} /> Monthly GST Portal
            </button>
            <button 
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <FileSignature size={16} /> Record Expenditure
            </button>
            <button 
              onClick={() => { setLoading(true); fetchBanking(); fetchPendingExpenditures(); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Transactions
            </button>
          </div>

          {/* Verification Pending Queue Card (Harsh Shara Review) */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-amber-600" size={20} />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Verification Pending Queue</h3>
                  <p className="text-xs text-amber-800">Expenditures recorded by users awaiting review and approval by <span className="font-bold">Harsh Shara</span></p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                {pendingExpenditures.length} Pending Review
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100">
                    <th className="px-6 py-3">Date & Time</th>
                    <th className="px-6 py-3">Recipient / Vendor</th>
                    <th className="px-6 py-3">Purpose / Notes</th>
                    <th className="px-6 py-3">Payment Mode</th>
                    <th className="px-6 py-3">Operator Name</th>
                    <th className="px-6 py-3 text-right">Amount (INR)</th>
                    <th className="px-6 py-3 text-center">Review Action (Harsh Shara)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {pendingExpenditures.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-xs font-semibold">
                        ✓ All user expenditures have been verified and approved by Harsh Shara.
                      </td>
                    </tr>
                  ) : (
                    pendingExpenditures.map((exp: any) => {
                      return (
                        <tr key={exp.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">
                            <div>{exp.dateStr || new Date(exp.timestamp).toLocaleDateString()}</div>
                            <div className="text-[10px] text-gray-400">{exp.timeStr || new Date(exp.timestamp).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-gray-900">{exp.counterparty}</td>
                          <td className="px-6 py-3.5 text-gray-600 text-xs">{exp.purpose}</td>
                          <td className="px-6 py-3.5">
                            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                              {exp.paymentMode || 'Bank Transfer'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-medium text-blue-600">{exp.recordedBy}</td>
                          <td className="px-6 py-3.5 text-right font-mono font-bold text-red-600">
                            -₹{exp.amount?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <button
                              onClick={() => handleApproveExpenditure(exp.id)}
                              disabled={approvingId === exp.id}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle size={14} />
                              <span>{approvingId === exp.id ? 'Approving...' : 'Approve as Harsh Shara'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <Landmark size={24} className="text-blue-100" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-wide">State Bank of India</h3>
                    <p className="text-blue-200 text-sm font-medium">Primary Escrow Account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                  <div>
                    <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Account No.</p>
                    <p className="font-mono text-lg tracking-wider">98357632912</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">IFSC Code</p>
                    <p className="font-mono text-lg tracking-wider">SBIN0050713</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Owner Name</p>
                    <p className="font-semibold text-base">MEESHO PVT. LTD.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-left md:text-right w-full md:w-auto p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Available Balance</p>
                <p className="text-3xl font-bold tracking-tight">
                  {loading && !data ? '₹ --,---' : `₹ ${data?.balance?.toLocaleString('en-IN')}`}
                </p>
              </div>
            </div>
          </div>

          {/* Ledger Summary Balances */}
          {data?.transactions && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opening Balance</p>
                  <p className="text-xl font-black text-gray-900 mt-1">
                    ₹20,00,00,000
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Landmark size={20} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Credits</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    +₹{(data.totalCredits ?? data.transactions.filter((t: any) => t.type === 'Credit').reduce((acc: number, t: any) => acc + (t.amount || 0), 0)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <ArrowDownRight size={20} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Debits</p>
                  <p className="text-xl font-bold text-red-600 mt-1">
                    -₹{(data.totalDebits ?? data.transactions.filter((t: any) => t.type === 'Debit').reduce((acc: number, t: any) => acc + (t.amount || 0), 0)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Ledger Balance</p>
                  {(() => {
                    const c = data.totalCredits ?? data.transactions.filter((t: any) => t.type === 'Credit').reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
                    const d = data.totalDebits ?? data.transactions.filter((t: any) => t.type === 'Debit').reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
                    const opening = data.openingBalance ?? 200000000;
                    const netBalance = opening + c - d;
                    return (
                      <p className="text-xl font-black text-blue-600 mt-1">
                        ₹{netBalance.toLocaleString('en-IN')}
                      </p>
                    );
                  })()}
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Landmark size={20} />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Recent Transactions (Last 10 Min)</h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Live Updates</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Counterparty</th>
                    <th className="px-6 py-3">Purpose</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading && !data ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading ledger...</td></tr>
                  ) : data?.transactions?.map((tx: any) => {
                    const isCredit = tx.type === 'Credit';
                    const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    
                    return (
                      <tr 
                        key={tx.id} 
                        className={`transition-colors ${
                          tx.pinned 
                            ? 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-amber-500 font-medium' 
                            : 'hover:bg-gray-50/80'
                        }`}
                      >
                        <td className="px-6 py-3.5 text-gray-600 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            {tx.pinned && (
                              <span title={`Permanently Pinned Transaction #${tx.pinRank || ''}`} className="text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1">
                                <Pin size={11} className="rotate-45 text-amber-900 fill-amber-900" />
                                PINNED #{tx.pinRank || '1'}
                              </span>
                            )}
                            <span>{timeStr}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{tx.counterparty}</span>
                            {tx.pinned && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider flex items-center gap-1">
                                <Lock size={10} className="text-amber-700" /> Locked Core
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-gray-700 text-xs">
                          <span className={tx.pinned ? 'font-semibold text-slate-900' : ''}>
                            {tx.purpose}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                            isCredit ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {isCredit ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-black font-mono">
                          <span className={isCredit ? 'text-emerald-700' : 'text-gray-900'}>
                            {isCredit ? '+' : '-'} ₹{tx.amount?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            tx.pinned ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2 text-blue-900">
              <Pin size={18} className="text-blue-600 rotate-45" />
              <span className="text-xs font-bold">
                Note: The top three transactions are permanently pinned and locked until the next order settlement.
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-800">
              <ShieldCheck size={18} className="text-green-600" />
              <span className="text-xs font-semibold tracking-wide">
                Verified after inspection by Insp. Rohit Jangra.
              </span>
            </div>
          </div>
        </div>
      ) : activeTab === 'ledger' ? (
        <DailyLedgerView />
      ) : (
        <MonthlyGstComplianceView onChallanPaid={() => fetchBanking()} />
      )}

      {/* Record Expenditure Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileSignature className="text-blue-600" size={20} />
                Record Expenditure for Verification
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecordExpenditure} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Recipient / Vendor Name</label>
                <input 
                  type="text" 
                  value={newCounterparty} 
                  onChange={e => setNewCounterparty(e.target.value)} 
                  placeholder="e.g. Apex Express Supplies" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Specific Purpose / Notes</label>
                <input 
                  type="text" 
                  value={newPurpose} 
                  onChange={e => setNewPurpose(e.target.value)} 
                  placeholder="e.g. Emergency Pallet Racks & Strapping" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payment Mode</label>
                  <select 
                    value={newPaymentMode} 
                    onChange={e => setNewPaymentMode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Escrow">Escrow</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Amount (INR)</label>
                  <input 
                    type="number" 
                    value={newAmount} 
                    onChange={e => setNewAmount(e.target.value)} 
                    placeholder="15000" 
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Submitting Operator Name</label>
                <input 
                  type="text" 
                  value={newOperatorName} 
                  onChange={e => setNewOperatorName(e.target.value)} 
                  placeholder="e.g. Rahul Operator" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Submitted entries route directly into the Verification Pending queue awaiting approval by <span className="font-bold text-gray-800">Harsh Shara</span>.
              </p>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm shadow-sm flex items-center gap-2"
                >
                  <Check size={18} /> Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

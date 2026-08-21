import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  FileOutput, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Receipt, 
  Percent, 
  DollarSign, 
  PieChart as PieIcon, 
  Truck, 
  Package, 
  Layers, 
  UtensilsCrossed, 
  RefreshCw, 
  Sparkles, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  PlusCircle,
  BarChart3,
  Scale
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchApi } from '../lib/api';
import { 
  getPnLData, 
  getGstComplianceData, 
  generateSampleTaxInvoice, 
  getInboundOutboundAuditData, 
  getRtoReturnLossData, 
  getCanteenMealExpenseData 
} from '../data/reportsData';
import { 
  PnLTimeframeData, 
  GstTaxBreakdown, 
  GstTaxInvoice, 
  InboundOutboundAuditReport, 
  RtoReturnLossReport, 
  CanteenMealExpenseReport 
} from '../types/reports';
import { GstInvoiceModal } from './GstInvoiceModal';

export function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<'pnl' | 'gst' | 'inboundAudit' | 'rtoLeakage' | 'canteen' | 'allExports'>('pnl');
  const [timeframe, setTimeframe] = useState<'Today' | 'Shift A' | 'Shift B' | 'Shift C' | 'Weekly' | 'Monthly'>('Today');
  
  // Data States
  const [pnlData, setPnlData] = useState<PnLTimeframeData>(() => getPnLData('Today'));
  const [gstData, setGstData] = useState<GstTaxBreakdown>(() => getGstComplianceData());
  const [inboundData, setInboundData] = useState<InboundOutboundAuditReport>(() => getInboundOutboundAuditData());
  const [rtoData, setRtoData] = useState<RtoReturnLossReport>(() => getRtoReturnLossData());
  const [canteenData, setCanteenData] = useState<CanteenMealExpenseReport>(() => getCanteenMealExpenseData());
  const [b2bInvoices, setB2bInvoices] = useState<any[]>([]);

  // Selected Invoice for Modal
  const [selectedInvoice, setSelectedInvoice] = useState<GstTaxInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);

  // Fetch P&L
  const loadPnl = async (tf: 'Today' | 'Shift A' | 'Shift B' | 'Shift C' | 'Weekly' | 'Monthly') => {
    try {
      setLoading(true);
      const res = await fetchApi(`/reports/pnl?timeframe=${encodeURIComponent(tf)}`);
      if (res && res.grossRevenue) {
        setPnlData(res);
      } else {
        setPnlData(getPnLData(tf));
      }
    } catch (e) {
      console.warn('Fallback to local PnL computation', e);
      setPnlData(getPnLData(tf));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Invoices & GST
  const loadGstAndInvoices = async () => {
    try {
      const [gstRes, invRes, inbRes, rtoRes, canRes] = await Promise.allSettled([
        fetchApi('/bank/gst-summary'),
        fetchApi('/reports/gst-invoices'),
        fetchApi('/reports/inbound-audit'),
        fetchApi('/reports/rto-leakage'),
        fetchApi('/reports/canteen-expense')
      ]);

      if (gstRes.status === 'fulfilled' && gstRes.value) {
        setGstData({ ...getGstComplianceData(), ...gstRes.value });
      }
      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value)) {
        setB2bInvoices(invRes.value);
      }
      if (inbRes.status === 'fulfilled' && inbRes.value?.auditItems) {
        setInboundData(inbRes.value);
      }
      if (rtoRes.status === 'fulfilled' && rtoRes.value?.rtoCategoryBreakdown) {
        setRtoData(rtoRes.value);
      }
      if (canRes.status === 'fulfilled' && canRes.value?.shiftWiseExpenses) {
        setCanteenData(canRes.value);
      }
    } catch (e) {
      console.warn('Loaded reports default state', e);
    }
  };

  useEffect(() => {
    loadPnl(timeframe);
    loadGstAndInvoices();
  }, [timeframe]);

  const handleTimeframeChange = (tf: 'Today' | 'Shift A' | 'Shift B' | 'Shift C' | 'Weekly' | 'Monthly') => {
    setTimeframe(tf);
    loadPnl(tf);
  };

  const handleOpenNewInvoice = () => {
    const sample = generateSampleTaxInvoice();
    setSelectedInvoice(sample);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoiceItem = (inv: any) => {
    const isInterstate = inv.placeOfSupply && !inv.placeOfSupply.includes('29');
    const full = generateSampleTaxInvoice(
      inv.invoiceNumber,
      inv.buyerGstin,
      inv.buyerName,
      inv.sacCode,
      inv.taxableAmount,
      isInterstate
    );
    setSelectedInvoice(full);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveNewInvoice = async (newInvParams: any) => {
    try {
      const res = await fetchApi('/reports/gst-invoice/generate', {
        method: 'POST',
        body: JSON.stringify(newInvParams)
      });
      if (res && res.success) {
        setB2bInvoices(res.allInvoices || [res.invoice, ...b2bInvoices]);
        const full = generateSampleTaxInvoice(
          res.invoice.invoiceNumber,
          res.invoice.buyerGstin,
          res.invoice.buyerName,
          res.invoice.sacCode,
          res.invoice.taxableAmount,
          res.invoice.placeOfSupply && !res.invoice.placeOfSupply.includes('29')
        );
        setSelectedInvoice(full);
      }
    } catch (e) {
      alert('Invoice created locally in session');
      const fallbackInv = generateSampleTaxInvoice(
        undefined,
        newInvParams.buyerGstin,
        newInvParams.buyerName,
        newInvParams.sacCode,
        newInvParams.taxableAmount,
        newInvParams.placeOfSupply && !newInvParams.placeOfSupply.includes('29')
      );
      setB2bInvoices([fallbackInv, ...b2bInvoices]);
      setSelectedInvoice(fallbackInv);
    }
  };

  // Helper PDF & CSV Exporters
  const exportPnlPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(244, 51, 151);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEESHO WMS - PROFIT & LOSS (P&L) FINANCIAL STATEMENT', 14, 14);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Timeframe: ${pnlData.periodLabel} | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 22);
    doc.text(`Hub: Meesho Mega Logistics Center Hub-04 (Hoskote, KA)`, 14, 27);

    // Summary Table
    const pnlRows = [
      ['A. REVENUE STREAMS', '', ''],
      ['Order Fulfillment Fees (Base Ops)', `INR ${pnlData.revenueBreakdown.orderFulfillmentFees.toLocaleString('en-IN')}`, '₹28/order base pack & sort fee'],
      ['3PL Surface & Air Shipping Income', `INR ${pnlData.revenueBreakdown.shipping3PLIncome.toLocaleString('en-IN')}`, 'Forward carriage markups'],
      ['Warehousing & Pallet Storage Tariff', `INR ${pnlData.revenueBreakdown.warehousingStorageCharges.toLocaleString('en-IN')}`, 'Sq.ft storage billings'],
      ['Packaging Consumables Fee', `INR ${pnlData.revenueBreakdown.packagingMaterialFees.toLocaleString('en-IN')}`, 'Corrugated cartons & bubble wraps'],
      ['Reverse Logistics / Return Handling Fees', `INR ${pnlData.revenueBreakdown.returnHandlingFees.toLocaleString('en-IN')}`, 'RTO inspection & return tariff'],
      ['GROSS REVENUE (A)', `INR ${pnlData.grossRevenue.toLocaleString('en-IN')}`, '100% Topline'],
      ['', '', ''],
      ['B. COST OF OPERATIONS (COGS)', '', ''],
      ['3PL Carrier Dispatch Freight (Delhivery/Xpressbees)', `INR ${pnlData.cogsBreakdown.carrierDispatchFreight.toLocaleString('en-IN')}`, 'Direct freight linehauls'],
      ['Packaging Consumables & Boxes', `INR ${pnlData.cogsBreakdown.packagingConsumables.toLocaleString('en-IN')}`, 'Boxes, tape, labels'],
      ['TOTAL COGS (B)', `INR ${pnlData.totalCOGS.toLocaleString('en-IN')}`, `Direct Costs (${(100 - pnlData.grossMarginPct).toFixed(1)}%)`],
      ['GROSS PROFIT (A - B)', `INR ${pnlData.grossProfit.toLocaleString('en-IN')}`, `Gross Margin: ${pnlData.grossMarginPct}%`],
      ['', '', ''],
      ['C. OPERATIONAL EXPENDITURES (OPEX)', '', ''],
      ['Warehouse Labor & Overtime Wages', `INR ${pnlData.opexBreakdown.warehouseLaborOvertime.toLocaleString('en-IN')}`, 'Shift wages, floor workers, OT'],
      ['Conveyor & Dock Sorter Maintenance', `INR ${pnlData.opexBreakdown.conveyorDockMaintenance.toLocaleString('en-IN')}`, 'Cross-belt sorters & levelers'],
      ['Electricity & Diesel Utility Overheads', `INR ${pnlData.opexBreakdown.electricityUtilityOverheads.toLocaleString('en-IN')}`, 'Grid power & backup genset fuel'],
      ['Canteen Staff Meal Subsidies', `INR ${pnlData.opexBreakdown.canteenSubsidies.toLocaleString('en-IN')}`, '₹52/plate corporate meal subsidy'],
      ['Cloud WMS & IoT Scanner Subscriptions', `INR ${pnlData.opexBreakdown.techCloudSaaS.toLocaleString('en-IN')}`, 'SaaS telemetry & RFID infra'],
      ['TOTAL OPEX (C)', `INR ${pnlData.totalOpex.toLocaleString('en-IN')}`, 'Fixed & Variable Overheads'],
      ['EBITDA', `INR ${pnlData.ebitda.toLocaleString('en-IN')}`, `EBITDA Margin: ${pnlData.ebitdaMarginPct}%`],
      ['NET OPERATING PROFIT', `INR ${pnlData.netOperatingProfit.toLocaleString('en-IN')}`, `Net Margin: ${pnlData.netMarginPct}%`]
    ];

    autoTable(doc, {
      startY: 38,
      head: [['Financial Line Item', 'Amount (INR)', 'Notes & Driver Metrics']],
      body: pnlRows,
      headStyles: { fillColor: [244, 51, 151], fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' },
        1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 55, fontSize: 8 }
      }
    });

    doc.save(`Meesho_WMS_PnL_Statement_${pnlData.timeframe}.pdf`);
  };

  const exportPnlCSV = () => {
    const rows = [
      ['MEESHO WMS - PROFIT & LOSS (P&L) FINANCIAL STATEMENT'],
      ['Timeframe', pnlData.periodLabel],
      ['Orders Fulfilled', pnlData.totalOrdersFulfilled],
      ['Packages Scanned', pnlData.totalPackagesScanned],
      ['Generated At', new Date().toISOString()],
      [],
      ['CATEGORY', 'LINE ITEM', 'AMOUNT (INR)', 'PERCENTAGE OF REVENUE'],
      ['Revenue', 'Order Fulfillment Fees', pnlData.revenueBreakdown.orderFulfillmentFees, `${((pnlData.revenueBreakdown.orderFulfillmentFees / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Revenue', '3PL Shipping Income', pnlData.revenueBreakdown.shipping3PLIncome, `${((pnlData.revenueBreakdown.shipping3PLIncome / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Revenue', 'Warehousing Storage Charges', pnlData.revenueBreakdown.warehousingStorageCharges, `${((pnlData.revenueBreakdown.warehousingStorageCharges / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Revenue', 'Packaging Material Fees', pnlData.revenueBreakdown.packagingMaterialFees, `${((pnlData.revenueBreakdown.packagingMaterialFees / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Revenue', 'Return Handling Fees', pnlData.revenueBreakdown.returnHandlingFees, `${((pnlData.revenueBreakdown.returnHandlingFees / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Revenue Summary', 'GROSS REVENUE', pnlData.grossRevenue, '100.0%'],
      [],
      ['COGS', 'Carrier Dispatch Freight', pnlData.cogsBreakdown.carrierDispatchFreight, `${((pnlData.cogsBreakdown.carrierDispatchFreight / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['COGS', 'Packaging Consumables', pnlData.cogsBreakdown.packagingConsumables, `${((pnlData.cogsBreakdown.packagingConsumables / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['COGS Summary', 'TOTAL COGS', pnlData.totalCOGS, `${((pnlData.totalCOGS / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Profit', 'GROSS PROFIT', pnlData.grossProfit, `${pnlData.grossMarginPct}%`],
      [],
      ['Opex', 'Warehouse Labor & Overtime', pnlData.opexBreakdown.warehouseLaborOvertime, `${((pnlData.opexBreakdown.warehouseLaborOvertime / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Opex', 'Conveyor & Dock Maintenance', pnlData.opexBreakdown.conveyorDockMaintenance, `${((pnlData.opexBreakdown.conveyorDockMaintenance / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Opex', 'Electricity & Diesel Utility', pnlData.opexBreakdown.electricityUtilityOverheads, `${((pnlData.opexBreakdown.electricityUtilityOverheads / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Opex', 'Canteen Meal Subsidies', pnlData.opexBreakdown.canteenSubsidies, `${((pnlData.opexBreakdown.canteenSubsidies / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Opex', 'Cloud WMS / SaaS Subscriptions', pnlData.opexBreakdown.techCloudSaaS, `${((pnlData.opexBreakdown.techCloudSaaS / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['Opex Summary', 'TOTAL OPEX', pnlData.totalOpex, `${((pnlData.totalOpex / pnlData.grossRevenue) * 100).toFixed(1)}%`],
      ['EBITDA', 'EBITDA (Earnings Before Interest, Tax, Depr)', pnlData.ebitda, `${pnlData.ebitdaMarginPct}%`],
      ['Net Profit', 'NET OPERATING PROFIT', pnlData.netOperatingProfit, `${pnlData.netMarginPct}%`],
      [],
      ['UNIT ECONOMICS', 'Average Revenue Per Order (INR)', pnlData.unitEconomics.avgRevenuePerOrder],
      ['UNIT ECONOMICS', 'Average Fulfillment Cost Per Order (INR)', pnlData.unitEconomics.avgCostPerOrder],
      ['UNIT ECONOMICS', 'Average Net Profit Per Order (INR)', pnlData.unitEconomics.avgProfitPerOrder]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Meesho_WMS_PnL_Statement_${pnlData.timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportGenericSubReportPDF = (title: string, headers: string[], rows: any[][]) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(244, 51, 151);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(`MEESHO WMS - ${title.toUpperCase()}`, 14, 13);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Hub: Hoskote Mega Hub-04`, 14, 21);

    autoTable(doc, {
      startY: 34,
      head: [headers],
      body: rows,
      headStyles: { fillColor: [244, 51, 151], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8 }
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const exportGenericSubReportCSV = (title: string, headers: string[], rows: any[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Data
  const opexPieData = [
    { name: 'Labor & OT', value: pnlData.opexBreakdown.warehouseLaborOvertime, color: '#3b82f6' },
    { name: 'Conveyor/Dock Maint', value: pnlData.opexBreakdown.conveyorDockMaintenance, color: '#8b5cf6' },
    { name: 'Power & Utility', value: pnlData.opexBreakdown.electricityUtilityOverheads, color: '#f59e0b' },
    { name: 'Canteen Subsidy', value: pnlData.opexBreakdown.canteenSubsidies, color: '#ec4899' },
    { name: 'Cloud WMS SaaS', value: pnlData.opexBreakdown.techCloudSaaS, color: '#10b981' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <FileBarChart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Reports & Issuance Command</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                  v3.4 Financial Suite
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Profit & Loss statements, automated SAC/HSN GST tax billing, unit economics, and audit ledgers
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenNewInvoice}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Receipt size={16} className="text-pink-400" />
            + B2B GST Tax Invoice Generator
          </button>

          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {(['Today', 'Shift A', 'Shift B', 'Shift C', 'Weekly', 'Monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadPnl(timeframe)}
            title="Refresh Ledger Telemetry"
            className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 shadow-sm transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-pink-500' : ''} />
          </button>
        </div>
      </div>

      {/* Main Top Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {[
          { id: 'pnl', label: 'Profit & Loss (P&L) Analytical Suite', icon: TrendingUp, count: `${pnlData.netMarginPct}% Margin` },
          { id: 'gst', label: 'GST & Tax Compliance Billing', icon: Receipt, count: 'SAC & GSTR Reconciled' },
          { id: 'inboundAudit', label: 'Inbound & Outbound Audit', icon: ShieldCheck, count: `${inboundData.totalDamagedQuantity} Damaged` },
          { id: 'rtoLeakage', label: 'RTO & Return Loss Leakage', icon: ArrowDownRight, count: `₹${(rtoData.netReturnFinancialLeakage / 1000).toFixed(0)}k Leakage` },
          { id: 'canteen', label: 'Canteen & Meal Subsidies', icon: UtensilsCrossed, count: `${canteenData.totalMealsServed.toLocaleString('en-IN')} Meals` },
          { id: 'allExports', label: 'Legacy Roster & Cycle Counts', icon: FileSpreadsheet, count: 'Archived' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-pink-50 text-[#f43397] border-pink-300 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#f43397]' : 'text-gray-400'} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-pink-200/70 text-pink-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PROFIT & LOSS (P&L) ANALYTICAL REPORT SUITE */}
      {/* ======================================================== */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          
          {/* Top Key Performance Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Gross Revenue */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Revenue (Topline)</span>
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                  ₹{pnlData.grossRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-green-600 font-semibold">
                  <ArrowUpRight size={14} />
                  <span>{pnlData.totalOrdersFulfilled.toLocaleString('en-IN')} orders fulfilled</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>Avg Revenue / Order:</span>
                <strong className="text-gray-900">₹{pnlData.unitEconomics.avgRevenuePerOrder}</strong>
              </div>
            </div>

            {/* Direct COGS */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Direct COGS (Freight & Pkg)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck size={18} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                  ₹{pnlData.totalCOGS.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-semibold">
                  <span>Gross Profit: ₹{pnlData.grossProfit.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400">({pnlData.grossMarginPct}%)</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>3PL Carrier Freight:</span>
                <strong className="text-gray-900">₹{pnlData.cogsBreakdown.carrierDispatchFreight.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Total OPEX & EBITDA */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operating Profit (EBITDA)</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Layers size={18} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                  ₹{pnlData.ebitda.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600 font-semibold">
                  <span className="px-2 py-0.5 bg-purple-100 rounded-full text-[10px] font-bold">
                    EBITDA Margin: {pnlData.ebitdaMarginPct}%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>Total Opex Overhead:</span>
                <strong className="text-gray-900">₹{pnlData.totalOpex.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Net Operating Margin */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Net Operating Profit</span>
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  ₹{pnlData.netOperatingProfit.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-pink-300 font-semibold">
                  <span>Net Margin: <strong>{pnlData.netMarginPct}%</strong></span>
                  <span className="text-slate-400 font-normal">after depreciation & tax</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-[11px] text-slate-300 flex justify-between">
                <span>Avg Net Profit / Order:</span>
                <strong className="text-pink-400 font-bold">₹{pnlData.unitEconomics.avgProfitPerOrder}</strong>
              </div>
            </div>

          </div>

          {/* Graphical Analysis: Revenue vs Opex & Overhead Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Hourly / Period Financial Flow Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#f43397]" />
                    Revenue vs. Operational Cost Flow ({pnlData.timeframe})
                  </h3>
                  <p className="text-xs text-gray-500">Hourly throughput revenue against direct COGS and labor opex</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportPnlPDF}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm"
                  >
                    <FileOutput size={14} className="text-red-500" /> Export PDF
                  </button>
                  <button
                    onClick={exportPnlCSV}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm"
                  >
                    <FileSpreadsheet size={14} className="text-green-600" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData.hourlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43397" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43397" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="timeSlot" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#f43397" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="opex" name="Operational Cost" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#costGrad)" />
                    <Area type="monotone" dataKey="netProfit" name="Net Operating Profit" stroke="#10b981" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Opex Cost Distribution Donut */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <PieIcon size={18} className="text-purple-600" />
                  Opex Cost Center Split
                </h3>
                <p className="text-xs text-gray-500">Distribution of warehouse operating expenditures</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={opexPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {opexPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {opexPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Granular Revenue & COGS Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue Ledger */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-green-600" />
                  <h4 className="font-bold text-sm text-gray-900">Revenue Ledger Breakdown</h4>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  Total ₹{pnlData.grossRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {[
                  { label: 'Order Fulfillment Fees', desc: 'Standard picking, barcode scanning & packing tariffs', val: pnlData.revenueBreakdown.orderFulfillmentFees, pct: ((pnlData.revenueBreakdown.orderFulfillmentFees / pnlData.grossRevenue) * 100).toFixed(1) },
                  { label: '3PL Surface & Air Shipping Income', desc: 'Freight collection & express linehaul markup', val: pnlData.revenueBreakdown.shipping3PLIncome, pct: ((pnlData.revenueBreakdown.shipping3PLIncome / pnlData.grossRevenue) * 100).toFixed(1) },
                  { label: 'Warehousing Pallet Storage Charges', desc: 'Pallet position tariffs & rack storage billing', val: pnlData.revenueBreakdown.warehousingStorageCharges, pct: ((pnlData.revenueBreakdown.warehousingStorageCharges / pnlData.grossRevenue) * 100).toFixed(1) },
                  { label: 'Packaging Materials & Box Fees', desc: 'Corrugated cartons, bubble wrap & polybag charges', val: pnlData.revenueBreakdown.packagingMaterialFees, pct: ((pnlData.revenueBreakdown.packagingMaterialFees / pnlData.grossRevenue) * 100).toFixed(1) },
                  { label: 'Reverse Logistics / Return Handling Fees', desc: 'RTO returns triage, restock & QC processing', val: pnlData.revenueBreakdown.returnHandlingFees, pct: ((pnlData.revenueBreakdown.returnHandlingFees / pnlData.grossRevenue) * 100).toFixed(1) }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{item.label}</p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-900 text-sm">₹{item.val.toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">{item.pct}% of Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct COGS & Operating Costs */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-blue-600" />
                  <h4 className="font-bold text-sm text-gray-900">Cost of Operations (COGS & Opex)</h4>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Total ₹{(pnlData.totalCOGS + pnlData.totalOpex).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {[
                  { label: 'Carrier Dispatch Freight (Delhivery/Xpressbees/Shadowfax)', category: 'Direct COGS', val: pnlData.cogsBreakdown.carrierDispatchFreight },
                  { label: 'Warehouse Labor & Overtime Wages (All Shifts)', category: 'Labor Opex', val: pnlData.opexBreakdown.warehouseLaborOvertime },
                  { label: 'Packaging Consumables (Tape, Cartons, Barcode Labels)', category: 'Direct COGS', val: pnlData.cogsBreakdown.packagingConsumables },
                  { label: 'Electricity Utilities & Diesel Genset Overhead', category: 'Utility Opex', val: pnlData.opexBreakdown.electricityUtilityOverheads },
                  { label: 'Conveyor Sorter & Dock Leveler AMC Maintenance', category: 'Maint Opex', val: pnlData.opexBreakdown.conveyorDockMaintenance },
                  { label: 'Canteen Staff Meal Subsidies (Shiv Shakti Caterers)', category: 'Staff Welfare', val: pnlData.opexBreakdown.canteenSubsidies },
                  { label: 'WMS Cloud Infrastructure & IoT Handheld SaaS', category: 'Tech Opex', val: pnlData.opexBreakdown.techCloudSaaS }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{item.label}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-900 text-sm">₹{item.val.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Per-Order Unit Economics Matrix Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Scale size={16} className="text-[#f43397]" />
                  Per-Order Unit Economics Matrix by SKU Category
                </h4>
                <p className="text-xs text-gray-500">Revenue vs. Fulfillment & Shipping cost breakdown per product line</p>
              </div>
              <span className="text-xs font-mono font-bold bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
                Avg Unit Margin: 37.4%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">SKU Code</th>
                    <th className="py-3 px-4 text-left">Product Name & Category</th>
                    <th className="py-3 px-4 text-right">Orders Fulfilled</th>
                    <th className="py-3 px-4 text-right">Selling Revenue</th>
                    <th className="py-3 px-4 text-right">Fulfillment Fee</th>
                    <th className="py-3 px-4 text-right">Carrier Shipping</th>
                    <th className="py-3 px-4 text-right">Net Profit</th>
                    <th className="py-3 px-4 text-center">Net Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pnlData.topSkuUnitEconomics.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-pink-600">{sku.sku}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{sku.name}</p>
                        <p className="text-[11px] text-gray-500">{sku.category}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-700">
                        {sku.ordersCount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        ₹{sku.sellingRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        ₹{sku.fulfillmentCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        ₹{sku.shippingCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-green-600">
                        ₹{sku.netProfit.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-green-50 text-green-700 border border-green-200">
                          {sku.marginPct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: COMPREHENSIVE GST & TAX COMPLIANCE BILLING */}
      {/* ======================================================== */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          
          {/* GST Overview Banner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Taxable Value</span>
              <div className="text-2xl font-black text-gray-900 mt-2">
                ₹{gstData.grossTaxableValue.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Period: <strong className="text-gray-800">{gstData.currentMonth}</strong></p>
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>GSTIN:</span>
                <strong className="font-mono text-gray-900">{gstData.gstin}</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Output GST Collected</span>
              <div className="text-2xl font-black text-blue-600 mt-2">
                ₹{gstData.outputGst.total.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>CGST: ₹{gstData.outputGst.cgst.toLocaleString('en-IN')}</span>
                <span>SGST: ₹{gstData.outputGst.sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>Interstate IGST (18%):</span>
                <strong className="text-gray-900">₹{gstData.outputGst.igst.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Tax Credit (ITC) Claimed</span>
              <div className="text-2xl font-black text-green-600 mt-2">
                ₹{gstData.inputTaxCredit.total.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-green-700 font-semibold mt-1">
                Matched 100% with GSTR-2B
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>Blocked ITC (Sec 17(5)):</span>
                <strong className="text-red-600">₹{gstData.inputTaxCredit.itcIneligibleBlocked.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-md">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Net Tax Payable (GSTR-3B)</span>
              <div className="text-2xl font-black text-pink-400 mt-2">
                ₹{gstData.netTaxPayable.total.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  gstData.netTaxPayable.isPaid
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {gstData.netTaxPayable.isPaid ? 'Challan Paid & Settled' : 'Challan PMT-06 Pending'}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-[11px] text-slate-300 flex justify-between">
                <span>Challan Ref:</span>
                <strong className="font-mono text-white">{gstData.netTaxPayable.challanRef || 'Pending'}</strong>
              </div>
            </div>

          </div>

          {/* Interstate vs Intrastate Tax Split Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Percent size={18} className="text-[#f43397]" />
                  Tax Split Matrix: Intrastate (CGST 9% + SGST 9%) vs Interstate (IGST 18%)
                </h3>
                <p className="text-xs text-gray-500">
                  Statutory GST computation on outward customer deliveries, warehousing storage & 3PL vendor invoices
                </p>
              </div>
              <button
                onClick={handleOpenNewInvoice}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <PlusCircle size={15} />
                Generate New B2B Invoice
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Central GST (CGST 9%)</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Output CGST:</span>
                  <span className="font-mono font-bold text-gray-900">₹{gstData.outputGst.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Less ITC CGST:</span>
                  <span className="font-mono font-bold text-green-600">-₹{gstData.inputTaxCredit.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Net CGST Payable:</span>
                  <span className="font-mono text-pink-600">₹{gstData.netTaxPayable.cgst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">State GST (SGST 9%)</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Output SGST:</span>
                  <span className="font-mono font-bold text-gray-900">₹{gstData.outputGst.sgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Less ITC SGST:</span>
                  <span className="font-mono font-bold text-green-600">-₹{gstData.inputTaxCredit.sgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Net SGST Payable:</span>
                  <span className="font-mono text-pink-600">₹{gstData.netTaxPayable.sgst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Integrated GST (IGST 18%)</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Output IGST:</span>
                  <span className="font-mono font-bold text-gray-900">₹{gstData.outputGst.igst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Less ITC IGST:</span>
                  <span className="font-mono font-bold text-green-600">-₹{gstData.inputTaxCredit.igst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Net IGST Payable:</span>
                  <span className="font-mono text-pink-600">₹{gstData.netTaxPayable.igst.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated B2B Tax Invoices List */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Receipt size={16} className="text-[#f43397]" />
                  Active B2B Tax Invoices & E-Invoice Repository
                </h4>
                <p className="text-xs text-gray-500">Valid HSN/SAC invoices generated for 3PL carriers and storage clients</p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded-full">
                {b2bInvoices.length} Registered Invoices
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Invoice No</th>
                    <th className="py-3 px-4 text-left">Billed Entity</th>
                    <th className="py-3 px-4 text-left">SAC / HSN Code</th>
                    <th className="py-3 px-4 text-left">Place of Supply</th>
                    <th className="py-3 px-4 text-right">Taxable Val</th>
                    <th className="py-3 px-4 text-right">Total GST</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {b2bInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{inv.buyerName}</p>
                        <p className="text-[11px] font-mono text-gray-500">{inv.buyerGstin}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-pink-600">{inv.sacCode}</td>
                      <td className="py-3 px-4 text-gray-700">{inv.placeOfSupply}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                        ₹{inv.taxableAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">
                        ₹{inv.totalTax?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-gray-900">
                        ₹{inv.grandTotal?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          {inv.status || 'IRN Authenticated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewInvoiceItem(inv)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 mx-auto transition-colors"
                        >
                          <Eye size={13} /> View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor & Canteen Inward GST Invoices & ITC Ledger */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  Vendor Invoices & Inward Input Tax Credit (ITC) Reconciler
                </h4>
                <p className="text-xs text-gray-500">Reconciled inward bills from 3PL linehauls, packaging, and canteen catering</p>
              </div>
              <span className="text-xs font-mono font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                GSTR-2B Auto Matched
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Vendor Name</th>
                    <th className="py-3 px-4 text-left">Vendor GSTIN</th>
                    <th className="py-3 px-4 text-left">Service Classification</th>
                    <th className="py-3 px-4 text-left">Invoice No</th>
                    <th className="py-3 px-4 text-right">Taxable Val</th>
                    <th className="py-3 px-4 text-right">Total GST</th>
                    <th className="py-3 px-4 text-center">ITC Eligibility</th>
                    <th className="py-3 px-4 text-center">3B Claim Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gstData.vendorInvoices.map((vinv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{vinv.vendorName}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{vinv.vendorGstin}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-pink-600">{vinv.sacHsnCode}</span>
                        <p className="text-[11px] text-gray-500">{vinv.category}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700">{vinv.invoiceNo}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                        ₹{vinv.taxableAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">
                        ₹{(vinv.totalAmount - vinv.taxableAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          vinv.itcEligibility === 'Eligible 100%'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {vinv.itcEligibility}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-semibold text-gray-600">
                          {vinv.itcClaimStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: INBOUND & OUTBOUND AUDIT SUB-REPORT */}
      {/* ======================================================== */}
      {activeTab === 'inboundAudit' && (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Shipments Audited</span>
              <div className="text-2xl font-black text-gray-900 mt-2">
                {inboundData.totalInboundShipments} Trucks
              </div>
              <p className="text-xs text-gray-500 mt-1">Accepted Goods: <strong>{inboundData.totalAcceptedQuantity.toLocaleString('en-IN')} units</strong></p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accepted Valuation</span>
              <div className="text-2xl font-black text-green-600 mt-2">
                ₹{(inboundData.acceptedGoodsValuation / 100000).toFixed(2)} Lakhs
              </div>
              <p className="text-xs text-green-700 font-semibold mt-1">Passed Level-3 QC Inspection</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Damaged Goods Discrepancy</span>
              <div className="text-2xl font-black text-red-600 mt-2">
                {inboundData.totalDamagedQuantity} Units
              </div>
              <p className="text-xs text-red-600 font-semibold mt-1">Valuation Loss: ₹{inboundData.damagedGoodsValuation.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dock Demurrage Penalties</span>
              <div className="text-2xl font-black text-amber-600 mt-2">
                ₹{inboundData.totalDemurrageCosts.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-amber-700 font-semibold mt-1">{inboundData.dockDetentionCases} vehicles exceeded 2-hr SLA</p>
            </div>
          </div>

          {/* Inbound Audit Items Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#f43397]" />
                  Inbound QC Variance & Dock Demurrage Audit Ledger
                </h4>
                <p className="text-xs text-gray-500">Cycle-counted vehicle receipts, physical damages, and detention penalties</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportGenericSubReportPDF(
                    'Inbound_Outbound_Audit_Report',
                    ['Shipment ID', 'Vehicle', 'Carrier', 'Dock', 'Manifest', 'Accepted', 'Damaged', 'Demurrage', 'QC Auditor', 'Status'],
                    inboundData.auditItems.map(i => [i.shipmentId, i.vehicleNo, i.carrier, i.dockBay, i.manifestQty, i.acceptedQty, i.damagedQty, `INR ${i.demurrageCharges}`, i.qcAuditor, i.status])
                  )}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportGenericSubReportCSV(
                    'Inbound_Outbound_Audit_Report',
                    ['Shipment ID', 'Vehicle', 'Carrier', 'Dock', 'Manifest', 'Accepted', 'Damaged', 'Demurrage', 'QC Auditor', 'Status'],
                    inboundData.auditItems.map(i => [i.shipmentId, i.vehicleNo, i.carrier, i.dockBay, i.manifestQty, i.acceptedQty, i.damagedQty, i.demurrageCharges, i.qcAuditor, i.status])
                  )}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Shipment & Vehicle</th>
                    <th className="py-3 px-4 text-left">Carrier & Dock</th>
                    <th className="py-3 px-4 text-right">Manifest Qty</th>
                    <th className="py-3 px-4 text-right">Accepted Qty</th>
                    <th className="py-3 px-4 text-right">Damaged Qty</th>
                    <th className="py-3 px-4 text-right">Dwell Time</th>
                    <th className="py-3 px-4 text-right">Demurrage Fee</th>
                    <th className="py-3 px-4 text-left">Auditor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inboundData.auditItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-gray-900">{item.shipmentId}</p>
                        <p className="text-[11px] font-mono text-gray-500">{item.vehicleNo}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-800">{item.carrier}</p>
                        <span className="text-[10px] font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.dockBay}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-gray-700">{item.manifestQty}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-green-600">{item.acceptedQty}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-600">{item.damagedQty}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">{item.dockDwellMinutes} mins</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        {item.demurrageCharges > 0 ? `₹${item.demurrageCharges.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{item.qcAuditor}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Verified Clear' ? 'bg-green-100 text-green-800 border border-green-200' :
                          item.status === 'Damage Claim Lodged' ? 'bg-red-100 text-red-800 border border-red-200' :
                          item.status === 'Demurrage Billed' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RTO & RETURN LOSS REPORT */}
      {/* ======================================================== */}
      {activeTab === 'rtoLeakage' && (
        <div className="space-y-6">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total RTO Returns Ingested</span>
              <div className="text-2xl font-black text-gray-900 mt-2">
                {rtoData.totalRtoReceived.toLocaleString('en-IN')} Units
              </div>
              <p className="text-xs text-gray-500 mt-1">Gross Return Value: <strong>₹{rtoData.totalRtoValue.toLocaleString('en-IN')}</strong></p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reverse Freight Cost Loss</span>
              <div className="text-2xl font-black text-red-600 mt-2">
                ₹{rtoData.reverseLogisticsFreightCost.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-red-700 font-semibold mt-1">Unrecoverable forward+reverse shipping</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Liquidation Recovery</span>
              <div className="text-2xl font-black text-green-600 mt-2">
                ₹{rtoData.liquidationScrapRecovery.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-green-700 font-semibold mt-1">Refurbished & vendor scrap liquidation</p>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Net Return Financial Leakage</span>
              <div className="text-2xl font-black text-pink-400 mt-2">
                ₹{rtoData.netReturnFinancialLeakage.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-300 mt-1">SLA Penalties Deducted: <strong className="text-white">₹{rtoData.carrierSlaPenaltiesDeducted.toLocaleString('en-IN')}</strong></p>
            </div>
          </div>

          {/* RTO Root Cause Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <ArrowDownRight size={16} className="text-[#f43397]" />
                  Return Reasons & Financial Leakage Breakdown
                </h4>
                <p className="text-xs text-gray-500">Root-cause financial impact analysis and recovery triage</p>
              </div>
              <button
                onClick={() => exportGenericSubReportPDF(
                  'RTO_Financial_Leakage_Report',
                  ['Return Reason', 'Return Count', 'Gross Value', 'Freight Lost', 'Recovery Value', 'Net Loss', '% Total'],
                  rtoData.rtoCategoryBreakdown.map(r => [r.reason, r.count, `INR ${r.grossValue}`, `INR ${r.freightLost}`, `INR ${r.recoveryValue}`, `INR ${r.netLoss}`, `${r.pctOfTotal}%`])
                )}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Export PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Return Reason Code</th>
                    <th className="py-3 px-4 text-right">Units Returned</th>
                    <th className="py-3 px-4 text-right">Gross GMV Value</th>
                    <th className="py-3 px-4 text-right">Freight Lost</th>
                    <th className="py-3 px-4 text-right">Scrap Recovery</th>
                    <th className="py-3 px-4 text-right">Net Financial Leakage</th>
                    <th className="py-3 px-4 text-center">% of Total Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rtoData.rtoCategoryBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{item.reason}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-gray-700">{item.count}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">₹{item.grossValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-600">₹{item.freightLost.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-green-600">₹{item.recoveryValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-700">₹{item.netLoss.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
                          {item.pctOfTotal}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carrier SLA Performance & Penalty Deductions */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Truck size={16} className="text-blue-600" />
                  3PL Carrier SLA Delivery Compliance & Penalties Deducted
                </h4>
                <p className="text-xs text-gray-500">Transit damages & delivery breach penalties adjusted from courier payouts</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Carrier Name</th>
                    <th className="py-3 px-4 text-right">RTO Shipments Handled</th>
                    <th className="py-3 px-4 text-right">On-Time Delivery SLA</th>
                    <th className="py-3 px-4 text-right">In-Transit Damage Rate</th>
                    <th className="py-3 px-4 text-right">SLA Penalties Deducted</th>
                    <th className="py-3 px-4 text-center">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rtoData.carrierPerformanceSla.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{c.carrier}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-gray-700">{c.rtoDeliveries}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">{c.onTimePct}%</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-600">{c.damagedInTransitPct}%</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                        ₹{c.slaPenaltyAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Compliant' ? 'bg-green-100 text-green-800' :
                          c.status === 'Warning' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CANTEEN & MEAL EXPENSE REPORT */}
      {/* ======================================================== */}
      {activeTab === 'canteen' && (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Meals & Snacks Served</span>
              <div className="text-2xl font-black text-gray-900 mt-2">
                {canteenData.totalMealsServed.toLocaleString('en-IN')} Plates
              </div>
              <p className="text-xs text-gray-500 mt-1">Vendor: <strong className="text-gray-800">{canteenData.vendorName}</strong></p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Gross Meal Value</span>
              <div className="text-2xl font-black text-blue-600 mt-2">
                ₹{canteenData.totalGrossCost.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-blue-700 font-semibold mt-1">Vendor Invoice GST (5%): ₹{canteenData.vendorGstPaid.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Subsidy Borne (80%)</span>
              <div className="text-2xl font-black text-pink-600 mt-2">
                ₹{canteenData.companySubsidyPaid.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-pink-700 font-semibold mt-1">Subsidized ₹52 per grand buffet meal</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Payroll Deduction (20%)</span>
              <div className="text-2xl font-black text-green-600 mt-2">
                ₹{canteenData.employeePayrollDeducted.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-green-700 font-semibold mt-1">Auto-deducted from monthly salary slip</p>
            </div>
          </div>

          {/* Shift-wise Meal Cost Distribution */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <UtensilsCrossed size={16} className="text-[#f43397]" />
                  Shift-Wise Meal Consumption & Subsidy Allocation Ledger
                </h4>
                <p className="text-xs text-gray-500">Distribution across Morning (Shift A), Evening (Shift B) & Night (Shift C)</p>
              </div>
              <button
                onClick={() => exportGenericSubReportPDF(
                  'Canteen_Meal_Subsidy_Report',
                  ['Shift Name', 'Hours', 'Veg Plates', 'Non-Veg Plates', 'Tea/Snacks', 'Gross Cost', 'Company Subsidy (80%)', 'Employee Pay (20%)'],
                  canteenData.shiftWiseExpenses.map(s => [s.shift, s.hours, s.vegMeals, s.nonVegMeals, s.teaSnacks, `INR ${s.grossCost}`, `INR ${s.companySubsidy}`, `INR ${s.employeePay}`])
                )}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Export PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Shift</th>
                    <th className="py-3 px-4 text-left">Operating Hours</th>
                    <th className="py-3 px-4 text-right">Veg Meals</th>
                    <th className="py-3 px-4 text-right">Non-Veg Meals</th>
                    <th className="py-3 px-4 text-right">Tea / Snacks</th>
                    <th className="py-3 px-4 text-right">Total Plates</th>
                    <th className="py-3 px-4 text-right">Gross Cost</th>
                    <th className="py-3 px-4 text-right">Company Subsidy</th>
                    <th className="py-3 px-4 text-right">Employee Deduct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {canteenData.shiftWiseExpenses.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{s.shift}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{s.hours}</td>
                      <td className="py-3 px-4 text-right font-mono text-green-700 font-semibold">{s.vegMeals}</td>
                      <td className="py-3 px-4 text-right font-mono text-orange-700 font-semibold">{s.nonVegMeals}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">{s.teaSnacks}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">{s.totalPlates}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">₹{s.grossCost.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-pink-600">₹{s.companySubsidy.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">₹{s.employeePay.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Meal Slot Reconciliation Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Receipt size={16} className="text-green-600" />
                  Meal Voucher Issuance vs. Redemption Reconciliation
                </h4>
                <p className="text-xs text-gray-500">Audit of smart card and QR voucher redemptions at turnstile scanner</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Meal Slot</th>
                    <th className="py-3 px-4 text-right">Tariff / Plate</th>
                    <th className="py-3 px-4 text-right">Company Subsidy</th>
                    <th className="py-3 px-4 text-right">Employee Share</th>
                    <th className="py-3 px-4 text-right">Vouchers Issued</th>
                    <th className="py-3 px-4 text-right">Redeemed</th>
                    <th className="py-3 px-4 text-center">Redemption %</th>
                    <th className="py-3 px-4 text-right">Reconciled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {canteenData.mealSlotReconciliation.map((slot, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{slot.slot}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-gray-800">₹{slot.ratePerPlate}</td>
                      <td className="py-3 px-4 text-right font-mono text-pink-600 font-semibold">₹{slot.companySubsidyPerPlate}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">₹{slot.empPayPerPlate}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">{slot.vouchersIssued}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-green-700">{slot.vouchersRedeemed}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-green-50 text-green-800 border border-green-200">
                          {slot.redemptionRatePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-gray-900">
                        ₹{slot.reconciledCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: LEGACY / STANDARD WAREHOUSE EXPORTS */}
      {/* ======================================================== */}
      {activeTab === 'allExports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Automated Daily Stock Reconciliation',
              desc: 'EOD physical stock vs system ledger reconciliation with variance audit and sign-off.',
              headers: ['Category', 'Opening Stock', 'Inbound', 'Outbound', 'Closing Count', 'Variance', 'Status'],
              data: [
                ['Apparel & Ethnic', '45,000', '12,500', '11,200', '46,300', '0', 'Reconciled OK'],
                ['Electronics & Gadgets', '12,400', '3,200', '3,100', '12,490', '-10', 'Investigated'],
                ['Home & Kitchen', '18,900', '4,500', '4,200', '19,200', '0', 'Reconciled OK'],
                ['Beauty & Personal Care', '28,100', '8,100', '7,900', '28,300', '0', 'Reconciled OK'],
              ]
            },
            {
              title: 'Daily Shift Attendance & Overtime Ledger',
              desc: 'Log of clocked hours, biometric time stamps, night allowances, and overtime payouts.',
              headers: ['Emp ID', 'Name', 'Shift', 'Clock In', 'Clock Out', 'Hours', 'Payout (INR)'],
              data: [
                ['EMP-1002', 'Ravi Kumar', 'Morning', '06:00 AM', '02:00 PM', '8', '800'],
                ['EMP-1045', 'Sunita Devi', 'Morning', '06:15 AM', '02:00 PM', '7.75', '775'],
                ['EMP-1088', 'Amit Singh', 'Evening', '02:00 PM', '10:00 PM', '8', '850'],
                ['EMP-1092', 'Priya Sharma', 'Night', '10:00 PM', '06:00 AM', '8', '950 (Night Premium)'],
              ]
            }
          ].map((rep, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-base text-gray-900">{rep.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{rep.desc}</p>
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => exportGenericSubReportPDF(rep.title, rep.headers, rep.data)}
                  className="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileOutput size={15} className="text-red-500" /> Export PDF
                </button>
                <button
                  onClick={() => exportGenericSubReportCSV(rep.title, rep.headers, rep.data)}
                  className="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet size={15} className="text-green-600" /> Export CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GST Invoice Generation & Preview Modal */}
      <GstInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        onSaveNew={handleSaveNewInvoice}
      />

    </div>
  );
}

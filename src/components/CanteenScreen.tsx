import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { 
  Utensils, 
  Coffee, 
  QrCode, 
  BarChart3, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Download, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  RefreshCw, 
  Check, 
  X, 
  Flame, 
  Leaf, 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  Scan, 
  Calendar, 
  Coins, 
  PieChart, 
  Layers, 
  Soup, 
  BadgeCheck, 
  Volume2, 
  DollarSign, 
  CheckCircle,
  HelpCircle,
  Percent,
  ChefHat,
  Sprout,
  Zap,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Legend, Cell, PieChart as RechartsPie, Pie 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchApi } from '../lib/api.ts';
import { useMaintenance } from '../lib/maintenance';
import { MeeshoLogo } from './MeeshoLogo';
import { CanteenBulkPreOrderTab } from './CanteenBulkPreOrderTab';

// Mock list of 40 staff for the quick picker dropdown (out of 400)
const SAMPLE_EMPLOYEES = [
  { empId: 'MSH-EMP-001', name: 'Aarav Kumar', department: 'Inbound Receiving', shift: 'Morning A', phone: '+91 98765 43210', photo: '👨‍💼' },
  { empId: 'MSH-EMP-002', name: 'Vivaan Sharma', department: 'Wave Picking', shift: 'Morning A', phone: '+91 98765 43211', photo: '🧑‍🔧' },
  { empId: 'MSH-EMP-003', name: 'Aditya Singh', department: 'Packing & QC', shift: 'Morning A', phone: '+91 98765 43212', photo: '👨‍🏭' },
  { empId: 'MSH-EMP-004', name: 'Vihaan Verma', department: 'Dock Logistics', shift: 'Morning A', phone: '+91 98765 43213', photo: '👨‍💻' },
  { empId: 'MSH-EMP-005', name: 'Arjun Gupta', department: 'Packing & QC', shift: 'Morning A', phone: '+91 98765 43214', photo: '🧑‍💼' },
  { empId: 'MSH-EMP-006', name: 'Sai Yadav', department: 'Wave Picking', shift: 'Evening B', phone: '+91 98765 43215', photo: '👨‍🔧' },
  { empId: 'MSH-EMP-007', name: 'Reyansh Malik', department: 'Inbound Receiving', shift: 'Evening B', phone: '+91 98765 43216', photo: '👨‍🏭' },
  { empId: 'MSH-EMP-008', name: 'Ayaan Chauhan', department: 'Dock Logistics', shift: 'Evening B', phone: '+91 98765 43217', photo: '👨‍💼' },
  { empId: 'MSH-EMP-009', name: 'Krishna Saini', department: 'Returns & RTO', shift: 'Evening B', phone: '+91 98765 43218', photo: '🧑‍💻' },
  { empId: 'MSH-EMP-010', name: 'Ishaan Reddy', department: 'Security & Facility', shift: 'Night C', phone: '+91 98765 43219', photo: '👮‍♂️' },
  { empId: 'MSH-EMP-011', name: 'Sunita Patel', department: 'Wave Picking', shift: 'Morning A', phone: '+91 98765 43220', photo: '👩‍🔧' },
  { empId: 'MSH-EMP-012', name: 'Priya Reddy', department: 'Dock Logistics', shift: 'Morning A', phone: '+91 98765 43221', photo: '👩‍💼' },
  { empId: 'MSH-EMP-013', name: 'Ananya Joshi', department: 'Packing & QC', shift: 'Morning A', phone: '+91 98765 43222', photo: '👩‍🏭' },
  { empId: 'MSH-EMP-014', name: 'Diya Tiwari', department: 'Inbound Receiving', shift: 'Evening B', phone: '+91 98765 43223', photo: '👩‍💼' },
  { empId: 'MSH-EMP-015', name: 'Kavita Desai', department: 'Wave Picking', shift: 'Evening B', phone: '+91 98765 43224', photo: '👩‍🔧' },
  { empId: 'MSH-EMP-016', name: 'Neha Rao', department: 'Returns & RTO', shift: 'Evening B', phone: '+91 98765 43225', photo: '👩‍💻' },
  { empId: 'MSH-EMP-017', name: 'Pooja Kumar', department: 'Packing & QC', shift: 'Night C', phone: '+91 98765 43226', photo: '👩‍🏭' },
  { empId: 'MSH-EMP-018', name: 'Sneha Sharma', department: 'Inbound Receiving', shift: 'Night C', phone: '+91 98765 43227', photo: '👩‍💼' },
  { empId: 'MSH-EMP-019', name: 'Ritu Singh', department: 'Wave Picking', shift: 'Morning A', phone: '+91 98765 43228', photo: '👩‍🔧' },
  { empId: 'MSH-EMP-020', name: 'Anita Verma', department: 'Security & Facility', shift: 'Morning A', phone: '+91 98765 43229', photo: '👮‍♀️' }
];

export function CanteenScreen() {
  const { isMaintenance, checkAndBlockAction } = useMaintenance();
  const [activeTab, setActiveTab] = useState<'schedule' | 'bulk-order' | 'vouchers' | 'analytics' | 'billing'>('schedule');
  
  // Data States
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [vouchersData, setVouchersData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Daily Menu Dietary Filter State
  const [menuDietFilter, setMenuDietFilter] = useState<'All' | 'Vegetarian' | 'Vegan' | 'Jain'>('All');

  // Voucher Generator Form States
  const [selectedEmp, setSelectedEmp] = useState(SAMPLE_EMPLOYEES[0]);
  const [empSearch, setEmpSearch] = useState('');
  const [selectedMealSlot, setSelectedMealSlot] = useState('lunch');
  const [selectedDiet, setSelectedDiet] = useState<'Pure Veg' | 'Non-Veg' | 'Jain'>('Pure Veg');
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<any>(null);

  // Voucher Redemption Terminal States
  const [redeemInput, setRedeemInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<{ success: boolean; message: string; voucher?: any } | null>(null);

  // Voucher Table Filters
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherFilterStatus, setVoucherFilterStatus] = useState('All');
  const [voucherFilterMeal, setVoucherFilterMeal] = useState('All');

  // Sign-off Modal
  const [isSignOffOpen, setIsSignOffOpen] = useState(false);
  const [managerSignName, setManagerSignName] = useState('Vivek Deshmukh (AVP Operations)');
  const [signRemarks, setSignRemarks] = useState('Biometric attendance cross-referenced. Discrepancies and late penalty applied as per SLA.');
  const [isSigning, setIsSigning] = useState(false);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Scheduled Site Maintenance Banner State
  const [showMaintenanceNotice, setShowMaintenanceNotice] = useState(true);
  const [expandMaintenanceReason, setExpandMaintenanceReason] = useState(true);

  // 10-Minute Auto-Influx Engine States
  const [autoInfluxCountdown, setAutoInfluxCountdown] = useState(600); // 10 mins (600s)
  const [isSimulatingInflux, setIsSimulatingInflux] = useState(false);
  const [influxStats, setInfluxStats] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleTriggerAutoInflux = async () => {
    try {
      setIsSimulatingInflux(true);
      const res = await fetchApi('/canteen/auto-influx', { method: 'POST' });
      if (res && res.success) {
        setInfluxStats(res.result);
        setAutoInfluxCountdown(600);
        showToast(`⚡ 10-Min Influx Active! Added ${res.result?.totalEntriesAdded || 25} new entries across Vouchers, Supervisor Bulk Pre-Orders, Redemptions & Roster!`);
        await loadAllCanteenData();
      }
    } catch (err: any) {
      console.error('Failed to trigger auto-influx:', err);
    } finally {
      setIsSimulatingInflux(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAutoInfluxCountdown(prev => {
        if (prev <= 1) {
          loadAllCanteenData();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadAllCanteenData = async () => {
    try {
      setRefreshing(true);
      const [schedRes, vchRes, anaRes, billRes, fcRes] = await Promise.all([
        fetchApi('/canteen/schedule'),
        fetchApi('/canteen/vouchers'),
        fetchApi('/canteen/analytics'),
        fetchApi('/canteen/billing'),
        fetchApi('/canteen/forecast')
      ]);

      if (schedRes && schedRes.slots) setScheduleData(schedRes);
      if (vchRes && vchRes.vouchers) setVouchersData(vchRes.vouchers);
      if (anaRes && anaRes.kpis) setAnalyticsData(anaRes);
      if (billRes && billRes.data) setBillingData(billRes.data);
      if (fcRes && fcRes.forecast) setForecastData(fcRes.forecast);
    } catch (err) {
      console.error('Error fetching canteen data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBulkOrderSuccess = (batch: any, vouchers: any[], updatedForecast: any) => {
    if (vouchers && vouchers.length > 0) {
      setVouchersData(prev => [...vouchers, ...prev]);
    }
    if (updatedForecast) {
      setForecastData(updatedForecast);
    }
    // Increment issued count in local analytics KPI
    if (analyticsData?.kpis) {
      setAnalyticsData((prev: any) => ({
        ...prev,
        kpis: {
          ...prev.kpis,
          totalVouchersIssued: (prev.kpis?.totalVouchersIssued || 0) + (vouchers?.length || 0)
        }
      }));
    }
  };

  useEffect(() => {
    loadAllCanteenData();
  }, []);

  // Filtered employees for dropdown
  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return SAMPLE_EMPLOYEES;
    const q = empSearch.toLowerCase();
    return SAMPLE_EMPLOYEES.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.empId.toLowerCase().includes(q) || 
      e.department.toLowerCase().includes(q)
    );
  }, [empSearch]);

  // Filtered vouchers for table
  const filteredVouchers = useMemo(() => {
    return vouchersData.filter(v => {
      const matchesSearch = !voucherSearch.trim() || 
        v.empName.toLowerCase().includes(voucherSearch.toLowerCase()) || 
        v.empId.toLowerCase().includes(voucherSearch.toLowerCase()) || 
        v.voucherCode.toLowerCase().includes(voucherSearch.toLowerCase());
      
      const matchesStatus = voucherFilterStatus === 'All' || v.status === voucherFilterStatus;
      const matchesMeal = voucherFilterMeal === 'All' || v.mealSlot === voucherFilterMeal;

      return matchesSearch && matchesStatus && matchesMeal;
    });
  }, [vouchersData, voucherSearch, voucherFilterStatus, voucherFilterMeal]);

  // Handle Voucher Generation
  const handleGenerateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAndBlockAction("Meal Voucher Generation")) return;

    setIsGeneratingVoucher(true);
    try {
      const res = await fetchApi('/canteen/vouchers/generate', {
        method: 'POST',
        body: JSON.stringify({
          empId: selectedEmp.empId,
          empName: selectedEmp.name,
          department: selectedEmp.department,
          shift: selectedEmp.shift,
          mealSlot: selectedMealSlot,
          dietaryType: selectedDiet
        })
      });

      if (res && res.voucher) {
        setGeneratedVoucher(res.voucher);
        setVouchersData(prev => [res.voucher, ...prev]);
        showToast(`✅ Meal Voucher ${res.voucher.voucherCode} generated for ${res.voucher.empName}!`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate voucher');
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  // Handle Voucher Redemption
  const handleRedeemVoucher = async (codeToRedeem?: string) => {
    if (checkAndBlockAction("Voucher Plate Redemption")) return;

    const code = codeToRedeem || redeemInput;
    if (!code.trim()) return;

    setIsRedeeming(true);
    setRedemptionResult(null);

    try {
      const res = await fetchApi('/canteen/vouchers/redeem', {
        method: 'POST',
        body: JSON.stringify({
          voucherCode: code.trim(),
          qrPayload: code.trim(),
          counterName: 'Counter 1 (Main Buffet Scanner)'
        })
      });

      if (res && res.success) {
        setRedemptionResult({
          success: true,
          message: res.message,
          voucher: res.voucher
        });
        // Update local vouchers list
        setVouchersData(prev => prev.map(v => v.voucherCode === res.voucher.voucherCode ? res.voucher : v));
        setRedeemInput('');
        showToast(`✅ Entitlement Redeemed: ${res.voucher.empName} - ${res.voucher.mealName}`);
      }
    } catch (err: any) {
      setRedemptionResult({
        success: false,
        message: err.message || 'Failed to redeem voucher.'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Handle Sign-off on Vendor Reconciliation
  const handleSignOff = async () => {
    if (checkAndBlockAction("Vendor Billing Sign-Off")) return;
    setIsSigning(true);
    try {
      const res = await fetchApi('/canteen/billing/signoff', {
        method: 'POST',
        body: JSON.stringify({
          managerId: managerSignName,
          remarks: signRemarks
        })
      });

      if (res && res.success) {
        setBillingData(res.data);
        setIsSignOffOpen(false);
        showToast("✅ Monthly Canteen Reconciliation signed off & sent to Finance Banking!");
      }
    } catch (err: any) {
      alert(err.message || 'Failed to sign off');
    } finally {
      setIsSigning(false);
    }
  };

  // Export Monthly Reconciliation PDF
  const handleDownloadBillingPdf = () => {
    if (!billingData) return;
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(244, 51, 151); // Meesho Pink
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MEESHO FULFILLMENT CENTER - CANTEEN BILLING RECONCILIATION', 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('HUB 04 | FSSAI LIC: 11223999000142 | MONTH: AUGUST 2026', 14, 19);

    // Vendor Profile & Summary
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Catering Vendor Profile & Contract Terms', 14, 32);

    autoTable(doc, {
      startY: 36,
      head: [['Vendor Name', 'GSTIN', 'Contract Ref', 'Billing Cycle', 'Total Plates Served']],
      body: [[
        billingData.vendor.name,
        billingData.vendor.gstin,
        billingData.vendor.contractRef,
        billingData.month,
        billingData.stats.totalPlatesSum.toLocaleString() + ' Plates'
      ]],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8 }
    });

    // Financial Reconciliation Summary
    const finalY1 = (doc as any).lastAutoTable.finalY || 55;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Financial Reconciliation & Subsidy Allocation', 14, finalY1 + 10);

    const finRows = [
      ['Gross Vendor Invoiced Amount', `INR ${billingData.stats.grossVendorClaim.toLocaleString()}`],
      ['Biometric Verified Plate Amount', `INR ${billingData.stats.verifiedReconciledAmount.toLocaleString()}`],
      ['Unverified Plates Discrepancy Deduction', `- INR ${billingData.stats.discrepancyUnverifiedPlatesCost.toLocaleString()}`],
      ['SLA & Quality Complaint Penalties', `- INR ${billingData.stats.penaltiesDeduction.toLocaleString()}`],
      ['Net Taxable Base Amount', `INR ${billingData.stats.netPayableBeforeGst.toLocaleString()}`],
      ['5% Catering GST (ITC Eligible)', `INR ${billingData.stats.gstAmount.toLocaleString()}`],
      ['TOTAL NET PAYABLE INVOICE', `INR ${billingData.stats.totalInvoicePayable.toLocaleString()}`],
      ['Company Contribution (80% Subsidy)', `INR ${billingData.stats.subsidySplit.companyContribution80.toLocaleString()}`],
      ['Employee Payroll Deductions (20%)', `INR ${billingData.stats.subsidySplit.employeePayrollDeduction20.toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: finalY1 + 14,
      head: [['Reconciliation Item Description', 'Amount (INR)']],
      body: finRows,
      theme: 'striped',
      headStyles: { fillColor: [244, 51, 151], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 }
    });

    // Daily Consumption Sample Table
    const finalY2 = (doc as any).lastAutoTable.finalY || 130;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Daily Meal Consumption Audit Ledger (1st - 20th August 2026)', 14, finalY2 + 10);

    const dailyRows = (billingData.dailyLedger || []).map((d: any) => [
      d.date,
      d.breakfast,
      d.lunch,
      d.highTea,
      d.dinner,
      d.totalPlates,
      d.discrepancyCount > 0 ? `-${d.discrepancyCount}` : 'Matched',
      d.penaltyDeduction > 0 ? `-₹${d.penaltyDeduction}` : '₹0',
      `₹${d.netPayable.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: finalY2 + 14,
      head: [['Date', 'BF (₹35)', 'Lunch (₹65)', 'Tea (₹20)', 'Dinner (₹65)', 'Total Plates', 'Discrepancy', 'Penalty', 'Net Payable']],
      body: dailyRows,
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontSize: 7.5 },
      styles: { fontSize: 7 }
    });

    // Signatures
    const finalY3 = (doc as any).lastAutoTable.finalY || 240;
    if (finalY3 < 260) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Reconciliation Sign-Off: ${billingData.stats.auditStatus}`, 14, finalY3 + 12);
      doc.text(`Authorized by: ${billingData.stats.signOffManager} | Date: ${new Date(billingData.stats.signOffDate).toLocaleDateString()}`, 14, finalY3 + 17);
      doc.text('Audited via Meesho Automated Canteen Management System', 14, finalY3 + 22);
    }

    doc.save(`Meesho-FC04-Canteen-Reconciliation-${billingData.month.replace(' ', '-')}.pdf`);
    showToast("📄 Monthly Canteen Reconciliation PDF downloaded!");
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!billingData || !billingData.dailyLedger) return;
    let csv = 'Date,Day,Breakfast_Plates,Lunch_Plates,HighTea_Plates,Dinner_Plates,Midnight_Plates,Total_Plates,Biometric_Matched,Discrepancies,Penalty_INR,Penalty_Reason,Gross_Amount,Net_Payable,Status\n';
    
    billingData.dailyLedger.forEach((d: any) => {
      csv += `${d.date},${d.dayNumber},${d.breakfast},${d.lunch},${d.highTea},${d.dinner},${d.midnight},${d.totalPlates},${d.biometricHeadcountMatched},${d.discrepancyCount},${d.penaltyDeduction},"${d.penaltyReason}",${d.grossAmount},${d.netPayable},${d.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Meesho-Canteen-Ledger-${billingData.month.replace(' ', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📊 Canteen Consumption CSV exported successfully!");
  };

  // Print voucher
  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <Sparkles className="text-pink-400" size={20} />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* SCHEDULED SITE MAINTENANCE ALERT NOTICE */}
      {showMaintenanceNotice && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-3">
          <div className="absolute top-0 right-0 w-80 h-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0 mt-0.5 animate-bounce">
                <Wrench size={24} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-0.5 bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>SCHEDULED SITE MAINTENANCE</span>
                  </span>
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                    WINDOW: TODAY, 11:30 PM – 01:30 AM IST (2 HRS)
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md border border-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Systems Operational (Pre-Window)</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-amber-950">
                  System Maintenance Scheduled for Infrastructure & Database Upgrades
                </h3>

                <p className="text-xs text-amber-900 leading-relaxed font-medium max-w-4xl">
                  <strong>Reason for Maintenance:</strong> Scheduled hardware servicing, thermal POS barcode printer firmware updates, gate biometric controller sync optimization, and database index defragmentation in preparation for the upcoming <strong>Festival Peak Order Surge & High-Concurrency Shift Traffic</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
              <button
                type="button"
                onClick={() => setExpandMaintenanceReason(!expandMaintenanceReason)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Clock size={13} className="text-amber-700" />
                <span>{expandMaintenanceReason ? 'Hide Impact Details' : 'View Impact & Reason'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMaintenanceNotice(false);
                  showToast('Acknowledged Maintenance Notice.');
                }}
                className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 rounded-lg transition-all cursor-pointer"
                title="Dismiss Notice"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Expanded Maintenance Breakdown & Contingency Plan */}
          {expandMaintenanceReason && (
            <div className="mt-4 pt-4 border-t border-amber-300/50 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Key Reason & Upgrades</span>
                </div>
                <p className="text-amber-900 text-[11px] leading-snug">
                  Upgrading database index trees and thermal printing queues to boost voucher generation capacity from 5,000 to 25,000 tokens/hr.
                </p>
              </div>

              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Wrench size={14} className="text-amber-600" />
                  <span>Impacted Modules</span>
                </div>
                <ul className="text-amber-900 text-[11px] space-y-0.5 list-disc list-inside">
                  <li>POS Counter Scanners (11:30 PM - 01:30 AM)</li>
                  <li>Live Biometric Gate Sync (Batch re-synced at 01:30 AM)</li>
                </ul>
              </div>

              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Contingency & Action</span>
                </div>
                <p className="text-amber-900 text-[11px] leading-snug">
                  Physical printed passes & manual Desk 01 backup active. Pre-orders placed before 11:00 PM will be auto-dispatched.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-pink-50/80 via-pink-50/30 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="p-2 bg-pink-100 text-[#f43397] rounded-xl flex items-center justify-center shadow-inner">
                <Utensils size={24} />
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Smart Canteen & Meal Management
              </h1>
              <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 font-bold rounded-full border border-green-200 flex items-center gap-1">
                <BadgeCheck size={14} className="text-green-600" />
                FSSAI Lic: #11223999000142 (Grade A+)
              </span>
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full border border-blue-200 flex items-center gap-1">
                <Building2 size={13} />
                Hub 04 (Delhi NCR FC)
              </span>
            </div>
            <p className="text-sm text-gray-600 max-w-3xl">
              Daily live meal schedules, dynamic QR-based meal vouchers with instant entitlement validation, 
              headcount vs. consumption analytics, and monthly caterer billing reconciliation.
            </p>
          </div>

          {/* Real-time Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-right">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dining Hall Occupancy</p>
              <p className="text-lg font-black text-gray-900 flex items-center justify-end gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>142 / 200 Seats</span>
                <span className="text-xs text-emerald-600 font-bold">(71%)</span>
              </p>
            </div>

            <button 
              onClick={loadAllCanteenData}
              disabled={refreshing}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
              title="Refresh Canteen Data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#f43397]' : ''} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
          </div>
        </div>

        {/* 10-Minute Auto-Influx Engine Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shrink-0">
              <Zap size={22} className="animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white">10-Minute Auto-Influx Engine Active</h3>
                <span className="text-[10px] px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-extrabold rounded-full flex items-center gap-1.5">
                  <RefreshCw size={11} className="animate-spin text-amber-300" />
                  <span>20 to 30 New Entries Every 10 Mins</span>
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Automatically feeds 20-30 new records across <strong>all canteen options</strong> (Meal Vouchers, Supervisor Bulk Pre-Orders, Counter Redemptions, Gate Roster, & Billing).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Next Auto Influx</p>
              <p className="text-sm font-mono font-black text-amber-400">
                {String(Math.floor(autoInfluxCountdown / 60)).padStart(2, '0')}:{String(autoInfluxCountdown % 60).padStart(2, '0')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerAutoInflux}
              disabled={isSimulatingInflux}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Zap size={15} className={isSimulatingInflux ? 'animate-bounce text-amber-300' : 'text-amber-300'} />
              <span>{isSimulatingInflux ? 'Simulating Influx...' : 'Simulate 10-Min Influx (+20-30 Entries)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4 mt-5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-[#f43397] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChefHat size={18} />
            <span>Daily Meal Schedule</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'schedule' ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#f43397]'}`}>
              5 Slots
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bulk-order')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'bulk-order'
                ? 'bg-[#f43397] text-white shadow-md shadow-pink-200'
                : 'text-gray-700 bg-pink-50/70 hover:bg-pink-100 border border-pink-200/60'
            }`}
          >
            <Users size={18} className={activeTab === 'bulk-order' ? 'text-white' : 'text-[#f43397]'} />
            <span className="font-extrabold">Supervisor Bulk Pre-order</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${activeTab === 'bulk-order' ? 'bg-white/20 text-white' : 'bg-pink-200 text-pink-900'}`}>
              <Sparkles size={11} />
              Roster Sync
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'vouchers'
                ? 'bg-[#f43397] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <QrCode size={18} />
            <span>Individual Voucher & Scanner</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'vouchers' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
              Pass Terminal
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#f43397] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={18} />
            <span>Headcount vs. Consumption</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'analytics' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              91.6% Uptake
            </span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'billing'
                ? 'bg-[#f43397] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Receipt size={18} />
            <span>Vendor Billing Reconciliation</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'billing' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
              ₹15.2L Reconciled
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY MEAL SCHEDULE                                                */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Live Kitchen Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <ChefHat size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Active Service</p>
                <p className="text-base font-black text-gray-900">Grand Buffet Lunch</p>
                <p className="text-[11px] text-emerald-600 font-bold">Serving Now (12:30 - 14:45)</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Next Service</p>
                <p className="text-base font-black text-gray-900">Evening High Tea</p>
                <p className="text-[11px] text-amber-700 font-bold">Starts in 01h 44m (16:30 IST)</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Hygiene Audit Score</p>
                <p className="text-base font-black text-gray-900">99.8% Passed</p>
                <p className="text-[11px] text-blue-600 font-bold">Steam Sanitized Counters</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Approved Vendor</p>
                <p className="text-base font-black text-gray-900">Annapurna Caterers</p>
                <p className="text-[11px] text-purple-600 font-bold">Contract SLA: 98.8%</p>
              </div>
            </div>
          </div>

          {/* Meal Slot Cards */}
          <div className="space-y-4">
            {/* Shift Supervisor Bulk Pre-order Callout Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-gray-900 rounded-2xl p-5 text-white border border-pink-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Shift Supervisor Bulk Pre-Order Hub
                    <span className="text-[10px] px-2 py-0.5 bg-pink-500 text-white font-bold rounded-full">
                      New Feature
                    </span>
                  </h3>
                  <p className="text-xs text-gray-300">
                    Pre-reserve buffet meals & high tea for your entire shift roster. Automatically syncs kitchen headcount demand & prep kg.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('bulk-order')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#f43397] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md shadow-pink-500/20 shrink-0 self-start md:self-auto cursor-pointer"
              >
                <span>Launch Team Bulk Pre-Order</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>Today's Daily Meal Timetable & Menu</span>
                  <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-md">
                    August 20, 2026
                  </span>
                </h2>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">All meals 80% subsidized for Meesho warehouse associates</p>
              </div>

              {/* Dietary Filter Toggles Bar */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/80 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setMenuDietFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    menuDietFilter === 'All'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Utensils size={13} className={menuDietFilter === 'All' ? 'text-[#f43397]' : 'text-gray-500'} />
                  <span>All Menus</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    menuDietFilter === 'All' ? 'bg-pink-100 text-[#f43397]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {scheduleData?.slots?.length || 5}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMenuDietFilter('Vegetarian')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    menuDietFilter === 'Vegetarian'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60'
                  }`}
                >
                  <Leaf size={13} className={menuDietFilter === 'Vegetarian' ? 'text-white' : 'text-emerald-600'} />
                  <span>Vegetarian</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    menuDietFilter === 'Vegetarian' ? 'bg-white/25 text-white' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    Veg
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMenuDietFilter('Vegan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    menuDietFilter === 'Vegan'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-teal-800 bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/60'
                  }`}
                >
                  <Sprout size={13} className={menuDietFilter === 'Vegan' ? 'text-white' : 'text-teal-600'} />
                  <span>Vegan</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    menuDietFilter === 'Vegan' ? 'bg-white/25 text-white' : 'bg-teal-200 text-teal-900'
                  }`}>
                    Plant-Based
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMenuDietFilter('Jain')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    menuDietFilter === 'Jain'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-purple-800 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/60'
                  }`}
                >
                  <ShieldCheck size={13} className={menuDietFilter === 'Jain' ? 'text-white' : 'text-purple-600'} />
                  <span>Jain</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    menuDietFilter === 'Jain' ? 'bg-white/25 text-white' : 'bg-purple-200 text-purple-900'
                  }`}>
                    Satvik
                  </span>
                </button>
              </div>
            </div>

            {/* Context Dietary Banner when Filter is Active */}
            {menuDietFilter !== 'All' && (
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150 ${
                menuDietFilter === 'Vegetarian'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : menuDietFilter === 'Vegan'
                  ? 'bg-teal-50/80 border-teal-200 text-teal-900'
                  : 'bg-purple-50/80 border-purple-200 text-purple-900'
              }`}>
                <div className="flex items-center gap-2">
                  {menuDietFilter === 'Vegetarian' && <Leaf size={16} className="text-emerald-600 shrink-0" />}
                  {menuDietFilter === 'Vegan' && <Sprout size={16} className="text-teal-600 shrink-0" />}
                  {menuDietFilter === 'Jain' && <ShieldCheck size={16} className="text-purple-600 shrink-0" />}
                  <span>
                    {menuDietFilter === 'Vegetarian' && (
                      <strong>Vegetarian Active:</strong>
                    )}
                    {menuDietFilter === 'Vegan' && (
                      <strong>Vegan Active (100% Plant-Based):</strong>
                    )}
                    {menuDietFilter === 'Jain' && (
                      <strong>Jain Satvik Active:</strong>
                    )}
                    {' '}
                    {menuDietFilter === 'Vegetarian' && 'Highlighting all fresh lacto-vegetarian dishes across today’s 5 active meal windows.'}
                    {menuDietFilter === 'Vegan' && 'Prepared strictly without milk, ghee, paneer, butter, or curd. Cooked with cold-pressed oils & fresh farm produce.'}
                    {menuDietFilter === 'Jain' && 'Cooked in dedicated satvik vessels without onions, garlic, potatoes, carrots, or root vegetables.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuDietFilter('All')}
                  className="text-[11px] font-bold text-gray-500 hover:text-gray-800 underline shrink-0 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {(scheduleData?.slots || []).map((slot: any) => {
                const isActive = slot.status === 'Active';
                const isCompleted = slot.status === 'Completed';

                // Fallback vegan items if not provided
                const veganItems: string[] = slot.veganOptions || (
                  slot.id === 'breakfast' ? ['Steamed Idli Sambar (Plant-based & Dairy-free)', 'Sprouted Moong Salad', 'Black Coffee / Green Tea'] :
                  slot.id === 'lunch' ? ['Aloo Gobi Matar (Dairy-Free Mustard Oil)', 'Yellow Tadka Dal & Steamed Rice', 'Tawa Phulkas (No Ghee/Butter)', 'Garden Green Salad'] :
                  slot.id === 'tea' ? ['Crispy Veg Cutlet (Dairy-Free)', 'Roasted Masala Peanuts & Chana Mix', 'Black Lemon Tea / Green Tea'] :
                  slot.id === 'dinner' ? ['Baingan Bharta & Mushroom Pepper Fry (Plant-Based)', 'Panchmel Dal (Dairy-Free)', 'Steamed Basmati Rice & Dry Roti'] :
                  ['Vegetable Masala Poha (No Ghee/Butter)', 'Roasted Spiced Makhana', 'Black Tea / Coffee']
                );

                return (
                  <div 
                    key={slot.id} 
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isActive 
                        ? 'border-emerald-400 shadow-md ring-2 ring-emerald-400/20' 
                        : isCompleted
                        ? 'border-gray-200 opacity-90'
                        : 'border-gray-200 shadow-sm hover:border-pink-200'
                    }`}
                  >
                    {/* Top Bar */}
                    <div className={`p-4 flex items-center justify-between border-b ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-100' 
                        : isCompleted 
                        ? 'bg-gray-50 border-gray-100' 
                        : 'bg-gradient-to-r from-pink-50/50 to-gray-50 border-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          isActive ? 'bg-emerald-500 text-white' : isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-[#f43397] text-white'
                        }`}>
                          {slot.id === 'tea' ? <Coffee size={20} /> : <Utensils size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-gray-900">{slot.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isActive 
                                ? 'bg-emerald-500 text-white animate-pulse' 
                                : isCompleted 
                                ? 'bg-gray-200 text-gray-700' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {slot.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} />
                            {slot.timeSlot}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Rate / Plate</span>
                        <div className="text-base font-black text-gray-900">
                          ₹{slot.unitRate}
                          <span className="text-[10px] font-normal text-emerald-600 ml-1">(Assoc pays ₹{Math.round(slot.unitRate * 0.2)})</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Dietary Badges Bar */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setMenuDietFilter(menuDietFilter === 'Vegetarian' ? 'All' : 'Vegetarian')}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                            menuDietFilter === 'Vegetarian'
                              ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/30'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <Leaf size={11} />
                          <span>Vegetarian</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMenuDietFilter(menuDietFilter === 'Vegan' ? 'All' : 'Vegan')}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                            menuDietFilter === 'Vegan'
                              ? 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-400/30'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
                          }`}
                        >
                          <Sprout size={11} />
                          <span>Vegan Friendly</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMenuDietFilter(menuDietFilter === 'Jain' ? 'All' : 'Jain')}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                            menuDietFilter === 'Jain'
                              ? 'bg-purple-700 text-white border-purple-800 ring-2 ring-purple-400/30'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
                          }`}
                        >
                          <ShieldCheck size={11} />
                          <span>Jain Available</span>
                        </button>

                        {slot.nonVegOptions?.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex items-center gap-1">
                            <Flame size={11} />
                            <span>Non-Veg Served</span>
                          </span>
                        )}
                      </div>

                      {/* Chef Special Highlight */}
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5">
                        <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">Today's Chef Special</span>
                          <p className="text-xs font-bold text-amber-950">{slot.chefSpecial}</p>
                        </div>
                      </div>

                      {/* Menu Description */}
                      <div>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Menu Highlights</span>
                        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {slot.menuHighlights}
                        </p>
                      </div>

                      {/* Dietary Categorization Cards (Vegetarian, Vegan, Jain, Non-Veg) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        
                        {/* 1. Vegetarian Card */}
                        <div className={`p-3 rounded-xl border transition-all ${
                          menuDietFilter === 'Vegetarian'
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs'
                            : 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/70'
                        }`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-emerald-900 flex items-center gap-1.5">
                              <Leaf size={14} className="text-emerald-600" />
                              Vegetarian
                            </span>
                            {menuDietFilter === 'Vegetarian' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600 text-white font-bold rounded">
                                Filtered
                              </span>
                            )}
                          </div>
                          <ul className="text-[11px] text-emerald-900 space-y-1 list-disc list-inside">
                            {slot.vegOptions?.map((v: string, idx: number) => (
                              <li key={idx} className="truncate font-medium">{v}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. Vegan Card */}
                        <div className={`p-3 rounded-xl border transition-all ${
                          menuDietFilter === 'Vegan'
                            ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-400/30 shadow-xs'
                            : 'bg-teal-50/40 border-teal-100 hover:bg-teal-50/70'
                        }`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-teal-900 flex items-center gap-1.5">
                              <Sprout size={14} className="text-teal-600" />
                              Vegan (Plant-Based)
                            </span>
                            {menuDietFilter === 'Vegan' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-teal-600 text-white font-bold rounded">
                                Filtered
                              </span>
                            )}
                          </div>
                          <ul className="text-[11px] text-teal-900 space-y-1 list-disc list-inside">
                            {veganItems.map((v: string, idx: number) => (
                              <li key={idx} className="truncate font-medium">{v}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. Jain Card */}
                        <div className={`p-3 rounded-xl border transition-all ${
                          menuDietFilter === 'Jain'
                            ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/30 shadow-xs'
                            : 'bg-purple-50/40 border-purple-100 hover:bg-purple-50/70'
                        }`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-purple-900 flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-purple-600" />
                              Jain Option (Satvik)
                            </span>
                            {menuDietFilter === 'Jain' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-purple-700 text-white font-bold rounded">
                                Filtered
                              </span>
                            )}
                          </div>
                          <ul className="text-[11px] text-purple-900 space-y-1 list-disc list-inside">
                            {(slot.jainOptions || ['Jain Satvik Special']).map((j: string, idx: number) => (
                              <li key={idx} className="truncate font-medium">{j}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. Non-Veg / Egg Card */}
                        <div className={`p-3 rounded-xl border transition-all ${
                          menuDietFilter !== 'All' ? 'opacity-50' : ''
                        } bg-orange-50/40 border-orange-100 hover:bg-orange-50/70`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-orange-900 flex items-center gap-1.5">
                              <Flame size={14} className="text-orange-600" />
                              Non-Veg / Egg
                            </span>
                          </div>
                          {slot.nonVegOptions?.length > 0 ? (
                            <ul className="text-[11px] text-orange-900 space-y-1 list-disc list-inside">
                              {slot.nonVegOptions.map((nv: string, idx: number) => (
                                <li key={idx} className="truncate font-medium">{nv}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-gray-500 italic">Pure Veg / No Non-Veg in this window</p>
                          )}
                        </div>

                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1 font-medium">
                          📍 {slot.servingCounter}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          ⚡ ~{slot.calories} kcal | {slot.hygieneScore}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SUPERVISOR BULK PRE-ORDER & HEADCOUNT FORECAST                       */}
      {/* ========================================================================= */}
      {activeTab === 'bulk-order' && (
        <CanteenBulkPreOrderTab
          scheduleData={scheduleData}
          forecastData={forecastData}
          onOrderSuccess={handleBulkOrderSuccess}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QR MEAL VOUCHER GENERATOR & REDEMPTION SCANNER                     */}
      {/* ========================================================================= */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          {/* Quick switch banner for shift supervisors */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-purple-900 font-semibold">
              <Users size={16} className="text-purple-600 shrink-0" />
              <span>Ordering for an entire shift team or department wave? Use the <strong>Supervisor Bulk Pre-order</strong> tool to issue multiple vouchers at once and synchronize kitchen demand.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('bulk-order')}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              Open Bulk Pre-order
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Generator Form (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <QrCode size={20} className="text-[#f43397]" />
                    Issue Digital Meal Voucher
                  </h2>
                  <p className="text-xs text-gray-500">Generate verified meal tokens with QR codes for warehouse associates.</p>
                </div>
              </div>

              <form onSubmit={handleGenerateVoucher} className="space-y-4">
                {/* Employee Search & Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Select Associate / Employee
                  </label>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search by name, ID (e.g. MSH-EMP-001) or dept..."
                      value={empSearch}
                      onChange={(e) => setEmpSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f43397]"
                    />
                  </div>

                  <select
                    value={selectedEmp.empId}
                    onChange={(e) => {
                      const emp = SAMPLE_EMPLOYEES.find(item => item.empId === e.target.value);
                      if (emp) setSelectedEmp(emp);
                    }}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#f43397]"
                  >
                    {filteredEmployees.map(emp => (
                      <option key={emp.empId} value={emp.empId}>
                        {emp.name} ({emp.empId}) — {emp.department} [{emp.shift}]
                      </option>
                    ))}
                  </select>

                  {/* Selected Associate Summary Chip */}
                  <div className="mt-2.5 p-3 bg-pink-50/50 border border-pink-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{selectedEmp.photo}</span>
                      <div>
                        <p className="text-xs font-black text-gray-900">{selectedEmp.name}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{selectedEmp.empId} • {selectedEmp.department}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-[#f43397] rounded-md border border-pink-200 shadow-xs">
                      {selectedEmp.shift}
                    </span>
                  </div>
                </div>

                {/* Meal Slot Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Meal Service Window
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'breakfast', label: 'Breakfast (₹35)', time: '07:30 - 09:30' },
                      { id: 'lunch', label: 'Buffet Lunch (₹65)', time: '12:30 - 14:45' },
                      { id: 'tea', label: 'High Tea (₹20)', time: '16:30 - 17:45' },
                      { id: 'dinner', label: 'Dinner (₹65)', time: '19:30 - 22:00' }
                    ].map(slot => (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setSelectedMealSlot(slot.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedMealSlot === slot.id 
                            ? 'border-[#f43397] bg-pink-50/70 ring-1 ring-[#f43397]' 
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-xs font-black block text-gray-900">{slot.label}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{slot.time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Dietary Preference
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'Pure Veg', label: 'Pure Veg', icon: Leaf, color: 'emerald' },
                      { id: 'Non-Veg', label: 'Non-Veg / Egg', icon: Flame, color: 'orange' },
                      { id: 'Jain', label: 'Jain Meal', icon: ShieldCheck, color: 'purple' }
                    ].map(d => {
                      const Icon = d.icon;
                      const isSel = selectedDiet === d.id;
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => setSelectedDiet(d.id as any)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isSel
                              ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={13} className={isSel ? 'text-pink-400' : 'text-gray-400'} />
                          <span>{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subsidy Calculation Breakdown */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Vendor Plate Rate:</span>
                    <span>₹{selectedMealSlot === 'tea' ? 20 : selectedMealSlot === 'breakfast' ? 35 : 65}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Company Subsidy (80%):</span>
                    <span>-₹{selectedMealSlot === 'tea' ? 16 : selectedMealSlot === 'breakfast' ? 28 : 52}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-black border-t border-gray-200 pt-1">
                    <span>Employee Payroll Deduction (20%):</span>
                    <span className="text-[#f43397]">₹{selectedMealSlot === 'tea' ? 4 : selectedMealSlot === 'breakfast' ? 7 : 13}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isGeneratingVoucher}
                  className="w-full py-3 bg-[#f43397] hover:bg-[#e02885] text-white rounded-xl font-bold text-sm shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{isGeneratingVoucher ? 'Generating Token...' : 'Generate & Issue QR Voucher'}</span>
                </button>
              </form>
            </div>

            {/* Middle/Right: Generated Voucher Card & Live Redemption Scanner (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Active Voucher Display Card */}
              {generatedVoucher ? (
                <div className="bg-gradient-to-br from-pink-500 via-[#f43397] to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MeeshoLogo size={28} />
                      <div>
                        <p className="text-xs font-bold text-pink-100 uppercase tracking-widest leading-none">MEESHO WMS FOOD PASS</p>
                        <p className="text-sm font-black text-white mt-0.5">FC-04 Dining Entitlement</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full font-extrabold uppercase tracking-wider border border-white/30">
                      {generatedVoucher.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* QR Code Graphic */}
                    <div className="sm:col-span-5 bg-white p-3.5 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                      <div className="p-1 bg-white rounded-lg">
                        <QRCode 
                          value={generatedVoucher.qrPayload || generatedVoucher.voucherCode}
                          size={140}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 256 256`}
                        />
                      </div>
                      <p className="text-[10px] font-mono font-bold text-gray-800 mt-2 text-center break-all">
                        {generatedVoucher.voucherCode}
                      </p>
                    </div>

                    {/* Voucher Details */}
                    <div className="sm:col-span-7 space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-pink-200 font-semibold uppercase">Associate Name</span>
                        <p className="text-base font-black text-white">{generatedVoucher.empName}</p>
                        <p className="text-pink-100 font-medium">{generatedVoucher.empId} • {generatedVoucher.department}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/15">
                        <div>
                          <span className="text-[10px] text-pink-200 font-semibold uppercase">Meal Slot</span>
                          <p className="font-bold text-white">{generatedVoucher.mealName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-pink-200 font-semibold uppercase">Diet Preference</span>
                          <p className="font-bold text-white">{generatedVoucher.dietaryType}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/15">
                        <div>
                          <span className="text-[10px] text-pink-200 font-semibold uppercase">Company Subsidy</span>
                          <p className="font-bold text-emerald-300">₹{generatedVoucher.companySubsidy} (80%)</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-pink-200 font-semibold uppercase">Associate Pay</span>
                          <p className="font-bold text-white">₹{generatedVoucher.employeePay} (20%)</p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handlePrintVoucher}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Printer size={13} />
                          <span>Print Voucher</span>
                        </button>

                        <button
                          onClick={() => handleRedeemVoucher(generatedVoucher.voucherCode)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <CheckCircle2 size={13} />
                          <span>Simulate Redeem</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[220px]">
                  <QrCode size={36} className="text-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-700">No Active Voucher Selected</p>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    Select an employee and click "Generate & Issue QR Voucher" on the left to create a live digital food pass.
                  </p>
                </div>
              )}

              {/* Canteen Staff Punch / Redemption Scanner Terminal */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Scan size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900">Canteen Buffet Redemption Terminal</h3>
                      <p className="text-[11px] text-gray-500">Scan QR barcode or enter voucher token code to validate plate entitlement.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                    Counter 1 Active
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Scan size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Paste QR payload or Token (e.g. MEE-MEAL-20260820-9481)..."
                      value={redeemInput}
                      onChange={(e) => setRedeemInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRedeemVoucher()}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleRedeemVoucher()}
                    disabled={isRedeeming || !redeemInput.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>{isRedeeming ? 'Validating...' : 'Redeem Plate'}</span>
                  </button>
                </div>

                {/* Live Scanner Feedback Alert */}
                {redemptionResult && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    redemptionResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    {redemptionResult.success ? (
                      <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    )}
                    <div className="space-y-1 text-xs">
                      <p className="font-black text-sm">{redemptionResult.success ? 'Entitlement Verified!' : 'Validation Warning'}</p>
                      <p className="leading-relaxed">{redemptionResult.message}</p>
                      {redemptionResult.voucher && (
                        <div className="pt-1 text-[11px] font-mono opacity-80">
                          Token: {redemptionResult.voucher.voucherCode} | Time: {new Date().toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vouchers Issuance & Audit Log Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-gray-700" />
                  Today's Issued Meal Vouchers & Audit Trail
                </h3>
                <p className="text-xs text-gray-500">Live ledger of all QR vouchers generated and redeemed for lunch, tea and dinner.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search voucher or emp..."
                    value={voucherSearch}
                    onChange={(e) => setVoucherSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f43397]"
                  />
                </div>

                <select
                  value={voucherFilterStatus}
                  onChange={(e) => setVoucherFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Valid">Valid (Unclaimed)</option>
                  <option value="Redeemed">Redeemed</option>
                </select>

                <select
                  value={voucherFilterMeal}
                  onChange={(e) => setVoucherFilterMeal(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg font-medium"
                >
                  <option value="All">All Meal Slots</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="tea">High Tea</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-y border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Voucher Code</th>
                    <th className="py-3 px-4">Associate</th>
                    <th className="py-3 px-4">Department & Shift</th>
                    <th className="py-3 px-4">Meal & Diet</th>
                    <th className="py-3 px-4">Subsidy Split</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Punch Timestamp</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVouchers.length > 0 ? (
                    filteredVouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {v.voucherCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          <div>{v.empName}</div>
                          <div className="text-[10px] text-gray-400">{v.empId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800">{v.department}</span>
                          <span className="text-[10px] text-gray-400 block">{v.shift}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{v.mealName}</div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            v.dietaryType === 'Non-Veg' ? 'bg-orange-100 text-orange-800' : v.dietaryType === 'Jain' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {v.dietaryType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">₹{v.totalCost}</div>
                          <div className="text-[10px] text-emerald-600 font-bold">Meesho ₹{v.companySubsidy} | Emp ₹{v.employeePay}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                            v.status === 'Redeemed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800 animate-pulse'
                          }`}>
                            {v.status === 'Redeemed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          {v.redeemedAt ? (
                            <div>
                              <p className="font-medium text-gray-900">{new Date(v.redeemedAt).toLocaleTimeString()}</p>
                              <p className="text-[10px] text-gray-400">{v.redeemedByCounter || 'Buffet Desk'}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Pending scan</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {v.status === 'Valid' ? (
                            <button
                              onClick={() => handleRedeemVoucher(v.voucherCode)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px] transition-all"
                            >
                              Redeem Plate
                            </button>
                          ) : (
                            <button
                              onClick={() => setGeneratedVoucher(v)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium text-[10px]"
                            >
                              View Card
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                        No meal vouchers found matching current filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HEADCOUNT VS. CONSUMPTION ANALYTICS                                */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">On-Floor Attendance</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {analyticsData?.kpis?.totalFloorHeadcount?.toLocaleString() || '1,070'}
              </p>
              <span className="text-[10px] text-gray-500 font-semibold">Across Shifts A, B, C</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">Vouchers Issued</p>
              <p className="text-2xl font-black text-purple-600 mt-1">
                {analyticsData?.kpis?.totalVouchersIssued?.toLocaleString() || '985'}
              </p>
              <span className="text-[10px] text-purple-600 font-semibold">92.0% of Workforce</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">Plates Consumed</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {analyticsData?.kpis?.totalMealsRedeemed?.toLocaleString() || '940'}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">95.4% Voucher Claim</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">Overall Uptake</p>
              <p className="text-2xl font-black text-[#f43397] mt-1">
                {analyticsData?.kpis?.overallAttendanceUptake || '91.6'}%
              </p>
              <span className="text-[10px] text-pink-600 font-semibold">Benchmark: &gt;88%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">Food Wastage</p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {analyticsData?.kpis?.foodWastageRate || '2.8'}%
              </p>
              <span className="text-[10px] text-blue-600 font-semibold">Target &lt;4.0% (Zero Landfill)</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">Avg Queue Wait</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {analyticsData?.kpis?.averageQueueWaitMins || '3.4'} min
              </p>
              <span className="text-[10px] text-amber-600 font-semibold">4 Express Counters</span>
            </div>
          </div>

          {/* Charts Row: Shift-Wise Headcount vs Plates & Hourly Rush Footfall */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Shift Breakdown Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Users size={16} className="text-[#f43397]" />
                    Shift-Wise Headcount vs. Meal Plates Consumed
                  </h3>
                  <p className="text-xs text-gray-500">Comparing active floor workforce against total meal plates served.</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.shiftBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="shiftName" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="headcount" fill="#9ca3af" name="Floor Attendance" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vouchersIssued" fill="#a855f7" name="Vouchers Issued" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalPlates" fill="#f43397" name="Total Plates Consumed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Footfall Waves Chart (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  Dining Hall Rush Waves & Capacity
                </h3>
                <p className="text-xs text-gray-500">Hourly plate punches across breakfast, lunch, and high-tea waves.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData?.hourlyFootfall || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="plates" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Plates Served" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-Time Kitchen Headcount Forecast & Bulk Pre-Order Impact */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl border border-gray-700 p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ChefHat size={18} className="text-[#f43397]" />
                  Live Kitchen Headcount Forecast & Supervisor Pre-Orders Sync
                </h3>
                <p className="text-xs text-gray-400">Real-time demand forecasting incorporating individual digital vouchers & supervisor team bulk pre-orders.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('bulk-order')}
                className="px-3.5 py-1.5 bg-[#f43397] hover:bg-pink-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Users size={14} />
                <span>Manage Team Pre-Orders</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {(forecastData?.slotsForecast || [
                { slotName: 'Morning Breakfast', timeSlot: '07:30 - 09:30 AM', totalForecastHeadcount: 360, recommendedKitchenPrepKg: 130, capacityUtilization: 90, estimatedWastageRisk: 'Low Risk' },
                { slotName: 'Grand Buffet Lunch', timeSlot: '12:30 - 02:45 PM', totalForecastHeadcount: 578, recommendedKitchenPrepKg: 326, capacityUtilization: 96, estimatedWastageRisk: 'Optimal Lean' },
                { slotName: 'Evening High Tea', timeSlot: '04:30 - 05:45 PM', totalForecastHeadcount: 520, recommendedKitchenPrepKg: 106, capacityUtilization: 95, estimatedWastageRisk: 'Optimal Lean' },
                { slotName: 'Night Dinner Buffet', timeSlot: '07:30 - 10:00 PM', totalForecastHeadcount: 280, recommendedKitchenPrepKg: 164, capacityUtilization: 88, estimatedWastageRisk: 'Low Risk' },
                { slotName: 'Midnight Refreshment', timeSlot: '01:30 - 02:30 AM', totalForecastHeadcount: 170, recommendedKitchenPrepKg: 41, capacityUtilization: 85, estimatedWastageRisk: 'Low Risk' }
              ]).map((s: any, idx: number) => (
                <div key={idx} className="bg-gray-800/80 border border-gray-700 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{s.slotName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-pink-500/20 text-pink-300 font-bold rounded">
                      {s.capacityUtilization}%
                    </span>
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {s.totalForecastHeadcount} <span className="text-xs text-gray-400 font-normal">Plates</span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex justify-between border-t border-gray-700/60 pt-1.5">
                    <span>Raw Prep: <strong className="text-amber-300">{s.recommendedKitchenPrepKg} Kg</strong></span>
                    <span className="text-emerald-300">{s.estimatedWastageRisk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department-Wise Uptake & Diet Breakdown Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Layers size={18} className="text-gray-700" />
              Departmental Meal Uptake & Dietary Distribution
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-y border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Warehouse Department</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Plates Consumed</th>
                    <th className="py-3 px-4">Uptake Rate</th>
                    <th className="py-3 px-4">Pure Veg</th>
                    <th className="py-3 px-4">Non-Veg / Egg</th>
                    <th className="py-3 px-4">Jain Thali</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(analyticsData?.departmentBreakdown || []).map((d: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 font-bold text-gray-900">{d.department}</td>
                      <td className="py-3 px-4 font-medium">{d.headcount} staff</td>
                      <td className="py-3 px-4 font-black text-gray-900">{d.consumed} plates</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#f43397] h-full rounded-full" 
                              style={{ width: `${Math.min(d.uptake, 100)}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-900">{d.uptake}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{d.veg} ({Math.round(d.veg / d.consumed * 100)}%)</td>
                      <td className="py-3 px-4 text-orange-700 font-semibold">{d.nonVeg} ({Math.round(d.nonVeg / d.consumed * 100)}%)</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">{d.jain} ({Math.round(d.jain / d.consumed * 100)}%)</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 font-bold rounded-full">
                          High Uptake
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

      {/* ========================================================================= */}
      {/* TAB 4: MONTHLY VENDOR BILLING RECONCILIATION REPORT                        */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Vendor Profile & High Level Financial Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-gray-900">
                    Catering Vendor Monthly Reconciliation Report
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-pink-100 text-[#f43397] rounded-md">
                    {billingData?.month || 'August 2026'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Vendor: <span className="font-bold text-gray-800">{billingData?.vendor?.name}</span> • 
                  GSTIN: <span className="font-mono">{billingData?.vendor?.gstin}</span> • 
                  Contract Ref: <span className="font-mono">{billingData?.vendor?.contractRef}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <FileSpreadsheet size={15} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleDownloadBillingPdf}
                  className="px-4 py-2 bg-[#f43397] hover:bg-[#e02885] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-pink-200"
                >
                  <Download size={15} />
                  <span>Download Reconciliation PDF</span>
                </button>

                <button
                  onClick={() => setIsSignOffOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <BadgeCheck size={15} />
                  <span>Manager Sign-Off</span>
                </button>
              </div>
            </div>

            {/* Financial Highlights 4-Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[11px] font-bold text-gray-500 uppercase">Gross Vendor Claim</p>
                <p className="text-xl font-black text-gray-900 mt-1">
                  ₹{billingData?.stats?.grossVendorClaim?.toLocaleString() || '14,75,000'}
                </p>
                <span className="text-[10px] text-gray-500">29,700 Invoiced Plates</span>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">Biometric Verified Amount</p>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  ₹{billingData?.stats?.verifiedReconciledAmount?.toLocaleString() || '14,58,000'}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Matched with Turnstiles</span>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-[11px] font-bold text-red-800 uppercase">Deductions & SLA Penalties</p>
                <p className="text-xl font-black text-red-700 mt-1">
                  -₹{((billingData?.stats?.discrepancyUnverifiedPlatesCost || 0) + (billingData?.stats?.penaltiesDeduction || 0)).toLocaleString()}
                </p>
                <span className="text-[10px] text-red-600 font-semibold">Discrepancy + Service Delays</span>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-[11px] font-bold text-purple-800 uppercase">Net Payable + 5% GST</p>
                <p className="text-xl font-black text-purple-900 mt-1">
                  ₹{billingData?.stats?.totalInvoicePayable?.toLocaleString() || '15,21,975'}
                </p>
                <span className="text-[10px] text-purple-700 font-bold">Authorized for Treasury Release</span>
              </div>
            </div>

            {/* Subsidy Allocation Split Bar */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Cost Sharing Breakdown:</span>
                <span className="text-gray-500 font-medium">Contract Term: 80% Employer Subsidy | 20% Employee Deductions</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                <div className="bg-[#f43397] h-full" style={{ width: '80%' }} title="Company Subsidy 80%" />
                <div className="bg-purple-600 h-full" style={{ width: '20%' }} title="Employee Share 20%" />
              </div>
              <div className="flex justify-between text-xs font-semibold pt-1">
                <span className="text-[#f43397]">
                  ● Meesho FC Subsidy (80%): ₹{billingData?.stats?.subsidySplit?.companyContribution80?.toLocaleString()}
                </span>
                <span className="text-purple-700">
                  ● Associate Payroll Deduction (20%): ₹{billingData?.stats?.subsidySplit?.employeePayrollDeduction20?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Day-by-Day Reconciliation Audit Ledger Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Calendar size={18} className="text-gray-700" />
                  Daily Plate-by-Plate Reconciliation Audit Ledger
                </h3>
                <p className="text-xs text-gray-500">Cross-verified daily meal log against automated turnstile scans and verified vendor claims.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Audit Status: {billingData?.stats?.auditStatus || 'Verified'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-y border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Breakfast (₹35)</th>
                    <th className="py-3 px-4">Lunch (₹65)</th>
                    <th className="py-3 px-4">High Tea (₹20)</th>
                    <th className="py-3 px-4">Dinner (₹65)</th>
                    <th className="py-3 px-4">Total Plates</th>
                    <th className="py-3 px-4">Discrepancies</th>
                    <th className="py-3 px-4">Penalty</th>
                    <th className="py-3 px-4 text-right">Net Daily Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(billingData?.dailyLedger || []).map((row: any) => (
                    <tr key={row.date} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900 font-mono">{row.date}</td>
                      <td className="py-3 px-4">{row.breakfast}</td>
                      <td className="py-3 px-4 font-medium">{row.lunch}</td>
                      <td className="py-3 px-4">{row.highTea}</td>
                      <td className="py-3 px-4">{row.dinner}</td>
                      <td className="py-3 px-4 font-black text-gray-900">{row.totalPlates}</td>
                      <td className="py-3 px-4">
                        {row.discrepancyCount > 0 ? (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle size={12} />
                            -{row.discrepancyCount} unverified
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">✓ 100% Matched</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {row.penaltyDeduction > 0 ? (
                          <div>
                            <span className="font-bold text-red-600">-₹{row.penaltyDeduction}</span>
                            <span className="text-[9px] text-gray-400 block truncate max-w-[140px]">{row.penaltyReason}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Nil</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-gray-900">
                        ₹{row.netPayable.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIGN-OFF MODAL                                                            */}
      {/* ========================================================================= */}
      {isSignOffOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Sign Off Monthly Vendor Reconciliation</h3>
                  <p className="text-xs text-gray-500">Authorize catering invoice release for Finance & Banking settlement.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSignOffOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Authorizing Facility Lead / AVP</label>
                <input 
                  type="text"
                  value={managerSignName}
                  onChange={(e) => setManagerSignName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Audit Notes & Approval Remarks</label>
                <textarea 
                  rows={3}
                  value={signRemarks}
                  onChange={(e) => setSignRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Binding Audit Confirmation:
                </p>
                <p className="text-[11px] leading-relaxed">
                  By clicking approve, you verify that turnstile attendance records, FSSAI hygiene logs, and SLA penalties have been audited. 
                  Net payable of <strong className="font-bold">₹{billingData?.stats?.totalInvoicePayable?.toLocaleString()}</strong> will be dispatched to Banking Treasury.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsSignOffOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOff}
                disabled={isSigning}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <CheckCircle size={15} />
                <span>{isSigning ? 'Authorizing...' : 'Authorize & Sign Off'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

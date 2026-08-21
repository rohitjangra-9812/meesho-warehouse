import React, { useState, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { 
  Users, 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Leaf, 
  Flame, 
  ShieldCheck, 
  Send, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Layers, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  TrendingUp, 
  BadgeCheck, 
  FileText, 
  Calendar,
  DollarSign,
  Coffee,
  Utensils,
  ArrowRight,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  CANTEEN_ACTIVE_ROSTER, 
  SUPERVISOR_PROFILES, 
  RosterAssociate 
} from '../data/canteenRoster';
import { fetchApi } from '../lib/api';
import { useMaintenance } from '../lib/maintenance';

interface CanteenBulkPreOrderTabProps {
  scheduleData: any;
  forecastData: any;
  onOrderSuccess: (batch: any, vouchers: any[], updatedForecast: any) => void;
  showToast: (msg: string) => void;
}

export function CanteenBulkPreOrderTab({
  scheduleData,
  forecastData,
  onOrderSuccess,
  showToast
}: CanteenBulkPreOrderTabProps) {
  const { checkAndBlockAction } = useMaintenance();

  // Supervisor Selection
  const [selectedSupervisor, setSelectedSupervisor] = useState(SUPERVISOR_PROFILES[0]);
  const [supervisorNameInput, setSupervisorNameInput] = useState(SUPERVISOR_PROFILES[0].name);

  // Shift & Department Filters
  const [activeShiftFilter, setActiveShiftFilter] = useState<'Morning A' | 'Evening B' | 'Night C' | 'All'>('Morning A');
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>('Wave Picking');
  const [rosterSearch, setRosterSearch] = useState('');
  const [onlyCheckedIn, setOnlyCheckedIn] = useState(false);

  // Target Meal Window
  const [selectedMealSlot, setSelectedMealSlot] = useState('lunch');
  const [supervisorNotes, setSupervisorNotes] = useState('Shift A Picking Wave 3 team early buffet reservation.');

  // Selected Employees Matrix: map of empId -> { selected: boolean; diet: 'Pure Veg' | 'Non-Veg' | 'Jain' }
  const [selectionMatrix, setSelectionMatrix] = useState<Record<string, { selected: boolean; diet: 'Pure Veg' | 'Non-Veg' | 'Jain' }>>(() => {
    const initial: Record<string, { selected: boolean; diet: 'Pure Veg' | 'Non-Veg' | 'Jain' }> = {};
    CANTEEN_ACTIVE_ROSTER.forEach(emp => {
      // Default select all matching the default supervisor shift & department
      const isDefaultMatch = emp.shift === 'Morning A' && emp.department === 'Wave Picking';
      initial[emp.empId] = {
        selected: isDefaultMatch,
        diet: emp.defaultDiet
      };
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBatchModal, setCompletedBatchModal] = useState<any | null>(null);

  // When supervisor changes, automatically update shift and department to match
  const handleSupervisorChange = (supId: string) => {
    const sup = SUPERVISOR_PROFILES.find(s => s.id === supId);
    if (sup) {
      setSelectedSupervisor(sup);
      setSupervisorNameInput(`${sup.name} (${sup.role})`);
      setActiveShiftFilter(sup.shift as any);
      setActiveDeptFilter(sup.department);
      
      // Auto-select team members for this supervisor's department & shift
      setSelectionMatrix(prev => {
        const next = { ...prev };
        CANTEEN_ACTIVE_ROSTER.forEach(emp => {
          if (emp.shift === sup.shift && (sup.department === 'All' || emp.department === sup.department)) {
            next[emp.empId] = {
              selected: true,
              diet: next[emp.empId]?.diet || emp.defaultDiet
            };
          }
        });
        return next;
      });
      showToast(`Switched supervisor profile to ${sup.name} (${sup.department} - ${sup.shift})`);
    }
  };

  // Filtered Roster Associates
  const filteredRoster = useMemo(() => {
    return CANTEEN_ACTIVE_ROSTER.filter(emp => {
      const matchShift = activeShiftFilter === 'All' || emp.shift === activeShiftFilter;
      const matchDept = activeDeptFilter === 'All' || emp.department === activeDeptFilter;
      const matchSearch = !rosterSearch.trim() || 
        emp.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
        emp.empId.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(rosterSearch.toLowerCase());
      const matchPunch = !onlyCheckedIn || (emp.attendanceStatus === 'Checked In' || emp.attendanceStatus === 'On Floor' || emp.attendanceStatus === 'Dock Station');

      return matchShift && matchDept && matchSearch && matchPunch;
    });
  }, [activeShiftFilter, activeDeptFilter, rosterSearch, onlyCheckedIn]);

  // Selected Count & Details
  const selectedAssociates = useMemo(() => {
    return CANTEEN_ACTIVE_ROSTER.filter(emp => selectionMatrix[emp.empId]?.selected);
  }, [selectionMatrix]);

  // Current slot information
  const currentSlotInfo = useMemo(() => {
    const defaultSlots: Record<string, { id: string; name: string; rate: number; time: string; prepBufferKg: number; cal: number }> = {
      breakfast: { id: 'breakfast', name: 'Morning Breakfast', rate: 35, time: '07:30 - 09:30 AM', prepBufferKg: 15, cal: 480 },
      lunch: { id: 'lunch', name: 'Grand Buffet Lunch', rate: 65, time: '12:30 - 02:45 PM', prepBufferKg: 25, cal: 740 },
      tea: { id: 'tea', name: 'Evening High Tea & Snacks', rate: 20, time: '04:30 - 05:45 PM', prepBufferKg: 12, cal: 310 },
      dinner: { id: 'dinner', name: 'Night Dinner Buffet', rate: 65, time: '07:30 - 10:00 PM', prepBufferKg: 18, cal: 690 },
      midnight: { id: 'midnight', name: 'Shift C Midnight Refreshment', rate: 40, time: '01:30 - 02:30 AM', prepBufferKg: 10, cal: 330 }
    };
    return defaultSlots[selectedMealSlot] || defaultSlots.lunch;
  }, [selectedMealSlot]);

  // Counts of dietary types
  const dietaryCounts = useMemo(() => {
    let veg = 0;
    let nonVeg = 0;
    let jain = 0;

    selectedAssociates.forEach(emp => {
      const d = selectionMatrix[emp.empId]?.diet || emp.defaultDiet;
      if (d === 'Non-Veg') nonVeg++;
      else if (d === 'Jain') jain++;
      else veg++;
    });

    const totalPlates = selectedAssociates.length;
    const totalCost = totalPlates * currentSlotInfo.rate;
    const companySubsidy = Math.round(totalCost * 0.8);
    const employeePay = totalCost - companySubsidy;

    return {
      veg,
      nonVeg,
      jain,
      totalPlates,
      totalCost,
      companySubsidy,
      employeePay
    };
  }, [selectedAssociates, selectionMatrix, currentSlotInfo]);

  // Select / Deselect All Filtered
  const isAllFilteredSelected = filteredRoster.length > 0 && filteredRoster.every(emp => selectionMatrix[emp.empId]?.selected);

  const toggleSelectAllFiltered = () => {
    const nextState = !isAllFilteredSelected;
    setSelectionMatrix(prev => {
      const updated = { ...prev };
      filteredRoster.forEach(emp => {
        updated[emp.empId] = {
          selected: nextState,
          diet: updated[emp.empId]?.diet || emp.defaultDiet
        };
      });
      return updated;
    });
  };

  // Toggle single employee
  const toggleEmployeeSelect = (empId: string, defaultDiet: 'Pure Veg' | 'Non-Veg' | 'Jain') => {
    setSelectionMatrix(prev => ({
      ...prev,
      [empId]: {
        selected: !prev[empId]?.selected,
        diet: prev[empId]?.diet || defaultDiet
      }
    }));
  };

  // Set dietary preference for a single employee
  const setEmployeeDiet = (empId: string, diet: 'Pure Veg' | 'Non-Veg' | 'Jain') => {
    setSelectionMatrix(prev => ({
      ...prev,
      [empId]: {
        selected: true, // auto-select if changing diet
        diet
      }
    }));
  };

  // Batch set all selected to a dietary type
  const batchSetDietary = (diet: 'Pure Veg' | 'Non-Veg' | 'Jain') => {
    setSelectionMatrix(prev => {
      const updated = { ...prev };
      selectedAssociates.forEach(emp => {
        if (updated[emp.empId]?.selected) {
          updated[emp.empId] = {
            ...updated[emp.empId],
            diet
          };
        }
      });
      return updated;
    });
    showToast(`Updated all ${selectedAssociates.length} selected associates to ${diet}`);
  };

  // Forecast computation simulation for selected slot
  const slotForecast = useMemo(() => {
    const basePlan = selectedMealSlot === 'lunch' ? 550 : selectedMealSlot === 'tea' ? 520 : selectedMealSlot === 'breakfast' ? 350 : selectedMealSlot === 'dinner' ? 280 : 170;
    const baseCapacity = selectedMealSlot === 'lunch' ? 600 : selectedMealSlot === 'tea' ? 550 : selectedMealSlot === 'breakfast' ? 400 : selectedMealSlot === 'dinner' ? 320 : 200;
    
    // Existing pre-orders from forecast data if available
    const existingSlotForecast = forecastData?.slotsForecast?.find((s: any) => s.slotId === selectedMealSlot);
    const existingPreOrders = existingSlotForecast?.supervisorPreOrdersCount || 0;
    
    const preOrderIncrement = dietaryCounts.totalPlates;
    const dynamicForecastHeadcount = basePlan + existingPreOrders + preOrderIncrement;
    const utilizationRate = Math.min(100, Math.round((dynamicForecastHeadcount / baseCapacity) * 100));

    const rawGrams = selectedMealSlot === 'lunch' || selectedMealSlot === 'dinner' ? 520 : selectedMealSlot === 'breakfast' ? 320 : 180;
    const recommendedKitchenPrepKg = Math.round((dynamicForecastHeadcount * rawGrams) / 1000 + currentSlotInfo.prepBufferKg);

    return {
      basePlan,
      baseCapacity,
      existingPreOrders,
      preOrderIncrement,
      dynamicForecastHeadcount,
      utilizationRate,
      recommendedKitchenPrepKg
    };
  }, [selectedMealSlot, dietaryCounts, forecastData, currentSlotInfo]);

  // Handle Bulk Order Submission
  const handleBulkPreOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAndBlockAction("Bulk Meal Pre-Order")) return;

    if (dietaryCounts.totalPlates === 0) {
      alert("Please select at least 1 associate from the active shift roster to pre-order meals.");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = selectedAssociates.map(emp => ({
        empId: emp.empId,
        empName: emp.name,
        department: emp.department,
        shift: emp.shift,
        dietaryType: selectionMatrix[emp.empId]?.diet || emp.defaultDiet
      }));

      const res = await fetchApi('/canteen/vouchers/bulk-preorder', {
        method: 'POST',
        body: JSON.stringify({
          supervisorName: supervisorNameInput.trim() || selectedSupervisor.name,
          shift: activeShiftFilter === 'All' ? selectedSupervisor.shift : activeShiftFilter,
          department: activeDeptFilter === 'All' ? selectedSupervisor.department : activeDeptFilter,
          mealSlot: selectedMealSlot,
          items: itemsPayload,
          notes: supervisorNotes
        })
      });

      if (res && res.success) {
        setCompletedBatchModal({
          batch: res.batch,
          vouchers: res.vouchers,
          forecast: res.forecast,
          items: itemsPayload
        });

        onOrderSuccess(res.batch, res.vouchers, res.forecast);
        showToast(`🎉 Pre-order confirmed! ${dietaryCounts.totalPlates} meal vouchers generated for ${res.batch.department}.`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch bulk pre-order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download PDF Team Meal Pass Roster
  const handleDownloadBatchPdf = (batchData: any) => {
    const doc = new jsPDF();
    const batch = batchData.batch;
    const vouchers = batchData.vouchers || [];

    // Header
    doc.setFillColor(244, 51, 151); // Meesho Pink
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MEESHO WMS - SHIFT TEAM BULK MEAL PASS ROSTER', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`BATCH CODE: ${batch.batchCode} | MEAL: ${batch.mealName.toUpperCase()} | SHIFT: ${batch.shift}`, 14, 19);

    // Summary Card
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Team Pre-Order & Headcount Forecast Summary', 14, 34);

    const summaryRows = [
      ['Shift Supervisor', batch.supervisorName, 'Department / Team', batch.department],
      ['Meal Service Window', batch.mealName, 'Total Plates Reserved', `${batch.totalPlates} Plates`],
      ['Pure Veg Plates', `${batch.vegCount} plates`, 'Non-Veg Plates', `${batch.nonVegCount} plates`],
      ['Jain Special Plates', `${batch.jainCount} plates`, 'Total Invoiced Cost', `INR ${batch.totalCost.toLocaleString()}`],
      ['Company Subsidy (80%)', `INR ${batch.companySubsidy.toLocaleString()}`, 'Payroll Deduction (20%)', `INR ${batch.employeePay.toLocaleString()}`],
      ['Forecast Sync Status', 'Live Synced to Kitchen Display', 'Timestamp', new Date(batch.timestamp).toLocaleString()]
    ];

    autoTable(doc, {
      startY: 38,
      body: summaryRows,
      theme: 'grid',
      styles: { fontSize: 8.5 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [248, 248, 248] }, 2: { fontStyle: 'bold', fillColor: [248, 248, 248] } }
    });

    // Associate Pass Table
    const finalY1 = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Authorized Associate Roster & Voucher Token IDs', 14, finalY1 + 10);

    const voucherRows = vouchers.map((v: any, index: number) => [
      index + 1,
      v.empId,
      v.empName,
      v.department,
      v.dietaryType,
      v.voucherCode,
      `₹${v.totalCost} (₹${v.companySubsidy} Subsidized)`,
      'Pre-Approved'
    ]);

    autoTable(doc, {
      startY: finalY1 + 14,
      head: [['#', 'Emp ID', 'Associate Name', 'Dept', 'Diet Choice', 'Voucher Token', 'Rate Split', 'Status']],
      body: voucherRows,
      theme: 'striped',
      headStyles: { fillColor: [244, 51, 151], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.5 }
    });

    // Verification Note
    const finalY2 = (doc as any).lastAutoTable.finalY || 200;
    if (finalY2 < 260) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Instructions: Present this roster at Buffet Counters 1-4 for contactless team meal distribution.', 14, finalY2 + 12);
      doc.text(`Authorized by: ${batch.supervisorName} | Generated via Meesho WMS Canteen System`, 14, finalY2 + 17);
    }

    doc.save(`Meesho-Team-Meal-Pass-${batch.batchCode}.pdf`);
    showToast(`📄 Team Meal Pass PDF downloaded: ${batch.batchCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Supervisor Bulk Order Action Hero */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 rounded-2xl p-6 text-white border border-purple-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-pink-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/30 flex items-center justify-center">
                <Users size={22} />
              </span>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Shift Supervisor Bulk Meal Pre-Order
              </h2>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles size={13} />
                Live Forecast Auto-Sync
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Pre-order buffet meals, snacks, and tea for your floor team directly from active biometric rosters. 
              The kitchen headcount forecast, raw material kg prep, and 80% subsidy reconciliation will automatically update in real time.
            </p>
          </div>

          {/* Supervisor Quick Profile Switcher */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[280px]">
            <p className="text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BadgeCheck size={14} />
              Acting Shift Supervisor Profile
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedSupervisor.avatar}</span>
              <div className="flex-1">
                <select
                  value={selectedSupervisor.id}
                  onChange={(e) => handleSupervisorChange(e.target.value)}
                  className="w-full text-xs font-black bg-gray-900/90 text-white rounded-lg px-2.5 py-1.5 border border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-pink-400"
                >
                  {SUPERVISOR_PROFILES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-300 mt-1">
                  Badge: <span className="font-mono text-pink-300">{selectedSupervisor.badgeId}</span> • {selectedSupervisor.shift}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bulk Pre-Order Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Columns: Active Shift Roster Selector & Dietary Matrix */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
            
            {/* Top Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Layers size={18} className="text-[#f43397]" />
                  Active Shift Floor Roster & Attendance
                </h3>
                <p className="text-xs text-gray-500">
                  Select team members to include in this meal reservation.
                </p>
              </div>

              {/* Roster Counter Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-pink-50 text-[#f43397] rounded-xl border border-pink-200">
                  {selectedAssociates.length} / {filteredRoster.length} Selected
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Shift Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Shift Filter</label>
                <select
                  value={activeShiftFilter}
                  onChange={(e) => setActiveShiftFilter(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f43397]"
                >
                  <option value="Morning A">Morning Shift A (06:00 - 14:30)</option>
                  <option value="Evening B">Evening Shift B (14:00 - 22:30)</option>
                  <option value="Night C">Night Shift C (22:00 - 06:30)</option>
                  <option value="All">All Active Shifts (Floor Total)</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Department / Bay</label>
                <select
                  value={activeDeptFilter}
                  onChange={(e) => setActiveDeptFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f43397]"
                >
                  <option value="Wave Picking">Wave Picking</option>
                  <option value="Packing & QC">Packing & QC</option>
                  <option value="Inbound Receiving">Inbound Receiving</option>
                  <option value="Dock Logistics">Dock Logistics</option>
                  <option value="Returns & RTO">Returns & RTO</option>
                  <option value="Security & Facility">Security & Facility</option>
                  <option value="All">All Departments (Consolidated)</option>
                </select>
              </div>

              {/* Search Box */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Search Associate</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or EMP ID..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f43397]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Batch Dietary Actions Bar */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 rounded text-[#f43397] focus:ring-[#f43397] border-gray-300"
                  />
                  <span>Select All Filtered ({filteredRoster.length} associates)</span>
                </label>
              </div>

              {/* Batch Dietary Switcher */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 mr-1">Batch Dietary:</span>
                <button
                  type="button"
                  onClick={() => batchSetDietary('Pure Veg')}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Leaf size={12} />
                  <span>All Pure Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => batchSetDietary('Non-Veg')}
                  className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Flame size={12} />
                  <span>All Non-Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => batchSetDietary('Jain')}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck size={12} />
                  <span>All Jain</span>
                </button>
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        className="w-3.5 h-3.5 rounded text-[#f43397] focus:ring-[#f43397] border-gray-300"
                      />
                    </th>
                    <th className="py-2.5 px-3">Associate Details</th>
                    <th className="py-2.5 px-3">Shift & Department</th>
                    <th className="py-2.5 px-3">Biometric Attendance</th>
                    <th className="py-2.5 px-3 text-center">Dietary Choice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRoster.map(emp => {
                    const isSelected = selectionMatrix[emp.empId]?.selected || false;
                    const currentDiet = selectionMatrix[emp.empId]?.diet || emp.defaultDiet;

                    return (
                      <tr 
                        key={emp.empId} 
                        className={`transition-colors ${
                          isSelected ? 'bg-pink-50/40 hover:bg-pink-50/70' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEmployeeSelect(emp.empId, emp.defaultDiet)}
                            className="w-4 h-4 rounded text-[#f43397] focus:ring-[#f43397] border-gray-300 cursor-pointer"
                          />
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{emp.photo}</span>
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{emp.name}</p>
                              <p className="text-[10px] font-mono text-gray-500 font-semibold">{emp.empId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-gray-800">{emp.department}</p>
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                            {emp.shift}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-emerald-800 text-[11px]">{emp.attendanceStatus}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium">
                            Punched {emp.punchTime} ({emp.turnstileGate})
                          </p>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-xs">
                            <button
                              type="button"
                              onClick={() => setEmployeeDiet(emp.empId, 'Pure Veg')}
                              title="Pure Veg"
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                currentDiet === 'Pure Veg'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              Veg
                            </button>
                            <button
                              type="button"
                              onClick={() => setEmployeeDiet(emp.empId, 'Non-Veg')}
                              title="Non-Veg / Egg"
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                currentDiet === 'Non-Veg'
                                  ? 'bg-orange-600 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-orange-700 hover:bg-orange-50'
                              }`}
                            >
                              Non-Veg
                            </button>
                            <button
                              type="button"
                              onClick={() => setEmployeeDiet(emp.empId, 'Jain')}
                              title="Jain Option"
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                currentDiet === 'Jain'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-purple-700 hover:bg-purple-50'
                              }`}
                            >
                              Jain
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="font-semibold text-xs">No associates found matching the selected shift & department filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right 4 Columns: Meal Target & Headcount Forecast Impact Simulator */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Target Meal Window Selector */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Utensils size={16} className="text-[#f43397]" />
              1. Target Meal Window
            </h3>

            <div className="space-y-2">
              {[
                { id: 'lunch', label: 'Grand Buffet Lunch', time: '12:30 - 02:45 PM', rate: 65, tag: 'Active Slot' },
                { id: 'tea', label: 'Evening High Tea & Snacks', time: '04:30 - 05:45 PM', rate: 20, tag: 'Upcoming' },
                { id: 'dinner', label: 'Night Dinner Buffet', time: '07:30 - 10:00 PM', rate: 65, tag: 'Upcoming' },
                { id: 'breakfast', label: 'Morning Breakfast', time: '07:30 - 09:30 AM', rate: 35, tag: 'Completed' },
                { id: 'midnight', label: 'Shift C Midnight Refreshment', time: '01:30 - 02:30 AM', rate: 40, tag: 'Upcoming' }
              ].map(slot => (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => setSelectedMealSlot(slot.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedMealSlot === slot.id 
                      ? 'border-[#f43397] bg-pink-50/80 ring-2 ring-[#f43397]/20 shadow-xs' 
                      : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100/80'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-gray-900 block">{slot.label}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{slot.time}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#f43397]">₹{slot.rate}</span>
                    <span className="text-[9px] block text-gray-400 font-semibold">per plate</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Supervisor Notes */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Supervisor Dispatch Remarks</label>
              <input
                type="text"
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                placeholder="e.g. Wave 3 team early lunch batch"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f43397]"
              />
            </div>
          </div>

          {/* Dynamic Kitchen Headcount Forecast & Cost Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 border border-gray-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div>
                <p className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">Kitchen Forecast & Subsidy</p>
                <h3 className="text-base font-black text-white">Live Demand Simulation</h3>
              </div>
              <span className="p-2 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/30">
                <TrendingUp size={18} />
              </span>
            </div>

            {/* Plate Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-emerald-950/60 border border-emerald-700/50 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-400 block">Pure Veg</span>
                <span className="text-lg font-black text-white">{dietaryCounts.veg}</span>
              </div>
              <div className="p-2 bg-orange-950/60 border border-orange-700/50 rounded-xl">
                <span className="text-[10px] font-bold text-orange-400 block">Non-Veg</span>
                <span className="text-lg font-black text-white">{dietaryCounts.nonVeg}</span>
              </div>
              <div className="p-2 bg-purple-950/60 border border-purple-700/50 rounded-xl">
                <span className="text-[10px] font-bold text-purple-400 block">Jain</span>
                <span className="text-lg font-black text-white">{dietaryCounts.jain}</span>
              </div>
            </div>

            {/* Dynamic Forecast Metrics Comparison */}
            <div className="bg-gray-800/90 rounded-xl p-3.5 border border-gray-700 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span>Baseline Kitchen Plan:</span>
                <span className="font-mono font-bold text-white">{slotForecast.basePlan} Plates</span>
              </div>
              <div className="flex justify-between items-center text-pink-300 font-bold">
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  + This Supervisor Bulk Order:
                </span>
                <span className="font-mono text-pink-400">+{slotForecast.preOrderIncrement} Plates</span>
              </div>
              <div className="pt-2 border-t border-gray-700 flex justify-between items-center font-black text-emerald-400">
                <span>Updated Kitchen Forecast:</span>
                <span className="font-mono text-sm">{slotForecast.dynamicForecastHeadcount} Plates</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-400">
                <span>Recommended Raw Food Prep:</span>
                <span className="font-bold text-amber-300">{slotForecast.recommendedKitchenPrepKg} Kg</span>
              </div>

              {/* Progress bar of kitchen capacity */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Kitchen Capacity Utilization:</span>
                  <span className="font-bold text-white">{slotForecast.utilizationRate}% of {slotForecast.baseCapacity}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-pink-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${slotForecast.utilizationRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subsidy 80/20 Financial Breakdown */}
            <div className="space-y-2 pt-1 border-t border-gray-700 text-xs">
              <div className="flex justify-between font-medium text-gray-300">
                <span>Gross Order Value ({dietaryCounts.totalPlates} × ₹{currentSlotInfo.rate}):</span>
                <span className="font-bold text-white font-mono">₹{dietaryCounts.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#f43397] font-bold">
                <span>Meesho Corporate Subsidy (80%):</span>
                <span className="font-mono">₹{dietaryCounts.companySubsidy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-purple-300 font-bold">
                <span>Team Payroll Deduction (20%):</span>
                <span className="font-mono">₹{dietaryCounts.employeePay.toLocaleString()}</span>
              </div>
            </div>

            {/* Submission CTA Button */}
            <button
              type="button"
              onClick={handleBulkPreOrderSubmit}
              disabled={isSubmitting || dietaryCounts.totalPlates === 0}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#f43397] to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Send size={16} />
              <span>
                {isSubmitting 
                  ? 'Generating Tokens & Syncing...' 
                  : `Confirm & Pre-order ${dietaryCounts.totalPlates} Meals (₹${dietaryCounts.totalCost})`}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Live Kitchen Headcount Forecast Board & Bulk Pre-Orders History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Real-Time Kitchen Preparation Forecast Matrix */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <ChefHat size={18} className="text-emerald-600" />
                Real-Time Kitchen Preparation & Headcount Forecast
              </h3>
              <p className="text-xs text-gray-500">Live synchronized demand schedule across all daily meal windows.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <BadgeCheck size={13} />
              Kitchen Display Synced
            </span>
          </div>

          <div className="space-y-3">
            {(forecastData?.slotsForecast || []).map((slot: any) => {
              const isCurrent = slot.slotId === selectedMealSlot;

              return (
                <div 
                  key={slot.slotId}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent 
                      ? 'border-pink-300 bg-pink-50/40 ring-1 ring-pink-300' 
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-sm">{slot.slotName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-700 font-bold rounded-md">
                        {slot.timeSlot}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#f43397]">
                      {slot.totalForecastHeadcount} Plates Forecasted
                    </span>
                  </div>

                  {/* Details Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-gray-200/60">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Baseline Roster:</span>
                      <span className="font-bold text-gray-800">{slot.baselineForecast} Plates</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Supervisor Pre-orders:</span>
                      <span className="font-bold text-pink-600">+{slot.supervisorPreOrdersCount} Plates</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Raw Prep Recommended:</span>
                      <span className="font-bold text-amber-700">{slot.recommendedKitchenPrepKg} Kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Capacity Utilization:</span>
                      <span className="font-bold text-emerald-700">{slot.capacityUtilization}% ({slot.estimatedWastageRisk})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Supervisor Pre-Order Batch History */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-purple-600" />
                Supervisor Pre-Order Dispatch Log
              </h3>
              <p className="text-xs text-gray-500">Audit history of recent team meal reservations.</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {(forecastData?.recentBatches || []).map((batch: any) => (
              <div 
                key={batch.id} 
                className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 hover:bg-gray-100/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#f43397]">{batch.batchCode}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    {batch.status}
                  </span>
                </div>

                <div className="text-xs">
                  <p className="font-bold text-gray-900">{batch.mealName} ({batch.totalPlates} Plates)</p>
                  <p className="text-[11px] text-gray-500">
                    {batch.supervisorName} • {batch.department} [{batch.shift}]
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-200 text-gray-600">
                  <span>🥬 {batch.vegCount} Veg | 🍗 {batch.nonVegCount} Non-Veg | 🌿 {batch.jainCount} Jain</span>
                  <span className="font-bold text-gray-900">₹{batch.totalCost.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation & Printable Pass Sheet Modal */}
      {completedBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Bulk Meal Pre-Order Dispatched!</h3>
                  <p className="text-xs text-gray-500">
                    Batch Code: <strong className="text-[#f43397] font-mono">{completedBatchModal.batch.batchCode}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompletedBatchModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Batch Details Card */}
            <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Meal Window:</span>
                  <span className="font-bold text-gray-900">{completedBatchModal.batch.mealName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Total Plates:</span>
                  <span className="font-bold text-[#f43397] text-sm">{completedBatchModal.batch.totalPlates} Plates</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Supervisor:</span>
                  <span className="font-bold text-gray-900 truncate block">{completedBatchModal.batch.supervisorName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Subsidy (80%):</span>
                  <span className="font-bold text-emerald-700">₹{completedBatchModal.batch.companySubsidy.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-pink-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Dietary Distribution:</span>
                <span className="font-bold text-gray-900">
                  🥬 {completedBatchModal.batch.vegCount} Pure Veg • 🍗 {completedBatchModal.batch.nonVegCount} Non-Veg • 🌿 {completedBatchModal.batch.jainCount} Jain
                </span>
              </div>
            </div>

            {/* Generated Tokens Table */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Issued Associate Meal Tokens ({completedBatchModal.vouchers.length})
              </p>
              <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Emp ID</th>
                      <th className="py-2 px-3">Associate Name</th>
                      <th className="py-2 px-3">Diet</th>
                      <th className="py-2 px-3">Voucher Token</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedBatchModal.vouchers.map((v: any) => (
                      <tr key={v.voucherCode} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono font-bold text-gray-900">{v.empId}</td>
                        <td className="py-2 px-3 font-semibold">{v.empName}</td>
                        <td className="py-2 px-3 font-medium text-purple-700">{v.dietaryType}</td>
                        <td className="py-2 px-3 font-mono text-[#f43397] font-bold">{v.voucherCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCompletedBatchModal(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => handleDownloadBatchPdf(completedBatchModal)}
                className="px-5 py-2.5 bg-[#f43397] hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-pink-200"
              >
                <Download size={15} />
                <span>Download Team Meal Pass Roster (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

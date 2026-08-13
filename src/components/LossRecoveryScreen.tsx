import React from 'react';
import { AlertOctagon, TrendingDown, Clock, Banknote, PackageOpen, CheckCircle, Calculator, Download, CheckBadge, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const chartData = [
  { name: 'Admin Delays', loss: 7.5, fill: '#f97316' }, // orange-500
  { name: 'Labor Downtime', loss: 0.75, fill: '#a855f7' }, // purple-500
  { name: 'Tax Deductions', loss: 0.25, fill: '#10b981' }, // emerald-500
  { name: 'Order Backlog', loss: 4.5, fill: '#3b82f6' }, // blue-500
];

export function LossRecoveryScreen() {
  const handleDownloadCSV = () => {
    const csvContent = [
      "MEESHO WAREHOUSE MANAGEMENT SYSTEM - OFFICIAL REPORT",
      "LOSS BREAKDOWN & CORRECTIVE ACTION PLAN",
      "",
      "1. Administrative Approval Delays",
      "Loss Factor: 600 vehicles carrying warehouse stock were stranded outside the facility due to pending administrative approvals.",
      "Calculation: Loss_veh = 600 * 1,25,000 = Rs 7.5 Crore",
      "Root Cause: Manual gate-pass and entry approval bottlenecks combined with a lack of automated triage.",
      "Corrective Action: Implement an automated pre-approval digital workflow linked to vendor dispatch manifests. Establish an auto-approval protocol for trusted vendors once barcodes/RFID tags are scanned at the gate.",
      "",
      "2. Employee Stoppage & Labor Downtime (3 Days)",
      "Loss Factor: Warehouse packing and shipping staff remained idle for 3 days.",
      "Calculation: Loss_labor = (500 * 1,000 * 3) * 5 = Rs 0.75 Crore",
      "Root Cause: Poor synchronization between dock management, inventory intake, and shift scheduling.",
      "Corrective Action: Implement dynamic shift-scheduling and cross-training. Set up an early warning alert system to notify floor managers of stock shortages 24 hours in advance.",
      "",
      "3. Tax Deductions & Negative Treasury Balance (4 Hours)",
      "Loss Factor: Account balances plunged into the negative for 4 hours while Meesho executed scheduled tax deductions.",
      "Calculation: Loss_tax = 10,00,00,000 * 0.18 * (4/8760) + Rs 15L = Rs 0.25 Crore",
      "Root Cause: Lack of cash-flow buffer forecasting and misalignment between tax deduction schedules and operational cash liquidity cycles.",
      "Corrective Action: Maintain a dedicated automated cash reserve buffer in the Bank & Treasury module. Set up treasury threshold alerts.",
      "",
      "4. Order Packing & Inventory Gaps",
      "Loss Factor: Unprocessed inventory items, packing backlogs, and order fulfillment failures created cascading operational penalties.",
      "Calculation: Loss_backlog = (15,000 * 300) + Rs 4 Crore = Rs 4.5 Crore",
      "Root Cause: Systemic isolation between the Fulfillment & Shipping and Inventory tracking modules.",
      "Corrective Action: Automate inventory safety stock buffers to ensure packing lines have at least 48 hours of buffer stock. Integrate real-time tracking from scanners directly into the packing queue.",
      "",
      "Total Financial Impact Summary",
      "Total Loss (L_total) = SUM(L_veh + L_labor + L_tax + L_backlog)",
      "= (N_veh * C_avg) + (E_idle * W_daily * D_days * M_overhead) + (B_neg * r_annual * (t_hours/8760) + P_compliance) + (O_backlog * P_SLA + L_margin)",
      "= (600 * 1,25,000) + (500 * 1000 * 3 * 5) + (10,00,00,000 * 0.18 * (4/8760) + 15,00,000) + (15000 * 300 + 4,00,00,000)",
      "= Rs 7,50,00,000 + Rs 75,00,000 + Rs 25,00,000 + Rs 4,50,00,000",
      "= Rs 13,00,00,000 (13 Crore)",
      "",
      "VERIFIED BY: Insp. Rohit Jangra",
      "OFFICIAL SEAL: MEESHO WAREHOUSE"
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Meesho_Warehouse_Loss_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full shrink-0">
              <AlertOctagon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">Comprehensive Loss Breakdown, Root Causes, & Corrective Actions</h2>
            <p className="text-red-700 mt-2 text-sm leading-relaxed">
              Based on the operational disruptions at the Meesho Warehouse Management System (WMS), the total calculated financial impact is <span className="font-bold">₹13 Crore</span>. Below is the detailed breakdown of each contributing loss factor along with actionable corrective measures.
            </p>
          </div>
          </div>
          
          <button 
            onClick={handleDownloadCSV}
            className="shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Impact Distribution (in ₹ Crores)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tickFormatter={(value) => `₹${value}Cr`}
                 tick={{fill: '#6b7280', fontSize: 12}}
              />
              <Tooltip 
                formatter={(value) => [`₹${value} Crore`, 'Financial Loss']}
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
              />
              <Bar dataKey="loss" radius={[4, 4, 0, 0]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Administrative Approval Delays */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <Clock className="w-6 h-6" />
            <h3 className="text-lg font-bold text-gray-900">1. Administrative Approval Delays</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Loss Factor</h4>
            <p className="text-sm text-gray-600">600 vehicles carrying warehouse stock were stranded outside the facility due to pending administrative approvals, blocking incoming inventory and choking the supply chain pipeline.</p>
          </div>
          
          {/* Mathematical Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculation</h4>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <p>Variables:</p>
              <ul className="list-disc pl-4 mb-2">
                <li>V (Stranded vehicles) = 600</li>
                <li>C_veh (Cost/vehicle) = ₹1,25,000</li>
              </ul>
              <p>Loss_veh = V × C_veh</p>
              <p className="font-bold text-gray-800 mt-1">Loss_veh = 600 × 1,25,000 = ₹7.5 Crore</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">Root Cause</h4>
            <p className="text-sm text-gray-600">Manual gate-pass and entry approval bottlenecks combined with a lack of automated triage.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Corrective Action</h4>
            <ul className="text-sm text-green-900 space-y-2 list-disc pl-5">
              <li>Implement an automated pre-approval digital workflow linked to vendor dispatch manifests.</li>
              <li>Establish an auto-approval protocol for trusted vendors once barcodes/RFID tags are scanned at the gate.</li>
            </ul>
          </div>
        </div>

        {/* 2. Employee Stoppage & Labor Downtime */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 text-purple-600">
            <TrendingDown className="w-6 h-6" />
            <h3 className="text-lg font-bold text-gray-900">2. Employee Stoppage & Labor Downtime (3 Days)</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Loss Factor</h4>
            <p className="text-sm text-gray-600">Warehouse packing and shipping staff remained idle for 3 days because incoming vehicle stock was not received.</p>
          </div>

          {/* Mathematical Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculation</h4>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <p>Variables:</p>
              <ul className="list-disc pl-4 mb-2">
                <li>E (Employees) = ~500</li>
                <li>W (Daily wage/overhead) = ₹1,000/day</li>
                <li>D (Downtime) = 3 days</li>
                <li>M (Multiplier) = 5x</li>
              </ul>
              <p>Loss_labor = (E × W × D) × M</p>
              <p className="font-bold text-gray-800 mt-1">Loss_labor = (500 × 1,000 × 3) × 5 = ₹0.75 Crore (₹75 Lakh)</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">Root Cause</h4>
            <p className="text-sm text-gray-600">Poor synchronization between dock management, inventory intake, and shift scheduling.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Corrective Action</h4>
            <ul className="text-sm text-green-900 space-y-2 list-disc pl-5">
              <li>Implement dynamic shift-scheduling and cross-training so warehouse floor staff can be reassigned to secondary tasks.</li>
              <li>Set up an early warning alert system to notify floor managers of stock shortages 24 hours in advance.</li>
            </ul>
          </div>
        </div>

        {/* 3. Tax Deductions & Negative Treasury Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Banknote className="w-6 h-6" />
            <h3 className="text-lg font-bold text-gray-900">3. Tax Deductions & Negative Treasury Balance (4 Hours)</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Loss Factor</h4>
            <p className="text-sm text-gray-600">Account balances plunged into the negative for 4 hours while Meesho executed scheduled tax deductions concurrently with the operational shutdown.</p>
          </div>

          {/* Mathematical Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculation</h4>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <p>Variables:</p>
              <ul className="list-disc pl-4 mb-2">
                <li>B (Negative balance) = ₹10 Crore</li>
                <li>r (Interest rate) = 18% (0.18)</li>
                <li>t (Time in years) = 4 / 8,760</li>
              </ul>
              <p>Loss_tax = B × r × t + Penalties</p>
              <p className="font-bold text-gray-800 mt-1">Loss_tax = 10,00,00,000 × 0.18 × (4/8760) + ₹15L ≈ ₹0.25 Crore (₹25 Lakh)</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">Root Cause</h4>
            <p className="text-sm text-gray-600">Lack of cash-flow buffer forecasting and misalignment between tax deduction schedules and operational cash liquidity cycles.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Corrective Action</h4>
            <ul className="text-sm text-green-900 space-y-2 list-disc pl-5">
              <li>Maintain a dedicated automated cash reserve buffer in the Bank & Treasury module specifically for tax obligations.</li>
              <li>Set up treasury threshold alerts to prevent accounts from dipping below zero.</li>
            </ul>
          </div>
        </div>

        {/* 4. Order Packing & Inventory Gaps */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <PackageOpen className="w-6 h-6" />
            <h3 className="text-lg font-bold text-gray-900">4. Order Packing & Inventory Gaps</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Loss Factor</h4>
            <p className="text-sm text-gray-600">Unprocessed inventory items, packing backlogs, and order fulfillment failures created cascading operational penalties and missed SLAs.</p>
          </div>

          {/* Mathematical Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculation</h4>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <p>Variables:</p>
              <ul className="list-disc pl-4 mb-2">
                <li>O (Backlogged orders) = 15,000</li>
                <li>P (SLA penalty/order) = ₹300</li>
                <li>R (Margin loss) = ₹4 Crore</li>
              </ul>
              <p>Loss_backlog = (O × P) + Margin Impact</p>
              <p className="font-bold text-gray-800 mt-1">Loss_backlog = (15,000 × 300) + ₹4 Crore = ₹4.5 Crore</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">Root Cause</h4>
            <p className="text-sm text-gray-600">Systemic isolation between the Fulfillment & Shipping and Inventory tracking modules.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Corrective Action</h4>
            <ul className="text-sm text-green-900 space-y-2 list-disc pl-5">
              <li>Automate inventory safety stock buffers to ensure packing lines have at least 48 hours of buffer stock independent of immediate dock arrivals.</li>
              <li>Integrate real-time tracking from the Barcode & RFID scanners directly into the packing queue.</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-xl shadow-sm text-white">
        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
          <div>
            <h3 className="text-xl font-bold">Total Financial Impact Summary</h3>
            <p className="text-gray-300 text-sm mt-1">₹13 Crore - Requires immediate implementation of corrective actions across multiple modules.</p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
              <span className="text-2xl font-bold text-red-400">₹13 Cr</span>
              <span className="text-sm text-gray-400">Total Loss</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
          <p className="mb-4 text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-700 pb-2">Complete Mathematical Summary</p>
          <div className="space-y-2 whitespace-nowrap">
            <p><span className="text-blue-400">Total Loss (L_total)</span> = ∑(L_veh + L_labor + L_tax + L_backlog)</p>
            <p className="pl-4 text-gray-400">= (N_veh × C_avg) + (E_idle × W_daily × D_days × M_overhead) + (B_neg × r_annual × (4 / 8760) + P_compliance) + (O_backlog × P_SLA + L_margin)</p>
            <p className="pl-4 text-gray-400">= (600 × ₹1,25,000) + (500 × ₹1,000 × 3 × 5) + (₹10,00,00,000 × 0.18 × (4 / 8760) + ₹15,00,000) + (15,000 × ₹300 + ₹4,00,00,000)</p>
            <p className="pl-4 text-gray-400">= ₹7,50,00,000 + ₹75,00,000 + ₹25,00,000 + ₹4,50,00,000</p>
            <p className="pl-4 font-bold text-white text-lg mt-2 pt-2 border-t border-gray-700">= ₹13,00,00,000 <span className="text-red-400 ml-2">(₹13 Crore)</span></p>
          </div>
        </div>

        {/* Official Signature & Seal */}
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Verified By</p>
            <p className="text-lg font-serif text-white italic tracking-wide">Insp. Rohit Jangra</p>
            <p className="text-sm text-gray-400 mt-1">Lead Inspector, Quality & Operations</p>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-800 px-5 py-3 rounded-xl border border-gray-600">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Official Seal</p>
              <p className="text-sm text-white font-bold tracking-wide">MEESHO WAREHOUSE</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

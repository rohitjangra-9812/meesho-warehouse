import React, { useState } from 'react';
import { X, Download, Printer, ShieldCheck, QrCode, Building2, CheckCircle2, FileText } from 'lucide-react';
import { GstTaxInvoice } from '../types/reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GstInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: GstTaxInvoice | null;
  onSaveNew?: (newInvoice: any) => void;
}

export function GstInvoiceModal({ isOpen, onClose, invoice, onSaveNew }: GstInvoiceModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [buyerName, setBuyerName] = useState('Delhivery Supply Chain Solutions Ltd');
  const [buyerGstin, setBuyerGstin] = useState('29AAACD1029K1Z5');
  const [placeOfSupply, setPlaceOfSupply] = useState('29 - Karnataka');
  const [sacCode, setSacCode] = useState('SAC 9967');
  const [serviceDesc, setServiceDesc] = useState('Dedicated Warehousing Storage & 3PL Express Sorter Cross-Docking Tariff');
  const [taxableAmount, setTaxableAmount] = useState<number>(450000);

  if (!isOpen || !invoice) return null;

  const handleSacChange = (code: string) => {
    setSacCode(code);
    if (code === 'SAC 9965') {
      setServiceDesc('Goods Transport Agency (GTA) Freight Handling & 3PL Express Linehaul Carriage');
    } else if (code === 'SAC 9967') {
      setServiceDesc('Dedicated Warehousing Storage & 3PL Express Sorter Cross-Docking Tariff');
    } else if (code === 'SAC 9987') {
      setServiceDesc('High-speed Sorter Conveyor & Dock Leveler Annual Maintenance (AMC)');
    } else if (code === 'SAC 9963') {
      setServiceDesc('Industrial Staff Canteen Buffet Catering & Shift Meal Operations');
    } else if (code === 'HSN 4819') {
      setServiceDesc('3-Ply / 5-Ply Heavy-Duty Corrugated Kraft Shipping Cartons & Polybags');
    }
  };

  const handleGenerateCustom = () => {
    if (!buyerName || !taxableAmount) {
      alert('Please provide Buyer Name and Taxable Amount');
      return;
    }
    if (onSaveNew) {
      onSaveNew({
        buyerName,
        buyerGstin,
        placeOfSupply,
        sacCode,
        serviceDesc,
        taxableAmount
      });
      setIsCreating(false);
    }
  };

  const exportInvoicePdf = (inv: GstTaxInvoice) => {
    const doc = new jsPDF();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 36, 'F');
    
    doc.setTextColor(244, 51, 151); // pink-500
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEESHO ENTERPRISES PRIVATE LIMITED', 14, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('TAX INVOICE / E-INVOICE (RULE 48(4) OF CGST RULES)', 14, 22);
    doc.setTextColor(203, 213, 225);
    doc.text(`GSTIN: ${inv.sellerDetails.gstin} | State: ${inv.sellerDetails.state} (Code: ${inv.sellerDetails.stateCode})`, 14, 28);
    doc.text(`IRN: ${inv.irnNumber.substring(0, 38)}...`, 14, 33);

    // Meta Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 14, 46);
    doc.text(`Invoice Date: ${inv.invoiceDate}`, 14, 52);
    doc.text(`Place of Supply: ${inv.placeOfSupply}`, 14, 58);

    doc.text(`Ack No: ${inv.ackNumber}`, 120, 46);
    doc.text(`Due Date: ${inv.dueDate}`, 120, 52);
    doc.text(`Reverse Charge: ${inv.reverseCharge}`, 120, 58);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 62, 196, 62);

    // Seller & Buyer Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Details of Receiver (Billed To):', 14, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Name: ${inv.buyerDetails.legalName}`, 14, 76);
    doc.text(`GSTIN / UIN: ${inv.buyerDetails.gstin}`, 14, 81);
    doc.text(`Address: ${inv.buyerDetails.address.substring(0, 55)}`, 14, 86);
    doc.text(`State: ${inv.buyerDetails.state} (Code: ${inv.buyerDetails.stateCode})`, 14, 91);

    // Line Items Table
    const tableData = inv.lineItems.map(item => [
      item.itemNo,
      item.sacHsnCode,
      item.description,
      `INR ${item.taxableAmount.toLocaleString('en-IN')}`,
      inv.placeOfSupply.includes('29') ? `9% (₹${item.cgstAmount})` : '0%',
      inv.placeOfSupply.includes('29') ? `9% (₹${item.sgstAmount})` : '0%',
      inv.placeOfSupply.includes('29') ? '0%' : `18% (₹${item.igstAmount})`,
      `INR ${item.totalAmount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 98,
      head: [['#', 'SAC/HSN', 'Description of Services', 'Taxable Val', 'CGST', 'SGST', 'IGST', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [244, 51, 151], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 55 },
        7: { fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals Box
    doc.setFillColor(248, 250, 252);
    doc.rect(110, finalY, 86, 38, 'F');
    doc.rect(110, finalY, 86, 38, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Taxable Subtotal:`, 114, finalY + 8);
    doc.text(`INR ${inv.subTotalTaxable.toLocaleString('en-IN')}`, 192, finalY + 8, { align: 'right' });

    doc.text(`Total Tax (CGST+SGST+IGST):`, 114, finalY + 16);
    doc.text(`INR ${inv.totalTax.toLocaleString('en-IN')}`, 192, finalY + 16, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Grand Total (INR):`, 114, finalY + 28);
    doc.text(`INR ${inv.grandTotal.toLocaleString('en-IN')}`, 192, finalY + 28, { align: 'right' });

    // Bank Details
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank & Remittance Details:', 14, finalY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${inv.bankDetails.bankName}`, 14, finalY + 14);
    doc.text(`A/C No: ${inv.bankDetails.accountNumber} | IFSC: ${inv.bankDetails.ifscCode}`, 14, finalY + 19);
    doc.text(`Branch: ${inv.bankDetails.branch}`, 14, finalY + 24);

    // Terms
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Terms: E-Invoice digitally authenticated on NIC GST Portal. Input tax credit is available under Sec 16.', 14, finalY + 45);

    doc.save(`GST_Tax_Invoice_${inv.invoiceNumber.replace(/\//g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">GST B2B Tax Invoice & Compliance Document</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> IRN Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400">Rule 48(4) E-Invoice Standard • SAC & HSN Compliant Billing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition-colors"
            >
              {isCreating ? 'View Invoice Preview' : '+ Generate New Tax Invoice'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isCreating ? (
            <div className="bg-pink-50/40 p-6 rounded-2xl border border-pink-100 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Building2 size={16} className="text-pink-600" />
                  Generate New SAC/HSN B2B Tax Invoice
                </h4>
                <span className="text-xs text-gray-500">Karnataka Origin (GSTIN: 29AABCU9603R1ZM)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Buyer / 3PL Company Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g. Delhivery Supply Chain Solutions"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Buyer GSTIN Number</label>
                  <input
                    type="text"
                    value={buyerGstin}
                    onChange={(e) => setBuyerGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g. 29AAACD1029K1Z5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Service / Supply Classification (SAC / HSN)</label>
                  <select
                    value={sacCode}
                    onChange={(e) => handleSacChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="SAC 9967">SAC 9967 - Storage, Warehousing & Cargo Cross-Docking</option>
                    <option value="SAC 9965">SAC 9965 - Goods Transport Agency (GTA) Freight Carriage</option>
                    <option value="SAC 9987">SAC 9987 - Conveyor, Sorter & Equipment AMC Maintenance</option>
                    <option value="SAC 9963">SAC 9963 - Canteen & Industrial Food Catering Subsidy</option>
                    <option value="HSN 4819">HSN 4819 - Corrugated Kraft Boxes & Packaging Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Place of Supply (State / Interstate)</label>
                  <select
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="29 - Karnataka">29 - Karnataka (Intrastate: 9% CGST + 9% SGST)</option>
                    <option value="33 - Tamil Nadu">33 - Tamil Nadu (Interstate: 18% IGST)</option>
                    <option value="27 - Maharashtra">27 - Maharashtra (Interstate: 18% IGST)</option>
                    <option value="07 - Delhi NCR">07 - Delhi NCR (Interstate: 18% IGST)</option>
                    <option value="36 - Telangana">36 - Telangana (Interstate: 18% IGST)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Service Description / Line Item Remarks</label>
                  <input
                    type="text"
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Taxable Amount (INR Excl. GST)</label>
                  <input
                    type="number"
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-col justify-center">
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Computed Tax ({placeOfSupply.includes('29') ? 'CGST 9% + SGST 9%' : 'IGST 18%'}):</span>
                    <span className="font-bold text-gray-900">
                      ₹{Math.round((taxableAmount * 0.18)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm font-black text-pink-600 flex justify-between mt-1">
                    <span>Grand Total:</span>
                    <span>₹{Math.round((taxableAmount * 1.18)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCustom}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Generate Tax Invoice & IRN
                </button>
              </div>
            </div>
          ) : null}

          {/* Official Invoice Sheet */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6 print:border-none">
            
            {/* Header / IRN Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-200 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-gray-900">
                    meesho <span className="text-[#f43397] font-semibold text-lg">Logistics</span>
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono rounded font-bold">
                    E-INVOICE
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-700 mt-1">{invoice.sellerDetails.legalName}</p>
                <p className="text-[11px] text-gray-500">{invoice.sellerDetails.address}</p>
                <p className="text-[11px] font-mono font-bold text-gray-800">
                  GSTIN: {invoice.sellerDetails.gstin} | State: {invoice.sellerDetails.state} ({invoice.sellerDetails.stateCode})
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 text-right space-y-1 w-full md:w-auto">
                <p className="text-xs font-bold text-gray-500 uppercase">Invoice Number</p>
                <p className="text-sm font-black font-mono text-gray-900">{invoice.invoiceNumber}</p>
                <p className="text-[11px] text-gray-500">Date: <span className="font-semibold text-gray-700">{invoice.invoiceDate}</span></p>
                <p className="text-[11px] text-gray-500">Due Date: <span className="font-semibold text-gray-700">{invoice.dueDate}</span></p>
              </div>
            </div>

            {/* IRN Bar */}
            <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 font-mono overflow-hidden">
                <QrCode size={16} className="text-pink-400 shrink-0" />
                <span className="text-slate-400">IRN:</span>
                <span className="truncate text-pink-300 font-bold">{invoice.irnNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 shrink-0">
                <span>Ack No: <strong className="text-white font-mono">{invoice.ackNumber}</strong></span>
                <span>Ack Date: <strong className="text-white">{invoice.ackDate}</strong></span>
              </div>
            </div>

            {/* Seller vs Buyer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="space-y-1">
                <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Supplier / Originator</p>
                <p className="font-black text-gray-900">{invoice.sellerDetails.tradeName}</p>
                <p className="text-gray-600">CIN: {invoice.sellerDetails.cin} | PAN: {invoice.sellerDetails.pan}</p>
                <p className="text-gray-600">Email: {invoice.sellerDetails.email}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Billed To (Recipient / 3PL Partner)</p>
                <p className="font-black text-gray-900">{invoice.buyerDetails.legalName}</p>
                <p className="font-mono font-bold text-gray-800">GSTIN: {invoice.buyerDetails.gstin}</p>
                <p className="text-gray-600">{invoice.buyerDetails.address}</p>
                <p className="text-gray-600">Place of Supply: <strong className="text-gray-900">{invoice.placeOfSupply}</strong></p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-gray-200">
                    <th className="py-2.5 px-3 text-left">#</th>
                    <th className="py-2.5 px-3 text-left">SAC/HSN</th>
                    <th className="py-2.5 px-3 text-left">Description of Goods / Services</th>
                    <th className="py-2.5 px-3 text-right">Taxable Val</th>
                    <th className="py-2.5 px-3 text-center">CGST</th>
                    <th className="py-2.5 px-3 text-center">SGST</th>
                    <th className="py-2.5 px-3 text-center">IGST</th>
                    <th className="py-2.5 px-3 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80">
                      <td className="py-3 px-3 font-semibold text-gray-500">{item.itemNo}</td>
                      <td className="py-3 px-3 font-mono font-bold text-pink-600">{item.sacHsnCode}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{item.description}</p>
                        <p className="text-[11px] text-gray-500">Qty: {item.quantity} {item.unit}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-800">
                        ₹{item.taxableAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-600 font-mono">
                        {item.cgstRatePct > 0 ? `9% (₹${item.cgstAmount.toLocaleString('en-IN')})` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-600 font-mono">
                        {item.sgstRatePct > 0 ? `9% (₹${item.sgstAmount.toLocaleString('en-IN')})` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-600 font-mono">
                        {item.igstRatePct > 0 ? `18% (₹${item.igstAmount.toLocaleString('en-IN')})` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-gray-900">
                        ₹{item.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Bank Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Building2 size={14} className="text-slate-600" />
                  Bank Remittance Details
                </p>
                <p className="text-gray-600">Bank: <strong className="text-gray-900">{invoice.bankDetails.bankName}</strong></p>
                <p className="text-gray-600 font-mono">A/C: <strong className="text-gray-900">{invoice.bankDetails.accountNumber}</strong></p>
                <p className="text-gray-600 font-mono">IFSC: <strong className="text-gray-900">{invoice.bankDetails.ifscCode}</strong></p>
                <p className="text-[11px] text-gray-500">{invoice.bankDetails.branch}</p>
              </div>

              <div className="space-y-2 text-xs bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                <div className="flex justify-between text-gray-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-bold text-gray-900">₹{invoice.subTotalTaxable.toLocaleString('en-IN')}</span>
                </div>
                {invoice.totalCgst > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Central GST (CGST 9%):</span>
                    <span className="font-mono font-bold text-gray-900">₹{invoice.totalCgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {invoice.totalSgst > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>State GST (SGST 9%):</span>
                    <span className="font-mono font-bold text-gray-900">₹{invoice.totalSgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {invoice.totalIgst > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Integrated GST (IGST 18%):</span>
                    <span className="font-mono font-bold text-gray-900">₹{invoice.totalIgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-pink-200 flex justify-between text-sm font-black text-gray-900">
                  <span>Grand Total (INR):</span>
                  <span className="text-[#f43397] font-mono text-base">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-gray-500 italic mt-1">{invoice.grandTotalInWords}</p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 gap-4">
              <div>
                <p className="font-semibold text-gray-700">Declaration & Terms:</p>
                <p className="text-[11px]">Certified that the particulars given above are true and correct.</p>
              </div>
              <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                <p className="font-bold text-gray-900">For MEESHO ENTERPRISES PRIVATE LIMITED</p>
                <div className="h-10 flex items-center justify-end">
                  <span className="text-[10px] font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Digitally Signed (DSC)
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-gray-700">Authorized Signatory / Finance Controller</p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={15} />
              Print
            </button>
            <button
              onClick={() => exportInvoicePdf(invoice)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Download size={15} />
              Download Official PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import { 
  PnLTimeframeData, 
  GstTaxBreakdown, 
  GstTaxInvoice, 
  InboundOutboundAuditReport, 
  RtoReturnLossReport, 
  CanteenMealExpenseReport 
} from '../types/reports';

export function getPnLData(timeframe: 'Today' | 'Shift A' | 'Shift B' | 'Shift C' | 'Weekly' | 'Monthly' = 'Today'): PnLTimeframeData {
  let multiplier = 1;
  let periodLabel = 'Today (All Shifts: 06:00 - 24:00)';
  let ordersCount = 14280;
  let packageScanned = 18450;

  if (timeframe === 'Shift A') {
    multiplier = 0.42;
    periodLabel = 'Shift A (Morning 06:00 - 14:00)';
    ordersCount = 6120;
    packageScanned = 7850;
  } else if (timeframe === 'Shift B') {
    multiplier = 0.38;
    periodLabel = 'Shift B (Evening 14:00 - 22:00)';
    ordersCount = 5450;
    packageScanned = 6980;
  } else if (timeframe === 'Shift C') {
    multiplier = 0.20;
    periodLabel = 'Shift C (Night 22:00 - 06:00)';
    ordersCount = 2710;
    packageScanned = 3620;
  } else if (timeframe === 'Weekly') {
    multiplier = 6.8;
    periodLabel = 'Weekly (Past 7 Days)';
    ordersCount = 98450;
    packageScanned = 127800;
  } else if (timeframe === 'Monthly') {
    multiplier = 28.5;
    periodLabel = 'Monthly (MTD August 2026)';
    ordersCount = 412500;
    packageScanned = 538200;
  }

  // Base Daily Revenue (₹ 48,55,000 for full day)
  const baseRevenue = {
    orderFulfillmentFees: Math.round(1850000 * multiplier),
    shipping3PLIncome: Math.round(1680000 * multiplier),
    warehousingStorageCharges: Math.round(540000 * multiplier),
    packagingMaterialFees: Math.round(485000 * multiplier),
    returnHandlingFees: Math.round(300000 * multiplier),
  };
  const grossRevenue = Object.values(baseRevenue).reduce((a, b) => a + b, 0);

  // Base COGS (Carrier Dispatch Freight + Packaging Consumables)
  const cogsBreakdown = {
    carrierDispatchFreight: Math.round(1750000 * multiplier),
    packagingConsumables: Math.round(320000 * multiplier),
  };
  const totalCOGS = Object.values(cogsBreakdown).reduce((a, b) => a + b, 0);

  const grossProfit = grossRevenue - totalCOGS;
  const grossMarginPct = +((grossProfit / grossRevenue) * 100).toFixed(1);

  // Base Opex
  const opexBreakdown = {
    warehouseLaborOvertime: Math.round(840000 * multiplier),
    canteenSubsidies: Math.round(74256 * multiplier),
    conveyorDockMaintenance: Math.round(112000 * multiplier),
    electricityUtilityOverheads: Math.round(185000 * multiplier),
    techCloudSaaS: Math.round(45000 * multiplier),
  };
  const totalOpex = Object.values(opexBreakdown).reduce((a, b) => a + b, 0);

  const ebitda = grossProfit - totalOpex;
  const ebitdaMarginPct = +((ebitda / grossRevenue) * 100).toFixed(1);

  // Tax/Depr factor
  const deprAndTaxes = Math.round(120000 * multiplier);
  const netOperatingProfit = ebitda - deprAndTaxes;
  const netMarginPct = +((netOperatingProfit / grossRevenue) * 100).toFixed(1);

  const avgRevPerOrder = Math.round(grossRevenue / ordersCount);
  const avgCostPerOrder = Math.round((totalCOGS + totalOpex) / ordersCount);
  const avgProfitPerOrder = avgRevPerOrder - avgCostPerOrder;

  const topSkuUnitEconomics = [
    {
      sku: 'SKU-FASH-8812',
      name: 'Anarkali Kurti & Dupatta Set (Cotton)',
      category: 'Ethnic Fashion',
      ordersCount: Math.round(1450 * multiplier),
      sellingRevenue: Math.round(870000 * multiplier),
      fulfillmentCost: Math.round(188500 * multiplier),
      shippingCost: Math.round(319000 * multiplier),
      packagingCost: Math.round(43500 * multiplier),
      netProfit: Math.round(319000 * multiplier),
      marginPct: 36.7
    },
    {
      sku: 'SKU-ELEC-4419',
      name: 'TWS True Wireless Earbuds (IPX5)',
      category: 'Electronics',
      ordersCount: Math.round(980 * multiplier),
      sellingRevenue: Math.round(784000 * multiplier),
      fulfillmentCost: Math.round(127400 * multiplier),
      shippingCost: Math.round(245000 * multiplier),
      packagingCost: Math.round(39200 * multiplier),
      netProfit: Math.round(372400 * multiplier),
      marginPct: 47.5
    },
    {
      sku: 'SKU-HOME-1029',
      name: 'Stainless Steel Insulated Water Bottle (1L)',
      category: 'Home & Kitchen',
      ordersCount: Math.round(820 * multiplier),
      sellingRevenue: Math.round(410000 * multiplier),
      fulfillmentCost: Math.round(106600 * multiplier),
      shippingCost: Math.round(164000 * multiplier),
      packagingCost: Math.round(28700 * multiplier),
      netProfit: Math.round(110700 * multiplier),
      marginPct: 27.0
    },
    {
      sku: 'SKU-BEAU-3021',
      name: 'Vitamin C Brightening Face Serum (30ml)',
      category: 'Beauty & Personal Care',
      ordersCount: Math.round(1240 * multiplier),
      sellingRevenue: Math.round(496000 * multiplier),
      fulfillmentCost: Math.round(111600 * multiplier),
      shippingCost: Math.round(173600 * multiplier),
      packagingCost: Math.round(24800 * multiplier),
      netProfit: Math.round(186000 * multiplier),
      marginPct: 37.5
    },
    {
      sku: 'SKU-FOOT-9921',
      name: 'Mesh Lightweight Running Shoes (Men)',
      category: 'Footwear',
      ordersCount: Math.round(650 * multiplier),
      sellingRevenue: Math.round(585000 * multiplier),
      fulfillmentCost: Math.round(97500 * multiplier),
      shippingCost: Math.round(227500 * multiplier),
      packagingCost: Math.round(35750 * multiplier),
      netProfit: Math.round(224250 * multiplier),
      marginPct: 38.3
    }
  ];

  const hourlyTrends = [
    { timeSlot: '06:00 - 09:00', revenue: Math.round(850000 * multiplier), opex: Math.round(420000 * multiplier), netProfit: Math.round(430000 * multiplier), marginPct: 50.5 },
    { timeSlot: '09:00 - 12:00', revenue: Math.round(1350000 * multiplier), opex: Math.round(710000 * multiplier), netProfit: Math.round(640000 * multiplier), marginPct: 47.4 },
    { timeSlot: '12:00 - 15:00', revenue: Math.round(1120000 * multiplier), opex: Math.round(650000 * multiplier), netProfit: Math.round(470000 * multiplier), marginPct: 41.9 },
    { timeSlot: '15:00 - 18:00', revenue: Math.round(980000 * multiplier), opex: Math.round(580000 * multiplier), netProfit: Math.round(400000 * multiplier), marginPct: 40.8 },
    { timeSlot: '18:00 - 21:00', revenue: Math.round(840000 * multiplier), opex: Math.round(490000 * multiplier), netProfit: Math.round(350000 * multiplier), marginPct: 41.6 },
    { timeSlot: '21:00 - 24:00', revenue: Math.round(520000 * multiplier), opex: Math.round(310000 * multiplier), netProfit: Math.round(210000 * multiplier), marginPct: 40.3 },
  ];

  return {
    timeframe,
    periodLabel,
    totalOrdersFulfilled: ordersCount,
    totalPackagesScanned: packageScanned,
    grossRevenue,
    totalCOGS,
    grossProfit,
    grossMarginPct,
    totalOpex,
    ebitda,
    ebitdaMarginPct,
    netOperatingProfit,
    netMarginPct,
    unitEconomics: {
      avgRevenuePerOrder: avgRevPerOrder,
      avgCostPerOrder: avgCostPerOrder,
      avgProfitPerOrder: avgProfitPerOrder,
      avgWeightKg: 0.68
    },
    revenueBreakdown: baseRevenue,
    cogsBreakdown,
    opexBreakdown,
    topSkuUnitEconomics,
    hourlyTrends
  };
}

export function getGstComplianceData(): GstTaxBreakdown {
  return {
    currentMonth: 'August 2026',
    gstin: '29AABCU9603R1ZM',
    legalName: 'MEESHO ENTERPRISES PRIVATE LIMITED',
    tradeName: 'Meesho Mega Logistics & Fulfillment Center Hub-04',
    stateCode: '29 - Karnataka',
    placeOfSupply: '29 - Karnataka (Intrastate) & PAN India (Interstate)',
    grossTaxableValue: 12480000,
    outputGst: {
      cgst: 561600, // 9% on Karnataka Intrastate ₹62,40,000
      sgst: 561600, // 9% on Karnataka Intrastate ₹62,40,000
      igst: 1123200, // 18% on Interstate outward logistics ₹62,40,000
      total: 2246400
    },
    inputTaxCredit: {
      cgst: 348200,
      sgst: 348200,
      igst: 684400,
      total: 1380800,
      itcEligibleTotal: 1380800,
      itcIneligibleBlocked: 42000 // Under Section 17(5) food catering non-opt
    },
    netTaxPayable: {
      cgst: 213400,
      sgst: 213400,
      igst: 438800,
      total: 865600,
      isPaid: false,
      challanRef: 'CPIN-8894102',
      paidAt: null
    },
    gstr1Summary: {
      status: 'Ready to File',
      dueDate: '11 Sep 2026',
      b2bInvoicesCount: 42,
      b2bTaxableValue: 4850000,
      b2bTaxAmount: 873000,
      b2cInvoicesCount: 14238,
      b2cTaxableValue: 7630000,
      b2cTaxAmount: 1373400,
      totalInvoices: 14280,
      hsnSacSummaryCount: 6
    },
    gstr3bSummary: {
      status: 'Draft Reconciled',
      dueDate: '20 Sep 2026',
      outwardTaxableSupplies: 12480000,
      eligibleItc: 1380800,
      ineligibleItc17_5: 42000,
      netTaxSettled: 865600,
      challanStatus: 'Pending Payment'
    },
    vendorInvoices: [
      {
        id: 'VINV-001',
        invoiceNo: 'DEL/26-27/0892',
        vendorName: 'Delhivery Surface Logistics Ltd',
        vendorGstin: '07AAACD5678Q1Z2',
        category: '3PL Surface Freight',
        sacHsnCode: 'SAC 9965',
        serviceDesc: 'Goods Transport Agency Interstate Express Hub Haulage',
        invoiceDate: '2026-08-18',
        taxableAmount: 2450000,
        cgst: 0,
        sgst: 0,
        igst: 441000,
        totalAmount: 2891000,
        itcEligibility: 'Eligible 100%',
        itcClaimStatus: 'Claimed in 3B'
      },
      {
        id: 'VINV-002',
        invoiceNo: 'XPB/BLR/4410',
        vendorName: 'Xpressbees Logistics Solutions',
        vendorGstin: '27AABCX4123K1ZT',
        category: '3PL Air Linehaul',
        sacHsnCode: 'SAC 9965',
        serviceDesc: 'Expedited Priority Air Cargo Cargo Handling',
        invoiceDate: '2026-08-16',
        taxableAmount: 1850000,
        cgst: 0,
        sgst: 0,
        igst: 333000,
        totalAmount: 2183000,
        itcEligibility: 'Eligible 100%',
        itcClaimStatus: 'Claimed in 3B'
      },
      {
        id: 'VINV-003',
        invoiceNo: 'APX/PKG/2026/89',
        vendorName: 'Apex Corrugated Packaging Industries',
        vendorGstin: '29AABCA8841M1ZY',
        category: 'Corrugated Cartons & Polybags',
        sacHsnCode: 'HSN 4819',
        serviceDesc: '3-Ply/5-Ply Kraft Corrugated Boxes & Void Fill',
        invoiceDate: '2026-08-14',
        taxableAmount: 850000,
        cgst: 76500,
        sgst: 76500,
        igst: 0,
        totalAmount: 1003000,
        itcEligibility: 'Eligible 100%',
        itcClaimStatus: 'Claimed in 3B'
      },
      {
        id: 'VINV-004',
        invoiceNo: 'SSC/MEE/AUG-01',
        vendorName: 'Shiv Shakti Food Caterers',
        vendorGstin: '29AABCS9912P1ZV',
        category: 'Warehouse Canteen Meals',
        sacHsnCode: 'SAC 9963',
        serviceDesc: 'Industrial Staff Canteen Buffet & High Tea Subsidy',
        invoiceDate: '2026-08-12',
        taxableAmount: 412000,
        cgst: 10300,
        sgst: 10300,
        igst: 0,
        totalAmount: 432600,
        itcEligibility: 'Blocked Sec 17(5)',
        itcClaimStatus: 'Ineligible'
      },
      {
        id: 'VINV-005',
        invoiceNo: 'ABB/ROB/SER-22',
        vendorName: 'ABB Robotics & Automation India',
        vendorGstin: '29AAACA4199L1ZU',
        category: 'Dock & Conveyor Maintenance',
        sacHsnCode: 'SAC 9987',
        serviceDesc: 'High-speed Cross-belt Sorter & Dock Leveler Annual AMC',
        invoiceDate: '2026-08-10',
        taxableAmount: 320000,
        cgst: 28800,
        sgst: 28800,
        igst: 0,
        totalAmount: 377600,
        itcEligibility: 'Eligible 100%',
        itcClaimStatus: 'Claimed in 3B'
      }
    ]
  };
}

export function generateSampleTaxInvoice(invoiceNo?: string, buyerGstin?: string, buyerName?: string, sacCode?: string, taxableVal?: number, isInterstate = false): GstTaxInvoice {
  const invNum = invoiceNo || `MEE/INV/2026-27/${Math.floor(1000 + Math.random() * 9000)}`;
  const taxable = taxableVal || 350000;
  const sac = sacCode || 'SAC 9967';
  
  let cgstRate = isInterstate ? 0 : 9;
  let sgstRate = isInterstate ? 0 : 9;
  let igstRate = isInterstate ? 18 : 0;
  let cgstAmt = isInterstate ? 0 : Math.round((taxable * 9) / 100);
  let sgstAmt = isInterstate ? 0 : Math.round((taxable * 9) / 100);
  let igstAmt = isInterstate ? Math.round((taxable * 18) / 100) : 0;
  let totalTax = cgstAmt + sgstAmt + igstAmt;
  let grandTotal = taxable + totalTax;

  let sacDescription = 'Warehousing, Cold Chain & Inventory Storage Space Tariff';
  if (sac === 'SAC 9965') {
    sacDescription = 'Goods Transport Agency (GTA) Freight Handling & 3PL Express Forward Carriage';
  } else if (sac === 'SAC 9987') {
    sacDescription = 'Conveyor, Barcode Scanners & Material Handling Equipment AMC Services';
  } else if (sac === 'SAC 9963') {
    sacDescription = 'Industrial Outdoor Catering & Staff Meal Processing Services';
  } else if (sac === 'HSN 4819') {
    sacDescription = 'Cartons, Boxes & Cases of Corrugated Paper or Paperboard Supplies';
  }

  return {
    invoiceNumber: invNum,
    irnNumber: 'b281f9a08e64c2459a93ef090d8102fae8810294e823f9901ad47a834e00192a',
    ackNumber: '112609823419082',
    ackDate: new Date().toISOString().split('T')[0],
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    supplyType: 'B2B Regular',
    reverseCharge: 'No',
    placeOfSupply: isInterstate ? '33 - Tamil Nadu' : '29 - Karnataka',
    sellerDetails: {
      legalName: 'MEESHO ENTERPRISES PRIVATE LIMITED',
      tradeName: 'Meesho Mega Logistics & Fulfillment Center Hub-04',
      gstin: '29AABCU9603R1ZM',
      address: 'Plot No. 44-48, KIADB Industrial Area, Hoskote, Bengaluru, Karnataka - 562114',
      state: 'Karnataka',
      stateCode: '29',
      pan: 'AABCU9603R',
      cin: 'U72900KA2015PTC082449',
      email: 'wms.billing@meesho.com',
      phone: '+91 80 6192 0000'
    },
    buyerDetails: {
      legalName: buyerName || 'DELHIVERY SUPPLY CHAIN SOLUTIONS LTD',
      tradeName: buyerName || 'Delhivery Supply Chain Solutions',
      gstin: buyerGstin || (isInterstate ? '33AAACD1029K1ZR' : '29AAACD1029K1Z5'),
      address: isInterstate ? 'Plot 12, SIPCOT Industrial Park, Sriperumbudur, Tamil Nadu - 602105' : 'No. 88, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka - 560100',
      state: isInterstate ? 'Tamil Nadu' : 'Karnataka',
      stateCode: isInterstate ? '33' : '29',
      contactPerson: 'Mr. Arvind Swamy (Logistics Lead)',
      phone: '+91 98450 11223'
    },
    lineItems: [
      {
        itemNo: 1,
        sacHsnCode: sac,
        description: sacDescription,
        quantity: 1,
        unit: 'Lump Sum (LS)',
        unitPrice: taxable,
        taxableAmount: taxable,
        taxRatePct: 18,
        cgstRatePct: cgstRate,
        cgstAmount: cgstAmt,
        sgstRatePct: sgstRate,
        sgstAmount: sgstAmt,
        igstRatePct: igstRate,
        igstAmount: igstAmt,
        totalAmount: grandTotal
      }
    ],
    subTotalTaxable: taxable,
    totalCgst: cgstAmt,
    totalSgst: sgstAmt,
    totalIgst: igstAmt,
    totalTax: totalTax,
    grandTotal: grandTotal,
    grandTotalInWords: convertNumberToWords(grandTotal),
    bankDetails: {
      bankName: 'State Bank of India (Corporate Escrow)',
      accountNumber: '40918820019284',
      ifscCode: 'SBIN0004133',
      branch: 'Hoskote Industrial Finance Branch, Bengaluru'
    },
    termsAndConditions: [
      '1. Payment must be cleared within 15 days of invoice date via RTGS/NEFT.',
      '2. Subject to Karnataka jurisdiction only.',
      '3. GST input credit is automatically reported to GSTN under Section 37 (GSTR-1).',
      '4. E-Invoice digitally authenticated with IRN & QR Code compliant with Rule 48(4) of CGST Rules.'
    ]
  };
}

export function getInboundOutboundAuditData(): InboundOutboundAuditReport {
  return {
    period: 'Current Month (Aug 2026)',
    totalInboundShipments: 184,
    totalAcceptedQuantity: 184520,
    totalDamagedQuantity: 642,
    totalDiscrepancyQty: 189,
    acceptedGoodsValuation: 83034000,
    damagedGoodsValuation: 288900,
    dockDetentionCases: 14,
    totalDemurrageCosts: 84000,
    auditItems: [
      {
        shipmentId: 'INB-SHP-8819',
        vehicleNo: 'KA-51-AA-9901',
        carrier: 'Delhivery Surface',
        dockBay: 'Dock Bay 02',
        category: 'Ethnic Wear Textiles',
        manifestQty: 2500,
        receivedQty: 2500,
        acceptedQty: 2488,
        damagedQty: 12,
        varianceQty: 0,
        varianceValue: 5400,
        dockDwellMinutes: 95,
        demurrageCharges: 0,
        qcAuditor: 'Sunil Yadav (Sr. QC)',
        status: 'Damage Claim Lodged'
      },
      {
        shipmentId: 'INB-SHP-8822',
        vehicleNo: 'HR-38-CD-4102',
        carrier: 'Xpressbees Linehaul',
        dockBay: 'Dock Bay 04',
        category: 'Consumer Electronics & TWS',
        manifestQty: 1200,
        receivedQty: 1192,
        acceptedQty: 1190,
        damagedQty: 2,
        varianceQty: -8,
        varianceValue: 12800,
        dockDwellMinutes: 185,
        demurrageCharges: 7500,
        qcAuditor: 'Pooja Nair (Dock QC)',
        status: 'Variance Investigated'
      },
      {
        shipmentId: 'INB-SHP-8830',
        vehicleNo: 'MH-12-EF-7721',
        carrier: 'Shadowfax 3PL',
        dockBay: 'Dock Bay 07',
        category: 'Kitchenware & Cookware',
        manifestQty: 3200,
        receivedQty: 3200,
        acceptedQty: 3200,
        damagedQty: 0,
        varianceQty: 0,
        varianceValue: 0,
        dockDwellMinutes: 110,
        demurrageCharges: 0,
        qcAuditor: 'Mahesh Rawat',
        status: 'Verified Clear'
      },
      {
        shipmentId: 'INB-SHP-8845',
        vehicleNo: 'DL-01-GH-3341',
        carrier: 'Ecom Express Priority',
        dockBay: 'Dock Bay 09',
        category: 'Beauty & Skincare',
        manifestQty: 4500,
        receivedQty: 4500,
        acceptedQty: 4465,
        damagedQty: 35,
        varianceQty: 0,
        varianceValue: 14000,
        dockDwellMinutes: 240,
        demurrageCharges: 12000,
        qcAuditor: 'Rohan Gupta',
        status: 'Demurrage Billed'
      }
    ]
  };
}

export function getRtoReturnLossData(): RtoReturnLossReport {
  return {
    period: 'Current Month (Aug 2026)',
    totalRtoReceived: 2180,
    totalRtoValue: 1635000,
    reverseLogisticsFreightCost: 327000,
    liquidationScrapRecovery: 245000,
    carrierSlaPenaltiesDeducted: 82500,
    netReturnFinancialLeakage: 399500,
    rtoCategoryBreakdown: [
      {
        reason: 'Customer Refusal at Doorstep (Cash on Delivery / COD)',
        count: 1120,
        grossValue: 840000,
        freightLost: 168000,
        recoveryValue: 790000,
        netLoss: 168000,
        pctOfTotal: 51.4
      },
      {
        reason: 'Transit Packaging Crushed / Box Damaged',
        count: 480,
        grossValue: 360000,
        freightLost: 72000,
        recoveryValue: 120000,
        netLoss: 240000,
        pctOfTotal: 22.0
      },
      {
        reason: 'Wrong SKU / Color / Size Mismatch in Packet',
        count: 360,
        grossValue: 270000,
        freightLost: 54000,
        recoveryValue: 250000,
        netLoss: 54000,
        pctOfTotal: 16.5
      },
      {
        reason: 'Delivery Delay beyond Promised ETA SLA (>5 days)',
        count: 220,
        grossValue: 165000,
        freightLost: 33000,
        recoveryValue: 155000,
        netLoss: 33000,
        pctOfTotal: 10.1
      }
    ],
    carrierPerformanceSla: [
      {
        carrier: 'Delhivery Surface',
        rtoDeliveries: 980,
        onTimePct: 96.4,
        damagedInTransitPct: 1.2,
        slaPenaltyAmount: 24500,
        status: 'Compliant'
      },
      {
        carrier: 'Xpressbees Express',
        rtoDeliveries: 640,
        onTimePct: 94.1,
        damagedInTransitPct: 2.4,
        slaPenaltyAmount: 38000,
        status: 'Warning'
      },
      {
        carrier: 'Shadowfax Logistics',
        rtoDeliveries: 560,
        onTimePct: 92.8,
        damagedInTransitPct: 3.1,
        slaPenaltyAmount: 20000,
        status: 'Penalty Applied'
      }
    ]
  };
}

export function getCanteenMealExpenseData(): CanteenMealExpenseReport {
  return {
    period: 'Current Month (Aug 2026)',
    totalMealsServed: 24800,
    totalGrossCost: 1612000,
    companySubsidyPaid: 1289600,
    employeePayrollDeducted: 322400,
    vendorName: 'Shiv Shakti Food Caterers Pvt Ltd',
    vendorGstin: '29AABCS9912P1ZV',
    vendorTotalPayout: 1612000,
    vendorGstPaid: 80600,
    shiftWiseExpenses: [
      {
        shift: 'Shift A (Morning 06:00 - 14:00)',
        hours: '06:00 - 14:00',
        vegMeals: 7800,
        nonVegMeals: 2400,
        teaSnacks: 3200,
        totalPlates: 10200,
        grossCost: 663000,
        companySubsidy: 530400,
        employeePay: 132600
      },
      {
        shift: 'Shift B (Evening 14:00 - 22:00)',
        hours: '14:00 - 22:00',
        vegMeals: 6900,
        nonVegMeals: 2100,
        teaSnacks: 2800,
        totalPlates: 9000,
        grossCost: 585000,
        companySubsidy: 468000,
        employeePay: 117000
      },
      {
        shift: 'Shift C (Night 22:00 - 06:00)',
        hours: '22:00 - 06:00',
        vegMeals: 4200,
        nonVegMeals: 1400,
        teaSnacks: 1900,
        totalPlates: 5600,
        grossCost: 364000,
        companySubsidy: 291200,
        employeePay: 72800
      }
    ],
    mealSlotReconciliation: [
      {
        slot: 'Breakfast / Morning High Tea',
        ratePerPlate: 35,
        companySubsidyPerPlate: 28,
        empPayPerPlate: 7,
        vouchersIssued: 5200,
        vouchersRedeemed: 5090,
        redemptionRatePct: 97.8,
        reconciledCost: 178150
      },
      {
        slot: 'Grand Buffet Lunch (Veg & Non-Veg)',
        ratePerPlate: 65,
        companySubsidyPerPlate: 52,
        empPayPerPlate: 13,
        vouchersIssued: 11500,
        vouchersRedeemed: 11340,
        redemptionRatePct: 98.6,
        reconciledCost: 737100
      },
      {
        slot: 'Evening Snacks & Masala Chai',
        ratePerPlate: 30,
        companySubsidyPerPlate: 24,
        empPayPerPlate: 6,
        vouchersIssued: 4800,
        vouchersRedeemed: 4680,
        redemptionRatePct: 97.5,
        reconciledCost: 140400
      },
      {
        slot: 'Dinner & Night Shift Midnight Refreshment',
        ratePerPlate: 65,
        companySubsidyPerPlate: 52,
        empPayPerPlate: 13,
        vouchersIssued: 8500,
        vouchersRedeemed: 8320,
        redemptionRatePct: 97.8,
        reconciledCost: 540800
      }
    ]
  };
}

function convertNumberToWords(amount: number): string {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero Rupees Only';

  function numToWords(n: number): string {
    if (n < 20) return words[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + words[n % 10] : '');
    if (n < 1000) return words[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '');
  }

  return 'INR ' + numToWords(Math.floor(amount)) + ' Rupees Only';
}

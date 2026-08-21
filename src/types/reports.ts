export interface PnLTimeframeData {
  timeframe: 'Today' | 'Shift A' | 'Shift B' | 'Shift C' | 'Weekly' | 'Monthly';
  periodLabel: string;
  totalOrdersFulfilled: number;
  totalPackagesScanned: number;
  grossRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossMarginPct: number;
  totalOpex: number;
  ebitda: number;
  ebitdaMarginPct: number;
  netOperatingProfit: number;
  netMarginPct: number;
  unitEconomics: {
    avgRevenuePerOrder: number;
    avgCostPerOrder: number;
    avgProfitPerOrder: number;
    avgWeightKg: number;
  };
  revenueBreakdown: {
    orderFulfillmentFees: number;
    shipping3PLIncome: number;
    warehousingStorageCharges: number;
    packagingMaterialFees: number;
    returnHandlingFees: number;
  };
  cogsBreakdown: {
    carrierDispatchFreight: number; // Delhivery, Xpressbees, Shadowfax
    packagingConsumables: number; // Boxes, tape, labels
  };
  opexBreakdown: {
    warehouseLaborOvertime: number; // Pickers, Packers, Dock wages
    canteenSubsidies: number; // Company meal subsidies
    conveyorDockMaintenance: number; // Conveyor/scanners repair amort
    electricityUtilityOverheads: number; // Grid power, diesel genset
    techCloudSaaS: number; // WMS server, barcode scanners SaaS
  };
  topSkuUnitEconomics: Array<{
    sku: string;
    name: string;
    category: string;
    ordersCount: number;
    sellingRevenue: number;
    fulfillmentCost: number;
    shippingCost: number;
    packagingCost: number;
    netProfit: number;
    marginPct: number;
  }>;
  hourlyTrends: Array<{
    timeSlot: string;
    revenue: number;
    opex: number;
    netProfit: number;
    marginPct: number;
  }>;
}

export interface GstTaxBreakdown {
  currentMonth: string;
  gstin: string;
  legalName: string;
  tradeName: string;
  stateCode: string;
  placeOfSupply: string;
  grossTaxableValue: number;
  outputGst: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  inputTaxCredit: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    itcEligibleTotal: number;
    itcIneligibleBlocked: number;
  };
  netTaxPayable: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    isPaid: boolean;
    challanRef?: string | null;
    paidAt?: string | null;
  };
  gstr1Summary: {
    status: string;
    dueDate: string;
    b2bInvoicesCount: number;
    b2bTaxableValue: number;
    b2bTaxAmount: number;
    b2cInvoicesCount: number;
    b2cTaxableValue: number;
    b2cTaxAmount: number;
    totalInvoices: number;
    hsnSacSummaryCount: number;
  };
  gstr3bSummary: {
    status: string;
    dueDate: string;
    outwardTaxableSupplies: number;
    eligibleItc: number;
    ineligibleItc17_5: number;
    netTaxSettled: number;
    challanStatus: string;
  };
  vendorInvoices: Array<{
    id: string;
    invoiceNo: string;
    vendorName: string;
    vendorGstin: string;
    category: string;
    sacHsnCode: string;
    serviceDesc: string;
    invoiceDate: string;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    itcEligibility: 'Eligible 100%' | 'Blocked Sec 17(5)' | 'Partially Eligible';
    itcClaimStatus: 'Claimed in 3B' | 'Pending GSTR-2B Match' | 'Ineligible';
  }>;
}

export interface GstTaxInvoice {
  invoiceNumber: string;
  irnNumber: string;
  ackNumber: string;
  ackDate: string;
  invoiceDate: string;
  dueDate: string;
  supplyType: 'B2B Regular' | 'SEZ with Payment' | 'Export';
  reverseCharge: 'Yes' | 'No';
  placeOfSupply: string;
  sellerDetails: {
    legalName: string;
    tradeName: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
    pan: string;
    cin: string;
    email: string;
    phone: string;
  };
  buyerDetails: {
    legalName: string;
    tradeName: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
    contactPerson: string;
    phone: string;
  };
  lineItems: Array<{
    itemNo: number;
    sacHsnCode: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxableAmount: number;
    taxRatePct: number;
    cgstRatePct: number;
    cgstAmount: number;
    sgstRatePct: number;
    sgstAmount: number;
    igstRatePct: number;
    igstAmount: number;
    totalAmount: number;
  }>;
  subTotalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  grandTotal: number;
  grandTotalInWords: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  termsAndConditions: string[];
}

export interface InboundOutboundAuditReport {
  period: string;
  totalInboundShipments: number;
  totalAcceptedQuantity: number;
  totalDamagedQuantity: number;
  totalDiscrepancyQty: number;
  acceptedGoodsValuation: number;
  damagedGoodsValuation: number;
  dockDetentionCases: number;
  totalDemurrageCosts: number;
  auditItems: Array<{
    shipmentId: string;
    vehicleNo: string;
    carrier: string;
    dockBay: string;
    category: string;
    manifestQty: number;
    receivedQty: number;
    acceptedQty: number;
    damagedQty: number;
    varianceQty: number;
    varianceValue: number;
    dockDwellMinutes: number;
    demurrageCharges: number;
    qcAuditor: string;
    status: 'Verified Clear' | 'Damage Claim Lodged' | 'Demurrage Billed' | 'Variance Investigated';
  }>;
}

export interface RtoReturnLossReport {
  period: string;
  totalRtoReceived: number;
  totalRtoValue: number;
  reverseLogisticsFreightCost: number;
  liquidationScrapRecovery: number;
  carrierSlaPenaltiesDeducted: number;
  netReturnFinancialLeakage: number;
  rtoCategoryBreakdown: Array<{
    reason: string;
    count: number;
    grossValue: number;
    freightLost: number;
    recoveryValue: number;
    netLoss: number;
    pctOfTotal: number;
  }>;
  carrierPerformanceSla: Array<{
    carrier: string;
    rtoDeliveries: number;
    onTimePct: number;
    damagedInTransitPct: number;
    slaPenaltyAmount: number;
    status: 'Compliant' | 'Warning' | 'Penalty Applied';
  }>;
}

export interface CanteenMealExpenseReport {
  period: string;
  totalMealsServed: number;
  totalGrossCost: number;
  companySubsidyPaid: number;
  employeePayrollDeducted: number;
  vendorName: string;
  vendorGstin: string;
  vendorTotalPayout: number;
  vendorGstPaid: number;
  shiftWiseExpenses: Array<{
    shift: string;
    hours: string;
    vegMeals: number;
    nonVegMeals: number;
    teaSnacks: number;
    totalPlates: number;
    grossCost: number;
    companySubsidy: number;
    employeePay: number;
  }>;
  mealSlotReconciliation: Array<{
    slot: string;
    ratePerPlate: number;
    companySubsidyPerPlate: number;
    empPayPerPlate: number;
    vouchersIssued: number;
    vouchersRedeemed: number;
    redemptionRatePct: number;
    reconciledCost: number;
  }>;
}

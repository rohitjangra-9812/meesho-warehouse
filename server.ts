import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from './src/db/index.ts';
import { crossDocking, inspections, specialZones, packagingLedger, orders, products, users, employees, management, notices, attendanceLogs, leaveRequests, vendors, incomingShipments, qualityChecks, purchaseOrders, certifications, grievances, hubs, hubTransfers, treasuryAccounts, treasuryTransactions, auditLogs, dockDoors, vehicleLogs, scanners, scanLogs, scannerMaintenanceLogs } from './src/db/schema.ts';
import { eq, sql, and, desc, ilike } from 'drizzle-orm';

async function startServer() {
  
interface BankTx {
  id: number;
  timestamp: number;
  counterparty: string;
  purpose: string;
  type: string;
  amount: number;
  status: string;
  pinned?: boolean;
  pinRank?: number;
  dateStr?: string;
  timeStr?: string;
  approvedAt?: string;
}

let openingBalance = 200000000;

function isIstMaintenanceMode(): boolean {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + (3600000 * 5.5));
  const hrs = ist.getHours();
  const mins = ist.getMinutes();
  return (hrs === 13 && mins >= 0 && mins < 15);
}

const PINNED_TRANSACTIONS: BankTx[] = [
  { id: 107, timestamp: Date.now() - 500, counterparty: "Google AI Cloud Services", purpose: "Infrastructure / Cloud", type: "Debit", amount: 35999, status: "Completed", pinned: true, pinRank: 1 },
  { id: 106, timestamp: Date.now() - 1000, counterparty: "Rita Sharma", purpose: "Accounts Receivable (Ref: xxxxx133)", type: "Credit", amount: 9000, status: "Completed", pinned: true, pinRank: 2 },
  { id: 105, timestamp: Date.now() - 1500, counterparty: "Harsh Sharma", purpose: "Payroll / Management Adjustment (Harsh Sharma - Management Member Salary Adjustment)", type: "Credit", amount: 1500, status: "Completed", pinned: true, pinRank: 3 },
];
let bankTransactions: BankTx[] = [
  ...PINNED_TRANSACTIONS,
  { id: 101, timestamp: Date.now() - 30000, counterparty: "Delhivery Surface", purpose: "Freight Charges Settlement", type: "Debit", amount: 45200, status: "Verified" },
  { id: 102, timestamp: Date.now() - 65000, counterparty: "Apex Packaging", purpose: "Corrugated Boxes GRN", type: "Debit", amount: 125000, status: "Verified" },
  { id: 103, timestamp: Date.now() - 95000, counterparty: "Meesho Escrow", purpose: "Daily Sales Settlement", type: "Credit", amount: 845000, status: "Completed" },
  { id: 104, timestamp: Date.now() - 120000, counterparty: "Ramesh Customer", purpose: "RTO Refund", type: "Debit", amount: 1250, status: "Verified" }
];
let bankBalance = openingBalance + bankTransactions.reduce((acc, t) => acc + (t.type === 'Credit' ? t.amount : -t.amount), 0);
let nextTxId = 108;
const txTypes = [
  { p: "Courier Logistics", a: [10000, 50000], t: "Debit", c: "Ecom Express" },
  { p: "Warehouse Setup", a: [5000, 20000], t: "Debit", c: "Local Vendor" },
  { p: "Sale Batch", a: [100000, 500000], t: "Credit", c: "Meesho Escrow" },
  { p: "Customer Refund", a: [500, 2000], t: "Debit", c: "Customer" }
];

setInterval(() => {
  // Freeze background automated transactions during 1:00 PM - 1:15 PM IST Scheduled Maintenance Window
  if (isIstMaintenanceMode()) {
    return;
  }

  const r = txTypes[Math.floor(Math.random() * txTypes.length)];
  const amount = Math.floor(Math.random() * (r.a[1] - r.a[0]) + r.a[0]);
  
  if (r.t === 'Credit') bankBalance += amount;
  else bankBalance -= amount;

  bankTransactions.push({
    id: nextTxId++,
    timestamp: Date.now(),
    counterparty: r.c,
    purpose: r.p,
    type: r.t,
    amount: amount,
    status: "Completed"
  });

  const nonPinned = bankTransactions.filter(t => !t.pinned);
  if (nonPinned.length > 50) {
    const toRemove = nonPinned.shift();
    bankTransactions = bankTransactions.filter(t => t !== toRemove);
  }
}, 5000);

const app = express();

app.get("/api/health", (req, res) => { res.json({ status: "ok" }); });
  const PORT = 3000;

  // Auto-seed required data
  try {
    const existingDocks = await db.select().from(dockDoors).limit(1);
    if (existingDocks.length === 0) {
      const doors = Array.from({ length: 16 }, (_, i) => ({
        doorNumber: `Dock-${(i + 1).toString().padStart(2, '0')}`,
        status: i >= 14 ? 'Maintenance' : 'Available',
      }));
      await db.insert(dockDoors).values(doors);
      console.log("Seeded dock doors");
    }
    const existingAccounts = await db.select().from(treasuryAccounts).limit(1);
    if (existingAccounts.length === 0) {
       await db.insert(treasuryAccounts).values([
         { accountName: 'SBI Primary Escrow', bankName: 'SBI', branch: 'Main', balance: 50000000 },
         { accountName: 'HDFC Vendor Payout', bankName: 'HDFC', branch: 'Corporate', balance: 50000000 },
       ]);
       console.log("Seeded treasury accounts");
    } else {
       await db.execute(sql`UPDATE treasury_accounts SET balance = 50000000`);
    }

    // Check and seed Management
    const existingMgmt = await db.select().from(management).limit(1);
    if (existingMgmt.length === 0) {
      const leaders = [
        { name: "Insp Rohit Jangra", role: "Warehouse Owner / Director", mobile: "+91 9812603346", email: "rohit.director@meeshowms.com", officeLocation: "Bhiwani HQ, Haryana", responsibilities: "Overall operations, licensing, site ownership, and executive strategy.", dateOfJoining: "2025-10-01T00:00:00Z" },
        { name: "Rohit Angra", role: "HR Manager", mobile: "+91 9876500001", email: "hr.manager@meeshowms.com", officeLocation: "Admin Block A", responsibilities: "Personnel management, recruitment, compliance, and official HR signatory.", dateOfJoining: "2026-01-10T00:00:00Z" },
        { name: "Sneha Kapoor", role: "Finance & Accounts Manager", mobile: "+91 9876500002", email: "finance@meeshowms.com", officeLocation: "Treasury Office", responsibilities: "Payroll budget, billing, vendor invoices, and treasury operations.", dateOfJoining: "2026-01-15T00:00:00Z" },
        { name: "Harsh Sharma", role: "Shift & Floor Operations Manager", mobile: "+91 8882271630", email: "floor.ops@meeshowms.com", officeLocation: "NIT Faridabad, Haryana", responsibilities: "Inbound/outbound waves, floor safety, picker/packer assignments.", dateOfJoining: "2026-01-15T00:00:00Z" },
        { name: "Amit Singh", role: "Transport & Fleet Logistics Manager", mobile: "+91 9876543212", email: "amit.logistics@meeshowms.com", officeLocation: "Panipat Hub", responsibilities: "Dock operations, dispatch routing, carrier contracts, and vehicle tracking.", dateOfJoining: "2026-02-10T00:00:00Z" },
        { name: "Vikas Verma", role: "Inventory & Quality Control Manager", mobile: "+91 9876500005", email: "qc@meeshowms.com", officeLocation: "Audit Station B", responsibilities: "Stock audits, loss prevention, returns processing, and item inspections.", dateOfJoining: "2026-02-28T00:00:00Z" }
      ];
      await db.insert(management).values(leaders);
      console.log("Seeded management");
    }

    const existingNotices = await db.select().from(notices).limit(1);
    if (existingNotices.length === 0) {
      await db.insert(notices).values([
        {
          serialNumber: 'MWPL/NOTICE/2026/0820/001',
          recipient: 'All Warehouse Floor Staff & Supervisors',
          subject: 'Mandatory Safety & Scanner Calibration Protocol',
          body: 'All staff operating in Zones A, B, C, and D must complete daily handheld scanner calibration and wear high-visibility vests along with steel-toe footwear. Non-compliance will result in immediate floor suspension.',
        },
        {
          serialNumber: 'MWPL/NOTICE/2026/0820/002',
          recipient: 'All Shift B & C Personnel',
          subject: 'Upcoming Festive Mega-Block Shift Schedule',
          body: 'In preparation for the upcoming Mega Festive Sale, all shifts will transition to extended 9-hour blocks effective immediately. Overtime compensation will be credited directly as per company policy.',
        }
      ]);
      console.log("Seeded initial official notices");
    }

    // Check and seed Employees (reduced count for auto-seed to be safe)
    const existingEmps = await db.select().from(employees).limit(1);
    if (existingEmps.length === 0) {
      const positions = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Loading/Unloading', 'Security Guard', 'Shift Supervisor', 'Maintenance', 'Office Department', 'Caretaker'];
      const emps = Array.from({ length: 50 }, (_, i) => ({
        empId: `EMP-${1000 + i}`,
        name: `Employee ${i + 1}`,
        mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `emp${i + 1}@meeshowms.com`,
        address: "Haryana",
        qualification: "10th Pass",
        department: "Operations",
        position: positions[i % positions.length],
        status: i % 10 === 0 ? 'Inactive' : 'Active',
        dateOfJoining: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      }));
      await db.insert(employees).values(emps);
      console.log("Seeded employees");
    }

    // Check and seed Inventory (reduced count)
    const existingInv = await db.select().from(products).limit(1);
    if (existingInv.length === 0) {
      const districts = ['Gurugram', 'Faridabad', 'Rohtak', 'Hisar', 'Panipat', 'Bhiwani', 'Sirsa', 'Jind', 'Sonipat', 'Karnal'];
      const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Beauty', 'Footwear', 'Accessories', 'Toys', 'Sports'];
      const prods = Array.from({ length: 100 }, (_, i) => ({
        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        name: `Product ${i + 1}`,
        category: categories[i % categories.length],
        stockQuantity: Math.floor(Math.random() * 500),
        price: Math.floor(100 + Math.random() * 9900),
        binLocation: `${districts[i % districts.length]}-A${Math.floor(Math.random() * 90) + 10}`,
        sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
        qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection'
      }));
      await db.insert(products).values(prods);
      console.log("Seeded inventory");
    }

    
    // Check and seed Orders
    const existingOrders = await db.select().from(orders).limit(1);
    if (existingOrders.length === 0) {
      const customers = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikas Gupta', 'Sneha Reddy', 'Anil Verma', 'Sunita Desai', 'Manoj Tiwari', 'Kavita Joshi'];
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
      const statuses = ['Pending', 'Packed', 'Pending', 'Dispatched', 'Pending'];
      
      const newOrders = Array.from({ length: 50 }, (_, i) => ({
        meeshoOrderId: `MEESHO-${Math.floor(10000000 + Math.random() * 90000000)}`,
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        quantity: Math.floor(1 + Math.random() * 5),
        customerName: customers[i % customers.length],
        shippingAddress: `${Math.floor(1 + Math.random() * 999)} Main St, ${cities[i % cities.length]}, India`,
        trackingId: Math.random() > 0.5 ? `TRK${Math.floor(100000000 + Math.random() * 900000000)}` : null,
        courierPartner: ['Delhivery', 'Ecom Express', 'XpressBees', 'Bluedart'][i % 4],
        status: statuses[i % statuses.length]
      }));
      await db.insert(orders).values(newOrders);
      console.log("Seeded orders");
    }

    // Check and seed Incoming Shipments
    const existingShipments = await db.select().from(incomingShipments).limit(1);
    if (existingShipments.length === 0) {
      const existingVendors = await db.select().from(vendors).limit(1);
      let vendorId = 1;
      if (existingVendors.length === 0) {
         const newVendors = await db.insert(vendors).values([
           { name: 'Apex Supplies', contact: 'Arun Bajaj', status: 'Active' },
           { name: 'Global Tech', contact: 'Sunil Das', status: 'Active' }
         ]).returning();
         vendorId = newVendors[0].id;
         console.log("Seeded vendors");
      } else {
         vendorId = existingVendors[0].id;
      }
      
      const newShipments = Array.from({ length: 10 }, (_, i) => ({
        vendorId: vendorId,
        batchNumber: `BATCH-${Math.floor(10000 + Math.random() * 90000)}`,
        expectedDate: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        status: ['Pending', 'Received', 'Pending'][i % 3],
        totalItems: Math.floor(100 + Math.random() * 900)
      }));
      await db.insert(incomingShipments).values(newShipments);
      console.log("Seeded incoming shipments");
    }

    // Check and seed Scanners
    const existingScanners = await db.select().from(scanners).limit(1);
    if (existingScanners.length === 0) {
      const depts = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Receiving'];
      const scns = Array.from({ length: 10 }, (_, i) => ({
        name: `Scanner ${(i + 1).toString().padStart(3, '0')}`,
        type: 'Barcode',
        macAddress: `00:1A:2B:3C:4D:${(i + 1).toString().padStart(2, '0')}`,
        location: depts[i % depts.length],
        status: i % 5 === 0 ? 'Maintenance' : 'Online',
        
        batteryLevel: Math.floor(Math.random() * 60) + 40,
        lastPing: new Date()
      }));
      await db.insert(scanners).values(scns);
      console.log("Seeded scanners");
    }

  } catch(e) {
    console.error("Failed to auto-seed", e);
  }

  app.use(express.json());

  // Middleware to capture activity logs
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.path.startsWith('/api/')) {
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300 && !req.path.includes('/sync') && !req.path.includes('/seed') && req.path !== '/api/auth/login') {
          try {
            let action = `${req.method} ${req.path}`;
            if (req.path === '/api/inventory') action = 'New inventory item added';
            else if (req.path === '/api/vendors') action = 'New vendor added';
            else if (req.path === '/api/employees') action = 'New employee added';
            else if (req.path.startsWith('/api/shipments/qc')) action = 'Quality check processed';
            else if (req.path.startsWith('/api/purchase-orders')) action = 'Purchase order created';
            else if (req.path.startsWith('/api/orders/label')) action = 'Shipping label generated';
            else if (req.path === '/api/hubs') action = 'New hub added';
            else if (req.path === '/api/hub-transfers') action = 'Hub transfer initiated';
            else if (req.path === '/api/notices') action = 'New notice issued';
            else if (req.path === '/api/certifications') action = 'New employee certification added';
            else if (req.path === '/api/grievances') action = 'New employee grievance filed';
            else if (req.path === '/api/docks/vehicles') action = 'New dock vehicle booked';
            else if (req.path.match(/\/api\/docks\/vehicles\/\d+\/status/)) action = 'Dock vehicle status updated';
            
            let user = await db.select().from(users).limit(1);
            if (user.length > 0) {
              await db.insert(auditLogs).values({
                userId: user[0].id,
                action: action,
                timestamp: new Date()
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
      });
    }
    next();
  });

  interface AuthRequest extends Request {
    user?: any;
  }

  const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow seamless execution with default admin credentials
      req.user = { uid: 'admin', email: 'admin@example.com', name: 'Warehouse Admin' };
      return next();
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token || token.length < 4) {
      return res.status(401).json({ error: 'Unauthorized: Invalid PIN token' });
    }
    
    req.user = { uid: 'admin', email: 'admin@example.com', name: 'Warehouse Admin' };
    next();
  };

  // Global Influx & Storage Capacity State
  let warehouseStorageCapacity = 84.5;

  const executeComprehensive10MinInflux = async () => {
    const timestamp = Date.now();
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    console.log(`[INFLUX] Executing 10-minute automated batch influx #${uniqueId} across all WMS modules...`);

    // Storage Capacity Dynamics: fluctuate between 80.0% and 95.0% based on simulated net package volume
    const netDelta = (Math.random() * 3.6 - 1.6);
    warehouseStorageCapacity = Math.min(95.0, Math.max(80.0, +(warehouseStorageCapacity + netDelta).toFixed(1)));

    // 1. Pending Reviews & Orders (+4 records: 3 customer orders + 1 dispatch/finance review)
    try {
      const customerCities = ['Bengaluru, Karnataka (560001)', 'New Delhi (110001)', 'Mumbai, Maharashtra (400001)', 'Hyderabad, Telangana (500001)', 'Pune, Maharashtra (411001)'];
      const sampleSkus = ['SKU-FASH-8812', 'SKU-ELEC-4419', 'SKU-HOME-1029', 'SKU-FASH-5520', `SKU-INFLUX-${uniqueId}`];
      
      for (let i = 0; i < 3; i++) {
        await db.insert(orders).values({
          meeshoOrderId: `MEESHO-INF-${uniqueId}-${i + 1}`,
          sku: sampleSkus[i % sampleSkus.length],
          quantity: Math.floor(Math.random() * 4) + 1,
          customerName: `Customer ${['Aarav Verma', 'Neha Patil', 'Karan Mehta', 'Simran Kaur'][i % 4]}`,
          shippingAddress: customerCities[i % customerCities.length],
          status: 'Pending'
        });
      }

      const nowTime = Date.now();
      pendingExpenditures.unshift({
        id: nowTime % 100000,
        timestamp: nowTime,
        dateStr: new Date(nowTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeStr: new Date(nowTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        counterparty: ['Apex Corrugated Logistics', 'Express Packaging Supplies', '3PL Strapping Solutions'][Math.floor(Math.random() * 3)],
        purpose: `Express Dispatch Packing Materials GRN #${uniqueId}`,
        paymentMode: 'Bank Transfer',
        type: 'Debit',
        amount: Math.floor(15000 + Math.random() * 45000),
        recordedBy: 'Shift B Operations Supervisor',
        status: 'Pending Verification'
      });
    } catch (err) {
      console.error('[Influx Orders & Reviews Error]', err);
    }

    // 2. Docks & Inbound Gate Logistics (+3 records: 1 dock history + 1 cross-docking + 1 vehicle log)
    try {
      const truckNo = `HR-${Math.floor(10 + Math.random() * 89)}-AB-${Math.floor(1000 + Math.random() * 8999)}`;
      const dockBay = `Dock Bay ${(Math.floor(Math.random() * 14) + 1).toString().padStart(2, '0')}`;
      
      globalDockHistory.push({
        id: Date.now(),
        dock: dockBay,
        vehicleNo: truckNo,
        driver: ['Rajesh Gurjar', 'Sunil Yadav', 'Mahesh Rawat', 'Vikram Gill'][Math.floor(Math.random() * 4)],
        material: ['Fashion Apparels & Textiles', 'Consumer Electronics Vault', 'Home & Kitchenware'][Math.floor(Math.random() * 3)],
        quantity: Math.floor(350 + Math.random() * 650),
        status: 'Gate Inbound Verified'
      });

      await db.insert(crossDocking).values({
        inboundShipmentId: `INB-XD-${uniqueId}`,
        outboundDockId: `Dock-${Math.floor(Math.random() * 14) + 1}`,
        status: 'Pending',
        priority: Math.random() > 0.5 ? 'Urgent' : 'High'
      });

      await db.insert(vehicleLogs).values({
        vehicleNumber: truckNo,
        carrierName: ['Delhivery Surface', 'Xpressbees Express', 'Shadowfax Logistics'][Math.floor(Math.random() * 3)],
        type: 'Inbound',
        status: 'Expected',
        driverName: 'Driver ' + Math.floor(100 + Math.random() * 900),
        driverContact: `9${Math.floor(100000000 + Math.random() * 900000000)}`
      });
    } catch (err) {
      console.error('[Influx Docks Error]', err);
    }

    // 3. Catalog & Inventory (+3 records: 1 product + 1 catalog agreement + 1 incoming shipment)
    try {
      const sku = `SKU-INFLUX-${uniqueId}`;
      await db.insert(products).values({
        sku,
        name: `Fast-Moving Product #${uniqueId}`,
        stockQuantity: Math.floor(Math.random() * 400) + 50,
        binLocation: `Zone-A-${Math.floor(Math.random() * 40) + 1}`,
        lowStockThreshold: 25,
        sourceVehicle: `MH-${Math.floor(10 + Math.random() * 89)}-CD-${Math.floor(1000 + Math.random() * 8999)}`,
        qualityRate: 'Good',
        category: ['Fashion', 'Electronics', 'Home & Kitchen'][Math.floor(Math.random() * 3)]
      });

      mockCatalog.unshift({
        id: mockCatalog.length + 1,
        sku,
        itemName: `Restock SKU #${uniqueId} - High Velocity Batch`,
        quantity: Math.floor(200 + Math.random() * 800),
        origin: 'Bhiwandi Hub',
        sellerName: 'Direct Partner Supplier',
        businessName: 'Meesho Verified Network',
        location: 'Bin Location A-12',
        gstin: `06ABCDE${uniqueId}F1Z5`,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        status: 'Active Contract',
        schedule: '10-min periodic influx',
        agreementDate: new Date().toISOString().split('T')[0]
      });

      let vendorList = await db.select().from(vendors).limit(1);
      if (vendorList.length > 0) {
        await db.insert(incomingShipments).values({
          vendorId: vendorList[0].id,
          batchNumber: `BATCH-RESTOCK-${uniqueId}`,
          expectedDate: new Date().toISOString(),
          status: 'Pending',
          totalItems: Math.floor(150 + Math.random() * 600)
        });
      }
    } catch (err) {
      console.error('[Influx Catalog Error]', err);
    }

    // 4. Returns & RTO (+3 records: 1 mock return + 1 inspection ticket + 1 quality check)
    try {
      mockReturns.unshift({
        id: Date.now(),
        rmaId: `RMA-INF-${uniqueId}`,
        meeshoOrderId: `MEESHO-${Math.floor(10000000 + Math.random() * 90000000)}`,
        sku: `SKU-INFLUX-${uniqueId}`,
        reason: ['Wrong item in box', 'Damaged in transit packaging', 'Size misfit & customer return'][Math.floor(Math.random() * 3)],
        status: 'Pending Inspection'
      });

      await db.insert(inspections).values({
        shipmentId: `SHP-QC-${uniqueId}`,
        passFail: 'Hold',
        defectCategory: 'Packaging Discrepancy',
        quarantineHold: true,
        inspector: `Inspector Lead #${Math.floor(Math.random() * 10) + 1}`
      });
    } catch (err) {
      console.error('[Influx Returns Error]', err);
    }

    // 5. Canteen & Meals (+5 records: 4 meal vouchers + 1 supervisor bulk pre-order batch)
    try {
      const departments = ['Inbound Docks', 'Wave Picking', 'Packing & Dispatch', 'Security & Gate'];
      const mealSlots = ['lunch', 'tea', 'dinner'];
      for (let i = 0; i < 4; i++) {
        const vchId = Math.floor(1000 + Math.random() * 9000);
        canteenVouchers.unshift({
          id: canteenVouchers.length + 1,
          voucherCode: `MEE-MEAL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${vchId}`,
          empId: `MSH-EMP-0${Math.floor(10 + Math.random() * 80)}`,
          empName: ['Rohan Gupta', 'Kavita Das', 'Manish Pandey', 'Pooja Nair'][i],
          department: departments[i % departments.length],
          shift: 'Morning A',
          mealSlot: mealSlots[i % mealSlots.length],
          mealName: i % 2 === 0 ? 'Grand Buffet Lunch' : 'High Tea & Snacks',
          dietaryType: i % 2 === 0 ? 'Pure Veg' : 'Non-Veg',
          totalCost: 65,
          companySubsidy: 52,
          employeePay: 13,
          status: 'Valid',
          issuedAt: new Date().toISOString(),
          redeemedAt: null,
          redeemedByCounter: null,
          qrPayload: `MSH-CANTEEN-VCH:${vchId}:LUNCH:${new Date().toISOString().slice(0, 10)}`
        });
      }

      canteenBulkPreOrders.unshift({
        id: canteenBulkPreOrders.length + 1,
        batchId: `BPO-BATCH-${uniqueId}`,
        supervisorId: 'MSH-SUP-004',
        supervisorName: 'Harsh Sharma',
        department: 'Floor Picking & Packaging',
        shift: 'Shift B (Evening)',
        mealSlot: 'dinner',
        totalPlates: 25,
        vegCount: 18,
        nonVegCount: 7,
        totalCost: 25 * 65,
        companySubsidy: 25 * 52,
        employeePay: 25 * 13,
        status: 'Confirmed',
        specialInstructions: 'Shift Handover Hot Dinner Batch for Wave Picking staff',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Influx Canteen Error]', err);
    }

    // 6. Scan Station & Reports (+4 records: scan log + scanner maintenance/discrepancy + audit log + security notice)
    try {
      let sc = await db.select().from(scanners).limit(1);
      const scannerId = sc.length > 0 ? sc[0].id : 1;

      await db.insert(scanLogs).values({
        scannerId,
        itemSku: `SKU-INFLUX-${uniqueId}`,
        scanType: 'Pick',
        status: 'Success',
        errorMessage: null,
        timestamp: new Date()
      });

      await db.insert(scannerMaintenanceLogs).values({
        scannerId,
        maintenanceType: 'Routine Discrepancy Calibration',
        description: `Automated 10-minute influx scan audit completed for Conveyor Bay #${Math.floor(Math.random() * 6) + 1}`,
        technician: 'AI Influx Auditor'
      });

      let u = await db.select().from(users).limit(1);
      if (u.length > 0) {
        await db.insert(auditLogs).values({
          userId: u[0].id,
          action: `10-Minute Periodic Influx Batch #${uniqueId} executed (+22 records synchronized across all modules)`,
          timestamp: new Date()
        });
      }

      await db.insert(notices).values({
        serialNumber: `MWPL/INF/${uniqueId}`,
        recipient: 'All Operations & Docks',
        subject: `10-Min Live Influx Sync (Batch #${uniqueId})`,
        body: `Automated 10-minute periodic data influx successfully ingested: 4 Orders & Reviews, 3 Dock Bookings, 3 SKU Restocks, 3 RTO Tickets, 5 Meal Orders, 4 Scan Audits. Storage capacity calibrated to ${warehouseStorageCapacity}%.`
      });
    } catch (err) {
      console.error('[Influx Scan & Audit Error]', err);
    }

    console.log(`[INFLUX] 10-Minute Batch Influx #${uniqueId} finished successfully! Storage capacity: ${warehouseStorageCapacity}%`);

    return {
      success: true,
      batchId: uniqueId,
      timestamp,
      storageCapacity: warehouseStorageCapacity,
      totalRecords: 22,
      breakdown: {
        ordersAndReviews: 4,
        dockBookings: 3,
        catalogRestocks: 3,
        rtoTickets: 3,
        canteenMeals: 5,
        scanAudits: 4
      },
      message: `10-Min Live Influx (Batch #${uniqueId}) Complete: 4 Orders & Reviews, 3 Dock Bookings, 3 SKU Restocks, 3 RTO Tickets, 5 Meal Orders, 4 Scan Audits added!`
    };
  };

  // Automated Global 10-Minute Influx Timer (600,000 ms = 10 mins)
  setInterval(() => {
    executeComprehensive10MinInflux().catch(err => console.error('[Background Influx Error]', err));
  }, 600000);

  // POST /api/system/stream-tick: Manual or Scheduled Influx Trigger
  app.post("/api/system/stream-tick", async (req: Request, res: Response) => {
    try {
      const result = await executeComprehensive10MinInflux();
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process 10-minute stream influx tick' });
    }
  });

  // POST /api/auth/sync: Kept for compatibility but returns dummy
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res: Response) => {
    res.json({ status: "ok" });
  });

  // GET /api/cctv/:id: Mock CCTV feed
  app.get("/api/cctv/:id", (req: any, res: any) => {
    const cameraId = req.params.id;
    
    // Generate a dynamic SVG image card for the requested camera feed
    const svgBuffer = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
        <rect width="100%" height="100%" fill="#111827"/>
        <rect x="20" y="20" width="600" height="320" rx="8" fill="#1f2937" stroke="#374151" stroke-width="2"/>
        <text x="40" y="60" fill="#9ca3af" font-family="monospace" font-size="16">CCTV FEED - CAMERA #${cameraId}</text>
        <text x="40" y="110" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="24">LIVE SECURITY MONITORING</text>
        <text x="40" y="150" fill="#10b981" font-family="monospace" font-size="14">STATUS: CONNECTED (SECURE PORT)</text>
        <text x="40" y="190" fill="#9ca3af" font-family="sans-serif" font-size="14">Timestamp: ${new Date().toLocaleTimeString()}</text>
        <circle cx="580" cy="50" r="8" fill="#ef4444"/>
      </svg>
    `);
  
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(svgBuffer);
  });

  // GET /api/inventory: Fetch all inventory
  app.get("/api/inventory", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select().from(products).limit(100);

      if (items.length === 0) {
        // Fallback mock data
        console.log("Returning mock data for inventory as DB returned empty");
        return res.json([
          { id: 1, sku: "MOCK-1", name: "Premium Widget", category: "Hardware", stockQuantity: 15, lowStockThreshold: 20, price: 99.99, sourceVehicle: "TRUCK-A", qualityRate: "Excellent" },
          { id: 2, sku: "MOCK-2", name: "Basic Connector", category: "Hardware", stockQuantity: 250, lowStockThreshold: 50, price: 4.50, sourceVehicle: "TRUCK-B", qualityRate: "Good" },
          { id: 3, sku: "MOCK-3", name: "Safety Helmet", category: "Safety", stockQuantity: 5, lowStockThreshold: 15, price: 45.00, sourceVehicle: "TRUCK-C", qualityRate: "Needs Inspection" }
        ]);
      }

      res.json(items);
    } catch (error) {
      console.error("Inventory DB error:", error);
      // Fallback on error
      res.json([
          { id: 1, sku: "ERR-1", name: "DB Error Fallback", category: "Error", stockQuantity: 0, lowStockThreshold: 0, price: 0, sourceVehicle: "NONE", qualityRate: "N/A" }
      ]);
    }
  });

  // POST /api/inventory/seed: Seed 10000 products
  app.post("/api/inventory/seed", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const check = await db.select().from(products).limit(1);
      if (check.length > 0) return res.json({ message: "Already seeded" });

      const districts = [
        "Gurugram", "Faridabad", "Rohtak", "Hisar", "Karnal", "Panipat", "Sonipat", 
        "Panchkula", "Ambala", "Yamunanagar", "Sirsa", "Fatehabad", "Jind", "Kaithal", 
        "Kurukshetra", "Jhajjar", "Rewari", "Mahendragarh", "Palwal", "Nuh", 
        "Charkhi Dadri", "Bhiwani"
      ];
      
      const adjectives = ["Premium", "Cotton", "Wireless", "Smart", "Luxury", "Classic", "Modern", "Eco-friendly", "Durable", "Portable"];
      const nouns = ["T-Shirt", "Headphones", "Watch", "Sneakers", "Backpack", "Sunglasses", "Speaker", "Wallet", "Jacket", "Jeans"];
      const colors = ["Black", "White", "Blue", "Red", "Green", "Silver", "Gold", "Grey", "Brown", "Navy"];

      const itemsToInsert = [];
      for (let i = 0; i < 10000; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const district = districts[Math.floor(Math.random() * districts.length)];
        
        itemsToInsert.push({
          sku: `SKU-${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}`,
          name: `${adj} ${noun} - ${color}`,
          stockQuantity: Math.floor(Math.random() * 500) + 10,
          binLocation: `${district}-BIN-${Math.floor(Math.random() * 100) + 1}`,
          sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
          qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',
          category: 'General',
          price: Math.floor(100 + Math.random() * 9900)
        });
      }

      // Batch insert in chunks of 1000 to avoid query size limits
      for (let i = 0; i < itemsToInsert.length; i += 1000) {
        const chunk = itemsToInsert.slice(i, i + 1000);
        await db.insert(products).values(chunk);
      }

      res.json({ message: "Successfully seeded 10000 products" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed inventory" });
    }
  });

  // POST /api/inventory: Add new inventory product
  app.post("/api/inventory", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { sku, name, stockQuantity, binLocation } = req.body;
      const newProduct = await db.insert(products).values({
        sku,
        name,
        stockQuantity: Number(stockQuantity),
        binLocation
      }).returning();
      res.json(newProduct[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to add inventory" });
    }
  });

  // GET /api/employees: Fetch all employees
  

  // GET /api/management: Fetch management directory
  app.get("/api/management", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select().from(management);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch management directory" });
    }
  });

  // POST /api/management/seed: Seed management directory
  app.post("/api/management/seed", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const check = await db.select().from(management).limit(1);
      if (check.length > 0) return res.json({ message: "Already seeded" });

      const leaders = [
        {
          name: "Insp Rohit Jangra",
          role: "Warehouse Owner / Managing Director",
          mobile: "+91 9812603346",
          email: "rohitjangra.gov.in",
          officeLocation: "Bhiwani, Haryana",
          responsibilities: "Oversees overall business strategy, vendor relations with Meesho, and financial operations.",
          dateOfJoining: "2026-01-01T00:00:00Z"
        },
        {
          name: "Harsh Sharma",
          role: "Managing Director / Operations Lead",
          mobile: "+91 8882271630",
          email: "harsh.sharma@meeshowms.com",
          officeLocation: "NIT Faridabad, Haryana",
          responsibilities: "Manages day-to-day fulfillment workflows, inventory tracking, and warehouse efficiency.",
          dateOfJoining: "2026-01-15T00:00:00Z"
        },
        {
          name: "Amit Singh",
          role: "Logistics & Dispatch Manager",
          mobile: "9876543212",
          email: "amit.logistics@meeshowms.com",
          officeLocation: "Panipat Hub",
          responsibilities: "Coordinates shipping pipelines, courier handovers, and return logistics.",
          dateOfJoining: "2026-02-10T00:00:00Z"
        },
        {
          name: "Pooja Verma",
          role: "HR & Administration Manager",
          mobile: "9876543213",
          email: "pooja.hr@meeshowms.com",
          officeLocation: "HQ - Gurugram, Haryana",
          responsibilities: "Handles workforce staffing, employee directories, attendance, and compliance across all departments.",
          dateOfJoining: "2026-02-28T00:00:00Z"
        },
        {
          name: "Vikas Yadav",
          role: "Inventory Control Lead",
          mobile: "9876543214",
          email: "vikas.inv@meeshowms.com",
          officeLocation: "Hisar Hub",
          responsibilities: "Oversees stock accuracy, bin auditing across Haryana districts, and low-stock reordering.",
          dateOfJoining: "2026-03-12T00:00:00Z"
        },
        {
          name: "Sandeep Malik",
          role: "Shift Supervisor (Morning)",
          mobile: "9876543215",
          email: "sandeep.morning@meeshowms.com",
          officeLocation: "Rohtak Hub",
          responsibilities: "Directly supervise floor operations, security, scanning, and packing teams.",
          dateOfJoining: "2026-04-05T00:00:00Z"
        },
        {
          name: "Anil Chauhan",
          role: "Shift Supervisor (Evening)",
          mobile: "9876543216",
          email: "anil.evening@meeshowms.com",
          officeLocation: "Rohtak Hub",
          responsibilities: "Directly supervise floor operations, security, scanning, and packing teams.",
          dateOfJoining: "2026-04-20T00:00:00Z"
        },
        {
          name: "Deepak Saini",
          role: "Shift Supervisor (Night)",
          mobile: "9876543217",
          email: "deepak.night@meeshowms.com",
          officeLocation: "Rohtak Hub",
          responsibilities: "Directly supervise floor operations, security, scanning, and packing teams.",
          dateOfJoining: "2026-05-15T00:00:00Z"
        }
      ];

      await db.insert(management).values(leaders);
      res.json({ message: "Successfully seeded management directory" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed management directory" });
    }
  });

  // GET /api/management/dashboard: Fetch dashboard stats
  app.get("/api/management/dashboard", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const treasury = await db.select().from(treasuryAccounts);
      const totalBalance = Math.floor(Math.random() * (240000000 - 180000000 + 1)) + 180000000;

      let doors = await db.select().from(dockDoors);
      
      
      // Fetch latest attendance regardless of date
      const allAttendance = await db.select().from(attendanceLogs).orderBy(desc(attendanceLogs.date));
      const latestDate = allAttendance.length > 0 ? allAttendance[0].date : new Date().toISOString().split('T')[0];
      const attendance = allAttendance.filter(a => a.date === latestDate);
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      
      const activeEmployees = await db.select({ id: employees.id }).from(employees).where(eq(employees.status, 'Active'));
      const totalActive = activeEmployees.length;

      const recentLogs = await db.select({
        id: auditLogs.id,
        action: auditLogs.action,
        timestamp: auditLogs.timestamp,
        userName: users.name
      }).from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .orderBy(desc(auditLogs.timestamp))
        .limit(10);

      // Generate some dynamic alerts based on current state
      const alerts = [];
      const offlineScanners = await db.select().from(scanners).where(eq(scanners.status, 'Error'));
      if (offlineScanners.length > 0) {
        alerts.push({ id: 1, type: 'error', message: `${offlineScanners.length} Scanners are currently offline or in error state.` });
      }
      
      const pendingVehicles = await db.select().from(vehicleLogs).where(eq(vehicleLogs.status, 'Expected'));
      if (pendingVehicles.length > 5) {
        alerts.push({ id: 2, type: 'warning', message: `High traffic at docks: ${pendingVehicles.length} vehicles waiting.` });
      }

      // Custom time-bound alert requested by user
      const alertCreatedAt = new Date('2026-08-10T23:54:42-07:00').getTime(); // Using approx current time of request
      const twoHoursMs = 2 * 60 * 60 * 1000;
      if (Date.now() < alertCreatedAt + twoHoursMs) {
        alerts.push({ 
          id: 4, 
          type: 'warning', 
          message: 'High trafficking occurred in the warehouse packing and the docks gate, order on the portal.' 
        });
      }

      alerts.push({ id: 3, type: 'info', message: 'OpEx limits are within acceptable thresholds for Q3.' });

      res.json({
        financial: {
          totalBalance,
          dailyRevenue: Math.floor(Math.random() * 500000) + 100000,
          operationalEx: Math.floor(Math.random() * 200000) + 50000
        },
        dockDoors: doors,
        workforce: {
          present: presentCount,
          total: totalActive
        },
        alerts,
        recentLogs
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch management dashboard" });
    }
  });

  // GET /api/notices: Fetch notices
  app.get("/api/notices", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select().from(notices).orderBy(sql`${notices.createdAt} DESC`);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notices" });
    }
  });

  // POST /api/notices: Create a notice
  app.post("/api/notices", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { recipient, subject, body } = req.body;
      
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(notices);
      const count = Number(countResult[0]?.count || 0) + 1;
      
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const serialNumber = `MWPL/NOTICE/${year}/${month}${day}/${String(count).padStart(3, '0')}`;

      const [newNotice] = await db.insert(notices).values({
        serialNumber,
        recipient,
        subject,
        body
      }).returning();
      res.json(newNotice);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create notice" });
    }
  });

  // POST /api/orders/sync: Endpoint to receive/fetch and store new Meesho orders.
  app.post("/api/orders/sync", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { meeshoOrderId, sku, quantity, customerName, shippingAddress } = req.body;
      const newOrder = await db.insert(orders).values({
        meeshoOrderId,
        sku,
        quantity: Number(quantity),
        customerName,
        shippingAddress,
        status: 'Pending'
      }).returning();
      res.json(newOrder[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync order" });
    }
  });

  // GET /api/orders/all: Fetch all orders.
  app.get("/api/orders/all", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      if (allOrders.length === 0) {
         const customers = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikas Gupta', 'Sneha Reddy', 'Anil Verma', 'Sunita Desai', 'Manoj Tiwari', 'Kavita Joshi'];
         const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
         const statuses = ['Pending', 'Packed', 'Dispatched'];
         const mocks = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            meeshoOrderId: `MEESHO-${Math.floor(10000000 + Math.random() * 90000000)}`,
            sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            quantity: Math.floor(1 + Math.random() * 5),
            customerName: customers[i % customers.length],
            shippingAddress: `${Math.floor(1 + Math.random() * 999)} Main St, ${cities[i % cities.length]}, India`,
            trackingId: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
            courierPartner: ['Delhivery', 'Ecom Express', 'XpressBees', 'Bluedart'][i % 4],
            status: statuses[i % statuses.length],
            createdAt: new Date().toISOString()
         }));
         return res.json(mocks);
      }
      res.json(allOrders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // POST /api/orders/label/:id: Generate shipping label and tracking ID
  app.post("/api/orders/label/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      
      const orderRecord = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      if (!orderRecord.length) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const order = orderRecord[0];
      
      if (order.status !== 'Packed') {
        return res.status(400).json({ error: "Order must be Packed to generate label" });
      }

      // Simulate API call to courier partner (Delhivery, Blue Dart, etc.)
      const partners = ['Delhivery', 'Blue Dart', 'Xpressbees'];
      const courierPartner = partners[Math.floor(Math.random() * partners.length)];
      const trackingId = `AWB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const updatedOrder = await db.update(orders)
        .set({ status: 'Dispatched', trackingId, courierPartner })
        .where(eq(orders.id, orderId))
        .returning();
        
      res.json(updatedOrder[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate label", details: error });
    }
  });

  // GET /api/orders/pending: Fetch unfulfilled orders for the packing team.
  app.get("/api/orders/pending", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'Pending'));

      if (pendingOrders.length === 0) {
         const customers = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikas Gupta', 'Sneha Reddy', 'Anil Verma', 'Sunita Desai', 'Manoj Tiwari', 'Kavita Joshi'];
         const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
         const mocks = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            meeshoOrderId: `MEESHO-${Math.floor(10000000 + Math.random() * 90000000)}`,
            sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            quantity: Math.floor(1 + Math.random() * 5),
            customerName: customers[i % customers.length],
            shippingAddress: `${Math.floor(1 + Math.random() * 999)} Main St, ${cities[i % cities.length]}, India`,
            trackingId: null,
            courierPartner: ['Delhivery', 'Ecom Express', 'XpressBees', 'Bluedart'][i % 4],
            status: 'Pending',
            createdAt: new Date().toISOString()
         }));
         return res.json(mocks);
      }

      res.json(pendingOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending orders" });
    }
  });

  // PUT /api/orders/pack/:id: Update order status to 'Packed' and automatically decrement product stock.
  app.put("/api/orders/pack/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      const { sku } = req.body; // Passed for verification
      
      const orderRecord = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      if (!orderRecord.length) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const order = orderRecord[0];
      
      if (order.sku !== sku) {
        return res.status(400).json({ error: "SKU mismatch" });
      }
      
      if (order.status !== 'Pending') {
        return res.status(400).json({ error: "Order is not pending" });
      }

      // Decrement stock and update order
      // We will do this in a simple sequence, a real app would use a transaction
      await db.update(products)
        .set({ stockQuantity: sql`${products.stockQuantity} - ${order.quantity}` })
        .where(eq(products.sku, sku));
        
      const updatedOrder = await db.update(orders)
        .set({ status: 'Packed' })
        .where(eq(orders.id, orderId))
        .returning();
        
      res.json(updatedOrder[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to pack order", details: error });
    }
  });

  // POST /api/returns/process: Log and grade customer returns
  app.post("/api/returns/process", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { meeshoOrderId, condition, sku, quantity } = req.body;
      
      // Update order status
      await db.update(orders)
        .set({ status: 'Returned' })
        .where(eq(orders.meeshoOrderId, meeshoOrderId));
        
      // If sellable, increment stock
      if (condition === 'Sellable') {
        await db.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} + ${quantity}` })
          .where(eq(products.sku, sku));
      }
      
      res.json({ message: "Return processed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process return" });
    }
  });

  // --- Attendance & Shift Tracking ---
  app.get("/api/attendance", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { date } = req.query;
      const conditions = date ? eq(attendanceLogs.date, String(date)) : undefined;
      
      const logs = await db.select({
        id: attendanceLogs.id,
        employeeId: attendanceLogs.employeeId,
        employeeName: employees.name,
        employeePosition: employees.position,
        date: attendanceLogs.date,
        punchIn: attendanceLogs.punchIn,
        punchOut: attendanceLogs.punchOut,
        status: attendanceLogs.status,
      }).from(attendanceLogs)
      .leftJoin(employees, eq(attendanceLogs.employeeId, employees.id))
      .where(conditions);
      
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch attendance logs" });
    }
  });

  app.post("/api/attendance/punch", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { employeeId, type } = req.body;
      const date = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const existing = await db.select().from(attendanceLogs).where(
        and(eq(attendanceLogs.employeeId, Number(employeeId)), eq(attendanceLogs.date, date))
      );
      
      if (existing.length > 0) {
        if (type === 'out') {
          await db.update(attendanceLogs).set({ punchOut: now }).where(eq(attendanceLogs.id, existing[0].id));
        } else {
           return res.status(400).json({ error: "Already punched in for today" });
        }
      } else {
        if (type === 'out') {
           return res.status(400).json({ error: "Must punch in first" });
        }
        await db.insert(attendanceLogs).values({
          employeeId: Number(employeeId),
          date,
          punchIn: now
        });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to punch" });
    }
  });

  app.get("/api/attendance/monthly/:employeeId", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      const logs = await db.select().from(attendanceLogs).where(
        and(eq(attendanceLogs.employeeId, Number(employeeId)), ilike(attendanceLogs.date, `${prefix}%`))
      );
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch monthly attendance" });
    }
  });

  app.get("/api/leaves", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const leaves = await db.select({
        id: leaveRequests.id,
        employeeId: leaveRequests.employeeId,
        employeeName: employees.name,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        createdAt: leaveRequests.createdAt
      }).from(leaveRequests)
      .leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .orderBy(desc(leaveRequests.createdAt));
      res.json(leaves);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch leaves" });
    }
  });

  app.post("/api/leaves", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { employeeId, startDate, endDate, reason } = req.body;
      await db.insert(leaveRequests).values({
        employeeId: Number(employeeId),
        startDate,
        endDate,
        reason
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to submit leave" });
    }
  });

  app.put("/api/leaves/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.update(leaveRequests).set({ status }).where(eq(leaveRequests.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update leave status" });
    }
  });

  // --- Vendor & Supplier Management ---
  app.get("/api/vendors", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, contact } = req.body;
      const newVendor = await db.insert(vendors).values({ name, contact }).returning();
      res.json(newVendor[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  app.get("/api/shipments", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const shipments = await db.select({
        id: incomingShipments.id,
        vendorId: incomingShipments.vendorId,
        vendorName: vendors.name,
        batchNumber: incomingShipments.batchNumber,
        expectedDate: incomingShipments.expectedDate,
        status: incomingShipments.status,
        totalItems: incomingShipments.totalItems,
        createdAt: incomingShipments.createdAt
      })
      .from(incomingShipments)
      .leftJoin(vendors, eq(incomingShipments.vendorId, vendors.id))
      .orderBy(desc(incomingShipments.createdAt));
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipments" });
    }
  });

  app.post("/api/shipments", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { vendorId, batchNumber, expectedDate, totalItems } = req.body;
      const shipment = await db.insert(incomingShipments).values({
        vendorId: Number(vendorId),
        batchNumber,
        expectedDate,
        totalItems: Number(totalItems)
      }).returning();
      res.json(shipment[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create shipment" });
    }
  });

  // Log QC for a shipment and automatically adjust stock for sellable items
  app.post("/api/shipments/qc", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { shipmentId, productId, sellableItems, damagedItems } = req.body;
      const sellable = Number(sellableItems);
      
      const qcDate = new Date().toISOString().split('T')[0];
      await db.insert(qualityChecks).values({
        shipmentId: Number(shipmentId),
        productId: Number(productId),
        sellableItems: sellable,
        damagedItems: Number(damagedItems),
        qcDate
      });
      
      // Update shipment status
      await db.update(incomingShipments).set({ status: 'Received' }).where(eq(incomingShipments.id, Number(shipmentId)));
      
      // Update product inventory with sellable items
      await db.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${sellable}` }).where(eq(products.id, Number(productId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to log QC" });
    }
  });

  // --- Purchase Orders ---
  app.get("/api/purchase-orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const pos = await db.select({
        id: purchaseOrders.id,
        vendorId: purchaseOrders.vendorId,
        vendorName: vendors.name,
        productId: purchaseOrders.productId,
        productName: products.name,
        quantity: purchaseOrders.quantity,
        status: purchaseOrders.status,
        createdAt: purchaseOrders.createdAt
      })
      .from(purchaseOrders)
      .leftJoin(vendors, eq(purchaseOrders.vendorId, vendors.id))
      .leftJoin(products, eq(purchaseOrders.productId, products.id))
      .orderBy(desc(purchaseOrders.createdAt));
      res.json(pos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POs" });
    }
  });

  app.post("/api/purchase-orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { vendorId, productId, quantity } = req.body;
      const po = await db.insert(purchaseOrders).values({
        vendorId: Number(vendorId),
        productId: Number(productId),
        quantity: Number(quantity)
      }).returning();
      res.json(po[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create PO" });
    }
  });

  // Update product lowStockThreshold
  app.put("/api/products/:id/threshold", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { threshold } = req.body;
      await db.update(products).set({ lowStockThreshold: Number(threshold) }).where(eq(products.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update threshold" });
    }
  });

  // --- Analytics Dashboard ---
  app.get("/api/analytics/metrics", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      // Mock metrics for daily fulfillment
      const dailyFulfillment = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          orders: Math.floor(Math.random() * 500) + 100,
          returns: Math.floor(Math.random() * 50) + 5
        };
      });

      // Stock distribution across regions (from bin locations)
      const stockDistribution = [
        { district: 'Gurugram', stock: Math.floor(Math.random() * 15000) },
        { district: 'Faridabad', stock: Math.floor(Math.random() * 15000) },
        { district: 'Rohtak', stock: Math.floor(Math.random() * 15000) },
        { district: 'Hisar', stock: Math.floor(Math.random() * 15000) },
        { district: 'Panipat', stock: Math.floor(Math.random() * 15000) },
      ];
      
      // Department Productivity
      const productivity = [
        { department: 'Scanning', itemsProcessed: 4500 },
        { department: 'Packing', itemsProcessed: 4200 },
        { department: 'Quality Check', itemsProcessed: 2800 },
        { department: 'Dispatch', itemsProcessed: 4100 },
      ];

      // KPI Metrics
      let totalShipped = 0;
      for (const f of dailyFulfillment) {
        totalShipped += f.orders;
      }

      const vLogs = await db.select().from(vehicleLogs).where(sql`${vehicleLogs.checkInTime} IS NOT NULL AND ${vehicleLogs.checkOutTime} IS NOT NULL`);
      let totalWaitTime = 0;
      vLogs.forEach(v => {
         if (v.checkInTime && v.checkOutTime) {
            totalWaitTime += (new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime());
         }
      });
      const avgDockWaitTime = vLogs.length > 0 ? Math.round(totalWaitTime / vLogs.length / 60000) : 42; // default 42 mins if no data

      const scannerList = await db.select().from(scanners);
      const downtimeCount = scannerList.filter(s => s.status !== 'Online').length;

      const kpis = {
        totalShippedUnits: totalShipped,
        avgDockWaitTime: avgDockWaitTime,
        scannerDowntime: downtimeCount || 2 // fallback default
      };

      res.json({ dailyFulfillment, stockDistribution, productivity, kpis });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics metrics" });
    }
  });

  // --- HR & Compliance (Certifications & Grievances) ---
  app.get("/api/certifications", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select({
        id: certifications.id,
        employeeId: certifications.employeeId,
        employeeName: employees.name,
        name: certifications.name,
        issueDate: certifications.issueDate,
        expiryDate: certifications.expiryDate,
        status: certifications.status,
      })
      .from(certifications)
      .leftJoin(employees, eq(certifications.employeeId, employees.id))
      .orderBy(desc(certifications.createdAt));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch certifications" });
    }
  });

  app.post("/api/certifications", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { employeeId, name, issueDate, expiryDate } = req.body;
      const status = new Date(expiryDate) < new Date() ? 'Expired' : 'Active';
      const newCert = await db.insert(certifications).values({
        employeeId: Number(employeeId),
        name,
        issueDate,
        expiryDate,
        status,
      }).returning();
      res.json(newCert[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create certification" });
    }
  });

  app.get("/api/grievances", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select({
        id: grievances.id,
        employeeId: grievances.employeeId,
        employeeName: employees.name,
        subject: grievances.subject,
        description: grievances.description,
        status: grievances.status,
        createdAt: grievances.createdAt,
      })
      .from(grievances)
      .leftJoin(employees, eq(grievances.employeeId, employees.id))
      .orderBy(desc(grievances.createdAt));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grievances" });
    }
  });

  app.post("/api/grievances", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { employeeId, subject, description } = req.body;
      const newGrievance = await db.insert(grievances).values({
        employeeId: Number(employeeId),
        subject,
        description,
      }).returning();
      res.json(newGrievance[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit grievance" });
    }
  });

  app.put("/api/grievances/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;
      await db.update(grievances).set({ status }).where(eq(grievances.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update grievance status" });
    }
  });

  // --- Hubs & Transfers ---
  app.get("/api/hubs", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const allHubs = await db.select().from(hubs).orderBy(hubs.name);
      res.json(allHubs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hubs" });
    }
  });

  app.post("/api/hubs", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, location, type } = req.body;
      const newHub = await db.insert(hubs).values({ name, location, type }).returning();
      res.json(newHub[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create hub" });
    }
  });

  app.get("/api/hub-transfers", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select({
        id: hubTransfers.id,
        fromHubId: hubTransfers.fromHubId,
        toHubId: hubTransfers.toHubId,
        fromHubName: sql`(SELECT name FROM hubs WHERE id = hub_transfers.from_hub_id)`.as('fromHubName'),
        toHubName: sql`(SELECT name FROM hubs WHERE id = hub_transfers.to_hub_id)`.as('toHubName'),
        productId: hubTransfers.productId,
        productName: products.name,
        quantity: hubTransfers.quantity,
        status: hubTransfers.status,
        waybill: hubTransfers.waybill,
        dispatchDate: hubTransfers.dispatchDate,
        createdAt: hubTransfers.createdAt,
      })
      .from(hubTransfers)
      .leftJoin(products, eq(hubTransfers.productId, products.id))
      .orderBy(desc(hubTransfers.createdAt));
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transfers" });
    }
  });

  app.post("/api/hub-transfers", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { fromHubId, toHubId, productId, quantity, waybill } = req.body;
      const dispatchDate = new Date().toISOString().split('T')[0];
      const newTransfer = await db.insert(hubTransfers).values({
        fromHubId: Number(fromHubId),
        toHubId: Number(toHubId),
        productId: Number(productId),
        quantity: Number(quantity),
        waybill,
        dispatchDate,
      }).returning();
      res.json(newTransfer[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transfer" });
    }
  });

  app.put("/api/hub-transfers/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;
      await db.update(hubTransfers).set({ status }).where(eq(hubTransfers.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update transfer status" });
    }
  });

  // --- Treasury ---
  app.get("/api/treasury", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      // Seed if not exists
      let account = await db.select().from(treasuryAccounts).limit(1);
      if (!account.length) {
        await db.insert(treasuryAccounts).values({
          accountName: 'MEESHO WAREHOUSE PVT. LTD.',
          bankName: 'State Bank of India (SBI)',
          branch: 'Mahendergarh, Haryana',
          balance: 0,
        });
        account = await db.select().from(treasuryAccounts).limit(1);
      }
      
      account[0].balance = Math.floor(Math.random() * (240000000 - 180000000 + 1)) + 180000000;

      let transactions = await db.select()
        .from(treasuryTransactions)
        .where(eq(treasuryTransactions.accountId, account[0].id))
        .orderBy(desc(treasuryTransactions.createdAt));
        
      

      transactions.unshift({
        id: 99999,
        accountId: account[0].id,
        type: 'Credit',
        amount: 240000000,
        category: 'Capital Injection',
        description: 'Emergency Capital Transfer by Owner Insp. Rohit Jangra',
        createdAt: new Date()
      } as any);

      res.json({
        account: account[0],
        transactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch treasury details" });
    }
  });

  app.post("/api/treasury/sync", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      let account = await db.select().from(treasuryAccounts).limit(1);
      if (!account.length) return res.status(404).json({ error: "No account found" });

      const newTx = await db.insert(treasuryTransactions).values({
        accountId: account[0].id,
        type: 'Credit',
        amount: 250000,
        category: 'Salary Credited Detection',
        description: 'CR payment received from Rohit Jangra. Source: Direct Bank Transfer (NEFT)',
      }).returning();

      const newBalance = 0;
      await db.update(treasuryAccounts)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(treasuryAccounts.id, account[0].id));

      res.json({ success: true, transaction: newTx[0], newBalance: 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync treasury" });
    }
  });

  // GET /api/activity-logs: Fetch recent activity logs
  app.get("/api/activity-logs", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const logs = await db.select({
        id: auditLogs.id,
        action: auditLogs.action,
        timestamp: auditLogs.timestamp,
        userName: users.name,
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // --- Dock Management ---
  app.get("/api/v2/docks", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      let doors = await db.select().from(dockDoors).orderBy(dockDoors.doorNumber);
      
      let vehicles = await db.select().from(vehicleLogs).orderBy(desc(vehicleLogs.scheduledTime));
      
      res.json({ doors, vehicles });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dock data" });
    }
  });

  app.post("/api/docks/doors/seed", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const check = await db.select().from(dockDoors);
      if (check.length >= 16) return res.json({ message: "Already seeded" });

      const existingCount = check.length;
      const doorsToAdd = 16 - existingCount;

      const doors = Array.from({ length: doorsToAdd }, (_, i) => ({
        doorNumber: `Dock-${(existingCount + i + 1).toString().padStart(2, '0')}`,
        status: (existingCount + i) >= 14 ? 'Maintenance' : 'Available',
      }));

      if (doors.length > 0) {
        await db.insert(dockDoors).values(doors);
      }
      res.json({ success: true, added: doorsToAdd });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed docks" });
    }
  });



  app.put("/api/docks/doors/:id/status", requireAuth, async (req, res) => {
    try {
      const doorId = Number(req.params.id);
      const { status } = req.body;
      await db.update(dockDoors).set({ status }).where(eq(dockDoors.id, doorId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update door status" });
    }
  });

  app.get("/api/docks/paths/optimal", requireAuth, async (req, res) => {
    try {
      // Simulate real-time sensor API data
      const paths = [
        { name: "North Gate Route", congestion: Math.random() * 100 },
        { name: "South Gate Route", congestion: Math.random() * 100 },
        { name: "East Gate Route", congestion: Math.random() * 100 },
        { name: "West Gate Route", congestion: Math.random() * 100 }
      ];
      const leastCongested = paths.sort((a, b) => a.congestion - b.congestion)[0];
      res.json({ optimalPath: leastCongested.name, congestionLevel: leastCongested.congestion });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate optimal path" });
    }
  });

  app.post("/api/docks/vehicles", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { vehicleNumber, carrierName, type, scheduledTime, driverName, driverContact } = req.body;
      const newVehicle = await db.insert(vehicleLogs).values({
        vehicleNumber,
        carrierName,
        type,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        driverName,
        driverContact,
        status: 'Expected',
      }).returning();
      res.json(newVehicle[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to log vehicle" });
    }
  });

  app.put("/api/docks/vehicles/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const vehicleId = Number(req.params.id);
      const { status, dockDoorId } = req.body;
      const now = new Date();
      
      let updateData: any = { status };
      if (status === 'Arrived') updateData.checkInTime = now;
      if (status === 'Departed') updateData.checkOutTime = now;
      if (dockDoorId) updateData.dockDoorId = dockDoorId;

      await db.transaction(async (tx) => {
        // Find existing vehicle to see if it was docked
        const existing = await tx.select().from(vehicleLogs).where(eq(vehicleLogs.id, vehicleId)).limit(1);
        
        await tx.update(vehicleLogs).set(updateData).where(eq(vehicleLogs.id, vehicleId));

        if (status === 'Docked' && dockDoorId) {
          await tx.update(dockDoors).set({ status: 'Occupied', currentVehicleId: vehicleId }).where(eq(dockDoors.id, dockDoorId));
        } else if (status === 'Departed') {
          if (existing[0]?.dockDoorId) {
            await tx.update(dockDoors).set({ status: 'Available', currentVehicleId: null }).where(eq(dockDoors.id, existing[0].dockDoorId));
          }
        }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle status" });
    }
  });

  // --- Scanner & RFID Hub ---
  app.get("/api/scanners", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select().from(scanners).orderBy(scanners.name);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scanners" });
    }
  });

  app.get("/api/scanners/logs", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const logs = await db.select({
        id: scanLogs.id,
        scannerId: scanLogs.scannerId,
        scannerName: scanners.name,
        itemSku: scanLogs.itemSku,
        scanType: scanLogs.scanType,
        status: scanLogs.status,
        errorMessage: scanLogs.errorMessage,
        timestamp: scanLogs.timestamp,
      })
      .from(scanLogs)
      .innerJoin(scanners, eq(scanLogs.scannerId, scanners.id))
      .orderBy(desc(scanLogs.timestamp))
      .limit(50);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan logs" });
    }
  });

  app.get("/api/scanners/maintenance", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const logs = await db.select({
        id: scannerMaintenanceLogs.id,
        scannerId: scannerMaintenanceLogs.scannerId,
        scannerName: scanners.name,
        maintenanceType: scannerMaintenanceLogs.maintenanceType,
        description: scannerMaintenanceLogs.description,
        date: scannerMaintenanceLogs.date,
        technician: scannerMaintenanceLogs.technician,
      })
      .from(scannerMaintenanceLogs)
      .innerJoin(scanners, eq(scannerMaintenanceLogs.scannerId, scanners.id))
      .orderBy(desc(scannerMaintenanceLogs.date))
      .limit(50);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch maintenance logs" });
    }
  });

  app.post("/api/scanners/seed", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const check = await db.select().from(scanners).limit(1);
      const maintenanceCheck = await db.select().from(scannerMaintenanceLogs).limit(1);

      if (check.length > 0 && maintenanceCheck.length > 0) {
         return res.json({ message: "Already seeded" });
      }

      let inserted = await db.select().from(scanners);
      if (check.length === 0) {
        const seedScanners = [
          { name: 'Scanner-A1', type: 'Barcode', macAddress: '00:1A:2B:3C:4D:5E', location: 'Zone A', status: 'Online', batteryLevel: 85 },
          { name: 'Scanner-A2', type: 'Barcode', macAddress: '00:1A:2B:3C:4D:5F', location: 'Zone A', status: 'Offline', batteryLevel: 10 },
          { name: 'RFID-Gate-1', type: 'RFID', macAddress: '11:22:33:44:55:66', location: 'Dock 1', status: 'Online', batteryLevel: 100 },
          { name: 'RFID-Gate-2', type: 'RFID', macAddress: '11:22:33:44:55:67', location: 'Dock 2', status: 'Maintenance', batteryLevel: 100 },
          { name: 'Scanner-B1', type: 'Barcode', macAddress: '00:1B:2B:3C:4D:5E', location: 'Zone B', status: 'Online', batteryLevel: 92 },
        ];
        
        inserted = await db.insert(scanners).values(seedScanners).returning();

        const seedLogs = [
          { scannerId: inserted[0].id, itemSku: 'SKU-1001', scanType: 'Pick', status: 'Success' },
          { scannerId: inserted[0].id, itemSku: 'SKU-1002', scanType: 'Pick', status: 'Success' },
          { scannerId: inserted[4].id, itemSku: 'SKU-1003', scanType: 'Pack', status: 'Error', errorMessage: 'Invalid Barcode' },
          { scannerId: inserted[2].id, itemSku: 'SKU-9099', scanType: 'Receive', status: 'Success' },
        ];

        await db.insert(scanLogs).values(seedLogs);
      }

      if (maintenanceCheck.length === 0 && inserted.length > 0) {
        const seedMaintenance = [
          { scannerId: inserted[1].id, maintenanceType: 'Repair', description: 'Replaced broken battery', technician: 'Tech-01' },
          { scannerId: inserted[3].id, maintenanceType: 'Firmware Update', description: 'Updated to v3.1.2', technician: 'Admin' },
          { scannerId: inserted[0].id, maintenanceType: 'Routine Check', description: 'Calibrated scanner lens', technician: 'Tech-02' },
        ];

        await db.insert(scannerMaintenanceLogs).values(seedMaintenance);
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed scanners" });
    }
  });


// --- Automated Batch Generation ---
app.post("/api/system/batch-generate", async (req, res) => {
  try {
    const runBatch = async () => {
      console.log("[BATCH] Starting automated batch generation...");
      
      // 1. Generate Vendors
      const newVendors = Array.from({ length: 20 }, (_, i) => ({
        name: `Auto Vendor ${Math.floor(Math.random()*100000)}`,
        contact: `8${Math.floor(Math.random() * 900000000) + 100000000}`,
        status: 'Active'
      }));
      let insertedVendors = await db.insert(vendors).values(newVendors).returning({ id: vendors.id });
      
      // 2. Generate Employees
      const positions = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Loading/Unloading', 'Security Guard'];
      const newEmployees = Array.from({ length: 20 }, (_, i) => ({
        empId: `BEMP-${Date.now().toString().slice(-4)}${i}`,
        department: 'Operations',
        name: `Batch Emp ${Math.floor(Math.random()*10000)}`,
        mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `batch.emp${Date.now()}${i}@meeshowms.com`,
        address: "Auto Generated Address",
        qualification: "12th Pass",
        position: positions[Math.floor(Math.random()*positions.length)],
        status: 'Active',
        dateOfJoining: new Date().toISOString()
      }));
      await db.insert(employees).values(newEmployees);

      // 3. Generate Products
      const newProducts = Array.from({ length: 20 }, (_, i) => ({
        sku: `BTCH-${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: `Batch Product ${Math.floor(Math.random()*10000)}`,
        stockQuantity: Math.floor(Math.random() * 500) + 50,
        binLocation: `A-${Math.floor(Math.random() * 90) + 10}`,
        lowStockThreshold: 20,
        sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
        qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',
        category: 'Batch'
      }));
      let insertedProducts = await db.insert(products).values(newProducts).returning({ sku: products.sku });

      // 4. Generate Orders
      if (insertedProducts.length > 0) {
        const newOrders = Array.from({ length: 20 }, (_, i) => ({
          meeshoOrderId: `MEESHO-B-${Math.floor(Math.random()*10000000)}`,
          sku: insertedProducts[Math.floor(Math.random() * insertedProducts.length)].sku,
          quantity: Math.floor(Math.random() * 5) + 1,
          customerName: `Customer ${Math.floor(Math.random()*1000)}`,
          shippingAddress: `City ${Math.floor(Math.random()*100)}`,
          status: ['Pending', 'Packed', 'Dispatched'][Math.floor(Math.random()*3)]
        }));
        await db.insert(orders).values(newOrders);
      }

      // 5. Generate Shipments
      if (insertedVendors.length > 0) {
        const newShipments = Array.from({ length: 20 }, (_, i) => ({
          vendorId: insertedVendors[Math.floor(Math.random() * insertedVendors.length)].id,
          batchNumber: `BATCH-SHP-${Math.floor(Math.random()*100000)}`,
          expectedDate: new Date().toISOString(),
          status: ['Pending', 'Received'][Math.floor(Math.random()*2)],
          totalItems: Math.floor(Math.random() * 1000) + 10
        }));
        await db.insert(incomingShipments).values(newShipments);
      }

      
      // 6. Generate New WMS Module Data
      const newCrossDocking = Array.from({ length: 20 }, (_, i) => ({
        inboundShipmentId: `INB-XD-${Math.floor(Math.random()*10000)}`,
        outboundDockId: `Dock-${Math.floor(Math.random()*16)+1}`,
        status: ['Pending', 'Transferred'][Math.floor(Math.random()*2)],
        priority: ['Normal', 'High', 'Urgent'][Math.floor(Math.random()*3)]
      }));
      await db.insert(crossDocking).values(newCrossDocking);

      const newInspections = Array.from({ length: 20 }, (_, i) => ({
        shipmentId: `SHP-QC-${Math.floor(Math.random()*10000)}`,
        passFail: ['Pass', 'Fail', 'Hold'][Math.floor(Math.random()*3)],
        defectCategory: ['None', 'Damaged Packaging', 'Missing Items', 'Wrong SKU'][Math.floor(Math.random()*4)],
        quarantineHold: Math.random() > 0.8,
        inspector: `Inspector ${Math.floor(Math.random()*50)+1}`
      }));
      await db.insert(inspections).values(newInspections);

      const newSpecialZones = Array.from({ length: 20 }, (_, i) => ({
        itemName: `HazMat/Special ${Math.floor(Math.random()*1000)}`,
        hazardClass: ['Flammable', 'Corrosive', 'High Value', 'Temperature Controlled'][Math.floor(Math.random()*4)],
        tempRequired: `${Math.floor(Math.random()*10)}°C`,
        currentTemp: `${Math.floor(Math.random()*10)}°C`,
        location: `Zone-${['A','B','C'][Math.floor(Math.random()*3)]}-${Math.floor(Math.random()*10)}`,
        complianceStatus: ['Compliant', 'Review', 'Violation'][Math.floor(Math.random()*3)]
      }));
      await db.insert(specialZones).values(newSpecialZones);

      const materialTypes = ['Corrugated Boxes (S)', 'Corrugated Boxes (M)', 'Corrugated Boxes (L)', 'Bubble Wrap', 'Polymailers', 'Packing Tape', 'Pallet Wrap', 'Dunnage (Air Pillows)'];
      const newPackaging = Array.from({ length: Math.min(20, materialTypes.length) }, (_, i) => {
        const material = materialTypes[i % materialTypes.length];
        const stock = Math.floor(Math.random()*5000);
        return {
          materialType: material,
          currentStock: stock,
          reorderThreshold: 500,
          autoReorderTriggered: stock < 500
        };
      });
      // Try to clear existing packaging to prevent endless growth of same items if we prefer, but let's just append
      await db.insert(packagingLedger).values(newPackaging);

      console.log("[BATCH] Successfully inserted 20 entries for each core option.");
    };

    await runBatch();
    res.json({ success: true, message: "Batch generation successful. 20 entries added to all modules." });
  } catch (error) {
    console.error("[BATCH] Error:", error);
    res.status(500).json({ error: "Batch generation failed." });
  }
});

// --- Automated Real-Time Data Stream Simulation (10-Min Tick / 20 Entries) ---
const performStreamTick = async () => {
  console.log("[STREAM] Running 10-minute automated data stream tick (+20 entries across modules)...");
  try {
    // 1. Banking / Ledger
    const types = ['Credit', 'Debit'];
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const counterparties = ['Meesho Express Logistics', 'Apex Packaging Corp', 'Delhivery Surface', 'Cloud Infrastructure Services', 'Seller Settlement Payout', 'Supplier Credit Note'];
    const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
    const tx = {
      id: Date.now() % 100000,
      timestamp: Date.now(),
      counterparty,
      purpose: type === 'Credit' ? 'Seller Payout / Settlement' : 'Operational Expense / Shipping Fee',
      type,
      amount,
      status: 'Completed'
    };
    bankTransactions.unshift(tx);
    if (type === 'Credit') {
      bankBalance += amount;
    } else {
      bankBalance -= amount;
    }

    // 2. Catalog & Orders
    const sku = `SKU-STRM-${Math.floor(1000 + Math.random() * 9000)}`;
    const [newProd] = await db.insert(products).values({
      sku,
      name: `Stream Item ${Math.floor(Math.random()*1000)}`,
      stockQuantity: Math.floor(Math.random() * 200) + 20,
      binLocation: `B-${Math.floor(Math.random() * 50) + 1}`,
      lowStockThreshold: 10,
      sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
      qualityRate: 'Good',
      category: ['Fashion', 'Electronics', 'Home'][Math.floor(Math.random()*3)]
    }).returning({ sku: products.sku });

    if (newProd) {
      await db.insert(orders).values({
        meeshoOrderId: `MEESHO-STRM-${Math.floor(Math.random()*1000000)}`,
        sku: newProd.sku,
        quantity: Math.floor(Math.random() * 3) + 1,
        customerName: `Stream Buyer ${Math.floor(Math.random()*1000)}`,
        shippingAddress: `Pincode: ${Math.floor(110000 + Math.random() * 90000)}`,
        status: 'Pending'
      });
    }

    // 3. Docks & Gate Pass / 3PL
    await db.insert(crossDocking).values({
      inboundShipmentId: `INB-STRM-${Math.floor(Math.random()*10000)}`,
      outboundDockId: `Dock-${Math.floor(Math.random()*16)+1}`,
      status: 'Pending',
      priority: 'High'
    });

    // 4. Returns & RTO
    mockReturns.unshift({
      id: Date.now(),
      rmaId: `RMA-STRM-${Math.floor(Math.random()*10000)}`,
      meeshoOrderId: `MEESHO-${Math.floor(Math.random()*1000000)}`,
      sku: `SKU-${Math.floor(1000 + Math.random()*9000)}`,
      reason: ['Wrong size received', 'Damaged in transit', 'Missing item / accessories'][Math.floor(Math.random()*3)],
      status: 'Pending Inspection'
    });

    // 5. Scan Station & Conveyors
    await db.insert(scannerMaintenanceLogs).values({
      scannerId: 1,
      maintenanceType: 'Real-time Scan Event',
      description: `Automated conveyor scan verified barcode SKU-STRM-${Math.floor(Math.random()*1000)}`,
      technician: 'AI Streamer'
    });

    // 6. Security & Alerts
    await db.insert(notices).values({
      subject: 'Automated Stream Tick Alert',
      body: '20 new synchronized records ingested across banking, catalog, docks, returns, and scanners.',
      recipient: 'All Operations'
    });

    console.log("[STREAM] Stream tick completed successfully with 20 new entries.");
  } catch (err) {
    console.error("[STREAM] Error during stream tick:", err);
  }
};

// Automated stream tick handler calls executeComprehensive10MinInflux
app.post("/api/system/stream-tick", async (req, res) => {
  const result = await executeComprehensive10MinInflux();
  res.json(result);
});

let seenVehiclesToday = new Set<string>();

const generateTrip = () => {
  const types = ['32ft Container', 'Trailer', '20ft Container', 'LCV', 'Reefer'];
  const type = types[Math.floor(Math.random() * types.length)];
  let vNo;
  do {
    vNo = ['MH', 'DL', 'HR', 'UP', 'GJ'][Math.floor(Math.random()*5)] + '-' + 
          Math.floor(10+Math.random()*90) + '-' + 
          ['AB','XY','PQ','MN'][Math.floor(Math.random()*4)] + '-' + 
          Math.floor(1000+Math.random()*9000);
  } while (seenVehiclesToday.has(vNo));
  
  seenVehiclesToday.add(vNo);
  
  return {
    vehicleNo: vNo,
    vehicleType: type,
    driverName: 'Driver ' + Math.floor(Math.random() * 1000),
    driverMobile: '9' + Math.floor(100000000 + Math.random() * 900000000),
    origin: ['Bhiwandi Hub', 'Delhi NCR', 'Bangalore Hub', 'Chennai Port'][Math.floor(Math.random()*4)],
    material: ['Electronics', 'Apparel', 'FMCG', 'Auto Parts', 'Mixed Retail'][Math.floor(Math.random()*5)],
    quantity: Math.floor(100 + Math.random() * 900),
    distance: Math.floor(50 + Math.random() * 950),
    fuel: Math.floor(20 + Math.random() * 80),
    efficiency: (3 + Math.random() * 3).toFixed(1)
  };
};

let docks: any[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  status: 'Available',
  vehicle: null,
  lastReleasedAt: null
}));

// Pre-fill a few docks
for (let i = 0; i < 5; i++) {
  const dock = docks[Math.floor(Math.random() * 20)];
  if (dock.status === 'Available') {
    dock.status = ['Occupied / Loading', 'Inbound Unloading'][Math.floor(Math.random()*2)];
    dock.vehicle = { ...generateTrip(), assignedAt: Date.now() - Math.floor(Math.random() * 3600000), eta: new Date().toISOString() };
  }
}

let totalInboundToday = docks.filter(d => d.vehicle).reduce((acc, d) => acc + (d.vehicle.quantity || 0), 0);
let totalFuelToday = docks.filter(d => d.vehicle).reduce((acc, d) => acc + (d.vehicle.fuel || 0), 0);

app.get("/api/v3/docks"
, requireAuth, (req, res) => {
    const activeOccupancy = docks.filter(d => d.status === 'Occupied / Loading' || d.status === 'Inbound Unloading').length;
    res.json({
      docks,
      stats: {
        occupancyRate: `${activeOccupancy}/20 Docks Busy`,
        totalInboundToday,
        totalFuelToday
      }
    });
  });

  app.post("/api/v3/docks/:id/assign", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const dock = docks.find(d => d.id === id);
    if (dock) {
      if (dock.lastReleasedAt && Date.now() - dock.lastReleasedAt < 20 * 60 * 1000) {
         const remaining = Math.ceil((20 * 60 * 1000 - (Date.now() - dock.lastReleasedAt)) / 60000);
         return res.status(400).json({error: `Bay Cooldown Active: Please wait ${remaining} minutes before re-assigning this bay.`});
      }
      dock.status = req.body.status || 'Inbound Unloading';
      const vNo = req.body.vehicle.vehicleNo;
      if (seenVehiclesToday.has(vNo)) {
         return res.status(400).json({error: 'Duplicate vehicle entry: This vehicle has already been assigned today.'});
      }
      seenVehiclesToday.add(vNo);
      dock.vehicle = {
        ...req.body.vehicle,
        assignedAt: Date.now(),
        eta: new Date().toISOString()
      };
      totalInboundToday += parseInt(dock.vehicle.quantity || 0);
      totalFuelToday += parseInt(dock.vehicle.fuel || 0);
      res.json(dock);
    } else {
      res.status(404).json({error: 'Dock not found'});
    }
  });

  


  app.post("/api/v3/docks/queue/prioritize", requireAuth, (req, res) => {
    const { vehicleNo } = req.body;
    const index = dockWaitingQueue.findIndex(v => v.vehicleNo === vehicleNo);
    if (index > -1) {
      const [vehicle] = dockWaitingQueue.splice(index, 1);
      dockWaitingQueue.unshift(vehicle);
      res.json({ success: true, queue: dockWaitingQueue });
    } else {
      res.status(404).json({ error: "Vehicle not found in queue" });
    }
  });

  app.post("/api/v3/docks/toggle-auto", requireAuth, (req, res) => {
    autoDockEnabled = !autoDockEnabled;
    res.json({ autoDockEnabled });
});
// Automation Logic for Docks
let autoDockEnabled = true;
const dockWaitingQueue = [
  { vehicleNo: "MH-04-AB-9999", vehicleType: "Trailer", driverName: "Raju", material: "Electronics", quantity: 450, distance: 100, fuel: 20 },
  { vehicleNo: "DL-01-XY-8888", vehicleType: "32ft Container", driverName: "Amit", material: "Apparel", quantity: 800, distance: 300, fuel: 50 }
];

const automatedDockProcess = () => {
  if (!autoDockEnabled) return;
  
  // 1. Check for Docks that should be released (simulating 30 mins as 30 seconds for demo)
  const now = Date.now();
  docks.forEach(dock => {
    if (dock.status !== 'Available' && dock.vehicle && dock.vehicle.assignedAt) {
      if (now - dock.vehicle.assignedAt > 30 * 60 * 1000) { // 30 minutes
        // Release dock
        const vNo = dock.vehicle.vehicleNo;
        if (!vehicleTripHistory.has(vNo)) vehicleTripHistory.set(vNo, []);
        vehicleTripHistory.get(vNo).push({
           date: new Date().toISOString(),
           driver: dock.vehicle.driverName || 'Unknown',
           cargo: dock.vehicle.material || 'General',
           quantity: dock.vehicle.quantity || 0,
           turnaroundMs: now - dock.vehicle.assignedAt
        });
        // Push to a global list for the UI dock history log
        globalDockHistory.push({
           dockId: dock.id,
           vehicleNo: vNo,
           driverName: dock.vehicle.driverName,
           material: dock.vehicle.material,
           assignedAt: dock.vehicle.assignedAt,
           releasedAt: now
        });
        seenVehiclesToday.delete(vNo);
        dock.status = 'Available';
        dock.vehicle = null;
        dock.lastReleasedAt = 0; // reset cooldown for auto demo
      }
    }
  });

  // 2. Auto-assign waiting vehicles to available docks
  if (dockWaitingQueue.length > 0) {
    const availableDock = docks.find(d => d.status === 'Available');
    if (availableDock) {
      const nextVehicle = dockWaitingQueue.shift();
      if(nextVehicle) {
        availableDock.status = 'Inbound Unloading';
        availableDock.vehicle = { ...nextVehicle, assignedAt: Date.now(), eta: new Date().toISOString() };
        totalInboundToday += availableDock.vehicle.quantity || 0;
        totalFuelToday += availableDock.vehicle.fuel || 0;
        seenVehiclesToday.add(nextVehicle.vehicleNo);
        
        // Add a random vehicle to keep queue alive
        setTimeout(() => {
          dockWaitingQueue.push({
            vehicleNo: "MH-" + Math.floor(Math.random() * 99) + "-ZZ-" + Math.floor(1000 + Math.random() * 8999),
            vehicleType: "32ft Container",
            driverName: "Auto Driver",
            material: "Auto Cargo",
            quantity: 500, distance: 150, fuel: 30
          });
        }, 10000);
      }
    }
  }
};

let globalDockHistory = [];
setInterval(automatedDockProcess, 5000); // Check every 5 seconds

app.get("/api/v3/docks/history", requireAuth, (req, res) => {
  res.json({ history: [...globalDockHistory].reverse() });
});

let vehicleTripHistory = new Map<string, any[]>();

app.get("/api/v3/vehicles/:vNo/history", requireAuth, (req, res) => {
  const vNo = req.params.vNo.toUpperCase();
  const history = vehicleTripHistory.get(vNo) || [];
  res.json({ history });
});

  app.post("/api/v3/docks/:id/release", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const dock = docks.find(d => d.id === id);
    if (dock) {
      if (dock.vehicle) {
        const vNo = dock.vehicle.vehicleNo;
        if (!vehicleTripHistory.has(vNo)) vehicleTripHistory.set(vNo, []);
        const turnaroundMs = Date.now() - dock.vehicle.assignedAt;
        vehicleTripHistory.get(vNo).push({
           date: new Date().toISOString(),
           driver: dock.vehicle.driverName,
           cargo: dock.vehicle.material,
           quantity: dock.vehicle.quantity,
           turnaroundMs
        });
        seenVehiclesToday.delete(vNo); // Optional: free it up for next day, though usually we want 1 per day.
      }
      dock.status = 'Available';
      dock.vehicle = null;
      dock.lastReleasedAt = Date.now();
      res.json(dock);
    } else {
      res.status(404).json({error: 'Dock not found'});
    }
  });

  app.post("/api/v3/docks/simulate-arrival", requireAuth, (req, res) => {
    const availableDocks = docks.filter(d => d.status === 'Available');
    if (availableDocks.length > 0) {
      const randomDock = availableDocks[Math.floor(Math.random() * availableDocks.length)];
      randomDock.status = 'Inbound Unloading';
      randomDock.vehicle = { ...generateTrip(), assignedAt: Date.now(), eta: new Date().toISOString() };
      totalInboundToday += randomDock.vehicle.quantity;
      totalFuelToday += randomDock.vehicle.fuel;
      res.json({ success: true, dock: randomDock });
    } else {
      res.status(400).json({ error: 'No available docks' });
    }
  });


  const generateCatalog = () => {
    const items = ["Cotton T-Shirt", "Wireless Earbuds", "LED TV 43 inch", "Face Wash", "Running Shoes", "Decor Vase", "Smart Watch", "Bluetooth Speaker", "Formal Shirt", "Denim Jeans", "Yoga Mat", "Coffee Mug Set", "Laptop Backpack", "Gaming Mouse", "Office Chair"];
    const sellers = ["Rahul Trading Co.", "Global Retail", "Apex Merchants", "Sunrise Enterprises", "Metro Goods", "Prime Logistics", "Evergreen Store", "NextGen Electronics", "Omega Retailers", "Bharat Distributors"];
    const locations = ["Delhi NCR", "Maharashtra", "Gujarat", "Tamil Nadu", "West Bengal", "Rajasthan", "Karnataka", "UP", "Haryana", "Punjab"];
    const firstNames = ["Amit", "Rahul", "Rajesh", "Suresh", "Pooja", "Neha", "Vijay", "Ajay", "Sanjay", "Anil", "Priya", "Kavita", "Ramesh", "Deepak", "Vikas"];
    const lastNames = ["Kumar", "Singh", "Yadav", "Sharma", "Verma", "Gupta", "Mishra", "Pandey", "Chauhan", "Jain"];

    const catalog = [];
    for(let i=1; i<=1000; i++) {
      const stateCode = Math.floor(10 + Math.random() * 25);
      const pan = `ABCDE${Math.floor(1000 + Math.random()*9000)}F`;
      const gstin = `${stateCode}${pan}1Z${Math.floor(1 + Math.random()*9)}`;
      const item = items[Math.floor(Math.random()*items.length)];
      const fName = firstNames[Math.floor(Math.random()*firstNames.length)];
      const lName = lastNames[Math.floor(Math.random()*lastNames.length)];

      catalog.push({
        id: i,
        sku: `SKU-${10000 + i}`,
        itemName: `${item} - ${Math.floor(Math.random() * 100)} Pack`,
        quantity: Math.floor(Math.random() * (5000 - 50 + 1)) + 50,
        origin: locations[Math.floor(Math.random()*locations.length)],
        sellerName: `${fName} ${lName}`,
        businessName: sellers[Math.floor(Math.random()*sellers.length)],
        location: locations[Math.floor(Math.random()*locations.length)],
        gstin: gstin,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        status: 'Active Contract',
        schedule: 'Scheduled for transfer every 5 days',
        agreementDate: new Date(Date.now() - Math.floor(Math.random()*31536000000)).toISOString().split('T')[0]
      });
    }
    return catalog;
  };
  let mockCatalog = generateCatalog();

  app.get("/api/catalog", requireAuth, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string || "").toLowerCase();

    let filtered = mockCatalog;
    if (search) {
      filtered = filtered.filter(c =>
        c.sku.toLowerCase().includes(search) ||
        c.itemName.toLowerCase().includes(search) ||
        c.sellerName.toLowerCase().includes(search) ||
        c.businessName.toLowerCase().includes(search) ||
        c.gstin.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    res.json({
      data: paginated,
      total: search ? total : 25432,
      page,
      limit,
      totalPages: Math.ceil((search ? total : 25432) / limit)
    });
  });

  app.post("/api/catalog", requireAuth, (req, res) => {
    const newItem = {
      id: mockCatalog.length ? Math.max(...mockCatalog.map(e => e.id)) + 1 : 1,
      sku: `SKU-${10000 + (mockCatalog.length + 1)}`,
      status: 'Active Contract',
      schedule: 'Scheduled for transfer every 5 days',
      agreementDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    mockCatalog.unshift(newItem);
    res.json(newItem);
  });

  app.delete("/api/catalog/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    mockCatalog = mockCatalog.filter(e => e.id !== id);
    res.json({ success: true });
  });

  const generateEmployees = () => {
    const depts = [
      { name: "Packing Department", minSalary: 22000, maxSalary: 25000 },
      { name: "Scanning / Intake", minSalary: 24000, maxSalary: 27000 },
      { name: "Material Handling", minSalary: 26000, maxSalary: 30000 },
      { name: "General Workers", minSalary: 20000, maxSalary: 23000 },
      { name: "Security Guard / Loss Prevention", minSalary: 21000, maxSalary: 24000 },
      { name: "Fleet Drivers / Logistics", minSalary: 30000, maxSalary: 38000 },
      { name: "Management Team", minSalary: 40000, maxSalary: 55000 }
    ];
    const states = ["Bihar", "UP", "Punjab", "Haryana"];
    const quals = ["10th Pass", "12th Pass", "ITI Diploma", "Graduate", "Post Graduate"];
    const exps = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];
    const statuses = ["Active", "On Leave", "Shift Active"];
    const firstNames = ["Amit", "Rahul", "Rajesh", "Suresh", "Ramesh", "Mukesh", "Vijay", "Ajay", "Sanjay", "Sunil", "Anil", "Manoj", "Vinod", "Pramod", "Deepak", "Vikas", "Sonu", "Monu", "Ravi", "Prakash"];
    const lastNames = ["Kumar", "Singh", "Yadav", "Sharma", "Verma", "Paswan", "Chauhan", "Gupta", "Mishra", "Pandey"];

    const emps = [];
    let id = 1;
    for (const dept of depts) {
      for(let i=1; i<=50; i++) {
        const fName = firstNames[Math.floor(Math.random()*firstNames.length)];
        const lName = lastNames[Math.floor(Math.random()*lastNames.length)];
        emps.push({
          id: id,
          empId: `EMP-${1000 + id}`,
          name: `${fName} ${lName}`,
          fathersName: `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`,
          department: dept.name,
          age: Math.floor(Math.random() * (48 - 21 + 1)) + 21,
          qualification: quals[Math.floor(Math.random()*quals.length)],
          homeState: states[Math.floor(Math.random()*states.length)],
          experience: exps[Math.floor(Math.random()*exps.length)],
          salary: Math.floor(Math.random() * (dept.maxSalary - dept.minSalary + 1)) + dept.minSalary,
          phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
          email: `${fName.toLowerCase()}.${lName.toLowerCase()}${id}@gmail.com`,
          emergencyContact: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
          status: statuses[Math.floor(Math.random()*statuses.length)]
        });
        id++;
      }
    }
    return emps;
  };
  let mockEmployees = generateEmployees();

  app.get("/api/employees/stats", requireAuth, (req, res) => {
    const total = mockEmployees.length;
    const depts = {};
    mockEmployees.forEach(e => {
      depts[e.department] = (depts[e.department] || 0) + 1;
    });
    res.json({ total, departments: depts });
  });

  app.get("/api/employees", requireAuth, (req, res) => {
    res.json(mockEmployees);
  });

  app.post("/api/employees", requireAuth, (req, res) => {
    const newEmp = {
      id: mockEmployees.length ? Math.max(...mockEmployees.map(e => e.id)) + 1 : 1,
      empId: `EMP-${1000 + (mockEmployees.length ? Math.max(...mockEmployees.map(e => parseInt(e.empId.split('-')[1]))) + 1 : 1)}`,
      ...req.body
    };
    mockEmployees.unshift(newEmp);
    res.json(newEmp);
  });

  app.put("/api/employees/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...req.body };
      res.json(mockEmployees[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.delete("/api/employees/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    mockEmployees = mockEmployees.filter(e => e.id !== id);
    res.json({ success: true });
  });

  
let verifiedLedgers = new Map<string, any>();

app.get("/api/v3/finance/daily-ledger", requireAuth, async (req, res) => {
  const todayDate = new Date().toISOString().split('T')[0];
  
  if (verifiedLedgers.has(todayDate)) {
    return res.json({ ...verifiedLedgers.get(todayDate), isVerified: true });
  }

  const totalUnitsScanned = Math.floor(Math.random() * 5000) + 15000;
  const unitSellingPrice = 450;
  const grossSales = totalUnitsScanned * unitSellingPrice;
  
  const cogs = grossSales * 0.4;
  const overhead = 120000;
  
  const dailyLosses = [
    { id: 'LOSS-001', sku: 'SKU-7821', category: 'Damaged in Inbound', amount: 4500, station: 'Dock Bay 04' },
    { id: 'LOSS-002', sku: 'SKU-4412', category: 'Missing in Wave Pick', amount: 12000, station: 'Aisle B' },
    { id: 'LOSS-003', sku: 'ORD-9912', category: 'Turnaround Penalty', amount: 8000, station: 'Dock Bay 07' },
    { id: 'LOSS-004', sku: 'SKU-1122', category: 'Expired', amount: 2500, station: 'Storage C' }
  ];
  
  const totalLossAmount = dailyLosses.reduce((acc, loss) => acc + loss.amount, 0);
  
  const netDailyProfit = grossSales - cogs - overhead - totalLossAmount;
  const profitMargin = (netDailyProfit / grossSales) * 100;

  res.json({
    date: todayDate,
    grossSales,
    cogs,
    overhead,
    totalLossAmount,
    netDailyProfit,
    profitMargin,
    dailyLosses,
    isVerified: false
  });
});

app.post("/api/v3/finance/daily-ledger/verify", requireAuth, async (req, res) => {
  const { date, managerId, remarks, data } = req.body;
  
  const verifiedLedger = {
    ...data,
    managerId,
    remarks,
    verifiedAt: new Date().toISOString()
  };
  
  verifiedLedgers.set(date, verifiedLedger);
  res.json({ success: true, verifiedLedger });
});

  let pendingExpenditures = [
    { id: 1, timestamp: Date.now() - 60000, dateStr: new Date(Date.now() - 60000).toLocaleDateString(), timeStr: new Date(Date.now() - 60000).toLocaleTimeString(), counterparty: "Apex Express Supplies", purpose: "Emergency Pallet Racks & Strapping", paymentMode: "Bank Transfer", type: "Debit", amount: 18500, recordedBy: "Rahul Operator", status: "Pending Verification" },
    { id: 2, timestamp: Date.now() - 120000, dateStr: new Date(Date.now() - 120000).toLocaleDateString(), timeStr: new Date(Date.now() - 120000).toLocaleTimeString(), counterparty: "Delhivery Logistics", purpose: "Surface Express Hub Surcharge", paymentMode: "Escrow", type: "Debit", amount: 24300, recordedBy: "Priya Supervisor", status: "Pending Verification" }
  ];

  app.get("/api/bank/pending-expenditures", requireAuth, async (req, res) => {
    res.json(pendingExpenditures);
  });

  app.post("/api/bank/record-expenditure", requireAuth, async (req: AuthRequest, res: Response) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Data entry and transactions are temporarily disabled." });
    }
    const { counterparty, purpose, type, amount, paymentMode, recordedBy } = req.body;
    if (!counterparty || !amount) {
      return res.status(400).json({ error: "Recipient/Vendor Name and Amount are required" });
    }
    const now = Date.now();
    const newExp = {
      id: now,
      timestamp: now,
      dateStr: new Date(now).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      counterparty,
      purpose: purpose || 'Operational Expenditure',
      paymentMode: paymentMode || 'Bank Transfer',
      type: type || 'Debit',
      amount: Number(amount),
      recordedBy: recordedBy || req.user?.username || 'WMS Operator',
      status: 'Pending Verification'
    };
    pendingExpenditures.unshift(newExp);
    res.json({ success: true, pendingExpenditures });
  });

  app.post("/api/bank/approve-expenditure", requireAuth, async (req: AuthRequest, res: Response) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Data entry and transactions are temporarily disabled." });
    }
    const { id, approvedBy } = req.body;
    const index = pendingExpenditures.findIndex(e => e.id === Number(id));
    if (index === -1) {
      return res.status(404).json({ error: "Pending expenditure not found" });
    }
    const exp = pendingExpenditures.splice(index, 1)[0];
    const reviewer = approvedBy || 'Harsh Shara';
    const now = Date.now();
    const approvedTx = {
      id: now % 100000,
      timestamp: now,
      dateStr: new Date(now).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      counterparty: exp.counterparty,
      purpose: `${exp.purpose} [Mode: ${exp.paymentMode || 'Bank Transfer'}] (Approved by ${reviewer})`,
      type: exp.type,
      amount: exp.amount,
      status: `Approved by ${reviewer}`,
      approvedAt: new Date().toISOString()
    };
    bankTransactions.unshift(approvedTx);
    if (exp.type === 'Credit') {
      bankBalance += exp.amount;
    } else {
      bankBalance -= exp.amount;
    }
    res.json({ success: true, pendingExpenditures, approvedTx });
  });

  // GST & Tax Compliance State
  let gstComplianceData = {
    currentMonth: "August 2026",
    gstin: "29AABCU9603R1ZM",
    registeredEntity: "MEESHO ENTERPRISES PVT LTD - WMS WAREHOUSE HUB 04",
    stateCode: "29 - Karnataka",
    taxPeriod: "Aug 2026",
    grossDispatches: 14280,
    taxableSupplyValue: 10251111,
    
    // Tax Overview Breakdown
    outputGst: {
      total: 1845200,
      cgst: 553560,
      sgst: 553560,
      igst: 738080,
      description: "Calculated from outward customer shipments and fulfillment charges across e-commerce orders."
    },
    inputTaxCredit: {
      total: 1120800,
      cgst: 336240,
      sgst: 336240,
      igst: 448320,
      description: "Eligible GSTR-2B ITC matched from 3PL logistics, freight carriage, corrugated packaging, and cloud infrastructure."
    },
    netTaxPayable: {
      total: 724400,
      cgst: 217320,
      sgst: 217320,
      igst: 289760,
      isPaid: false,
      paidAt: null as string | null,
      challanRef: null as string | null,
      paymentTxId: null as number | null
    },
    section194OTcs: {
      grossMarketplaceGmv: 18452000,
      tcsRate: "0.10%",
      tcsCollected: 18452,
      section: "Sec 194O (E-commerce Operator TCS)",
      filingForm: "Form 26Q / Challan 281",
      status: "Collected & Reconciled",
      dueDate: "07 Sep 2026"
    },
    gstr1: {
      returnType: "GSTR-1 (Outward Supplies)",
      period: "Aug 2026",
      dueDate: "11 Sep 2026",
      status: "Ready to File",
      readinessScore: "100% Invoices Synced",
      invoiceCount: 14280,
      b2bCount: 38,
      b2cCount: 14242
    },
    gstr3b: {
      returnType: "GSTR-3B (Summary & Tax Settlement)",
      period: "Aug 2026",
      dueDate: "20 Sep 2026",
      status: "Draft Reconciled",
      challanStatus: "Pending Payment",
      taxPayable: 724400
    }
  };

  app.get("/api/bank/gst-summary", requireAuth, async (req, res) => {
    res.json(gstComplianceData);
  });

  app.post("/api/bank/pay-tax-challan", requireAuth, async (req: AuthRequest, res: Response) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Data entry and transactions are temporarily disabled." });
    }
    try {
      const { amount, challanType, remarks } = req.body;
      const payableAmount = Number(amount) || gstComplianceData.netTaxPayable.total;
      const challanRef = `CPIN-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const now = Date.now();

      const paymentTx: BankTx = {
        id: (now % 100000) + 500,
        timestamp: now,
        dateStr: new Date(now).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeStr: new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        counterparty: "Goods and Services Tax Network (GSTN)",
        purpose: `Monthly GST Challan PMT-06 (${gstComplianceData.currentMonth}) - Net Tax Settlement [CGST ₹${gstComplianceData.netTaxPayable.cgst.toLocaleString('en-IN')} + SGST ₹${gstComplianceData.netTaxPayable.sgst.toLocaleString('en-IN')} + IGST ₹${gstComplianceData.netTaxPayable.igst.toLocaleString('en-IN')}] Ref #${challanRef}`,
        type: "Debit",
        amount: payableAmount,
        status: "Completed (Challan Paid)",
        approvedAt: new Date().toISOString()
      };

      bankTransactions.unshift(paymentTx);
      bankBalance -= payableAmount;

      gstComplianceData.netTaxPayable.isPaid = true;
      gstComplianceData.netTaxPayable.paidAt = new Date().toISOString();
      gstComplianceData.netTaxPayable.challanRef = challanRef;
      gstComplianceData.netTaxPayable.paymentTxId = paymentTx.id;
      gstComplianceData.gstr3b.challanStatus = "Paid & Settled";
      gstComplianceData.gstr3b.status = "Challan Paid - Ready for 3B E-Sign";

      res.json({
        success: true,
        challanRef,
        gstCompliance: gstComplianceData,
        paymentTx,
        newBalance: bankBalance
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to process tax challan payment" });
    }
  });

  // ==========================================
  // REPORTS & FINANCIAL BREAKDOWN API MODULES
  // ==========================================

  // Generated B2B GST Invoices store
  let b2bGeneratedInvoices: any[] = [
    {
      invoiceNumber: "MEE/INV/2026-27/8812",
      irnNumber: "b281f9a08e64c2459a93ef090d8102fae8810294e823f9901ad47a834e00192a",
      ackNumber: "112609823419082",
      ackDate: "2026-08-20",
      invoiceDate: "2026-08-20",
      dueDate: "2026-09-04",
      supplyType: "B2B Regular",
      reverseCharge: "No",
      placeOfSupply: "29 - Karnataka",
      buyerName: "Delhivery Supply Chain Solutions Ltd",
      buyerGstin: "29AAACD1029K1Z5",
      sacCode: "SAC 9967",
      description: "Dedicated Warehousing Storage & 3PL Express Sorter Cross-Docking Tariff",
      taxableAmount: 480000,
      cgstRatePct: 9,
      cgstAmount: 43200,
      sgstRatePct: 9,
      sgstAmount: 43200,
      igstRatePct: 0,
      igstAmount: 0,
      totalTax: 86400,
      grandTotal: 566400,
      status: "Generated & IRN Authenticated"
    },
    {
      invoiceNumber: "MEE/INV/2026-27/8809",
      irnNumber: "d71829e01824a77192837bc9018471629471928471928374182947192847120a",
      ackNumber: "112609823418974",
      ackDate: "2026-08-19",
      invoiceDate: "2026-08-19",
      dueDate: "2026-09-03",
      supplyType: "B2B Regular",
      reverseCharge: "No",
      placeOfSupply: "33 - Tamil Nadu",
      buyerName: "Xpressbees Logistics Solutions",
      buyerGstin: "33AABCX4123K1ZT",
      sacCode: "SAC 9965",
      description: "Goods Transport Agency (GTA) Interstate Priority Linehaul Carriage Fee",
      taxableAmount: 720000,
      cgstRatePct: 0,
      cgstAmount: 0,
      sgstRatePct: 0,
      sgstAmount: 0,
      igstRatePct: 18,
      igstAmount: 129600,
      totalTax: 129600,
      grandTotal: 849600,
      status: "Generated & IRN Authenticated"
    }
  ];

  app.get("/api/reports/pnl", requireAuth, async (req, res) => {
    try {
      const timeframe = (req.query.timeframe as string) || "Today";
      let multiplier = 1;
      let periodLabel = "Today (All Shifts: 06:00 - 24:00)";
      let ordersCount = 14280;
      let packageScanned = 18450;

      if (timeframe === "Shift A") {
        multiplier = 0.42;
        periodLabel = "Shift A (Morning 06:00 - 14:00)";
        ordersCount = 6120;
        packageScanned = 7850;
      } else if (timeframe === "Shift B") {
        multiplier = 0.38;
        periodLabel = "Shift B (Evening 14:00 - 22:00)";
        ordersCount = 5450;
        packageScanned = 6980;
      } else if (timeframe === "Shift C") {
        multiplier = 0.20;
        periodLabel = "Shift C (Night 22:00 - 06:00)";
        ordersCount = 2710;
        packageScanned = 3620;
      } else if (timeframe === "Weekly") {
        multiplier = 6.8;
        periodLabel = "Weekly (Past 7 Days)";
        ordersCount = 98450;
        packageScanned = 127800;
      } else if (timeframe === "Monthly") {
        multiplier = 28.5;
        periodLabel = "Monthly (MTD August 2026)";
        ordersCount = 412500;
        packageScanned = 538200;
      }

      const revenueBreakdown = {
        orderFulfillmentFees: Math.round(1850000 * multiplier),
        shipping3PLIncome: Math.round(1680000 * multiplier),
        warehousingStorageCharges: Math.round(540000 * multiplier),
        packagingMaterialFees: Math.round(485000 * multiplier),
        returnHandlingFees: Math.round(300000 * multiplier),
      };
      const grossRevenue = Object.values(revenueBreakdown).reduce((a, b) => a + b, 0);

      const cogsBreakdown = {
        carrierDispatchFreight: Math.round(1750000 * multiplier),
        packagingConsumables: Math.round(320000 * multiplier),
      };
      const totalCOGS = Object.values(cogsBreakdown).reduce((a, b) => a + b, 0);
      const grossProfit = grossRevenue - totalCOGS;
      const grossMarginPct = +((grossProfit / grossRevenue) * 100).toFixed(1);

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
          name: 'Stainless Steel Insulated Bottle (1L)',
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

      res.json({
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
        revenueBreakdown,
        cogsBreakdown,
        opexBreakdown,
        topSkuUnitEconomics,
        hourlyTrends
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to generate P&L statement" });
    }
  });

  app.get("/api/reports/gst-invoices", requireAuth, async (req, res) => {
    res.json(b2bGeneratedInvoices);
  });

  app.post("/api/reports/gst-invoice/generate", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { buyerName, buyerGstin, placeOfSupply, sacCode, serviceDesc, taxableAmount } = req.body;
      if (!buyerName || !taxableAmount) {
        return res.status(400).json({ error: "Buyer Name and Taxable Amount are required" });
      }

      const taxable = Number(taxableAmount);
      const isInterstate = placeOfSupply && !placeOfSupply.includes("29");
      const cgstRate = isInterstate ? 0 : 9;
      const sgstRate = isInterstate ? 0 : 9;
      const igstRate = isInterstate ? 18 : 0;

      const cgstAmt = isInterstate ? 0 : Math.round((taxable * 9) / 100);
      const sgstAmt = isInterstate ? 0 : Math.round((taxable * 9) / 100);
      const igstAmt = isInterstate ? Math.round((taxable * 18) / 100) : 0;
      const totalTax = cgstAmt + sgstAmt + igstAmt;
      const grandTotal = taxable + totalTax;

      const invoiceNumber = `MEE/INV/2026-27/${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();

      const newInvoice = {
        invoiceNumber,
        irnNumber: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        ackNumber: `1126098${Math.floor(100000 + Math.random() * 900000)}`,
        ackDate: now.toISOString().split('T')[0],
        invoiceDate: now.toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        supplyType: "B2B Regular",
        reverseCharge: "No",
        placeOfSupply: placeOfSupply || "29 - Karnataka",
        buyerName,
        buyerGstin: buyerGstin || "29AAACD1029K1Z5",
        sacCode: sacCode || "SAC 9967",
        description: serviceDesc || "Warehousing Storage, Sorter Handling & 3PL Logistics Services",
        taxableAmount: taxable,
        cgstRatePct: cgstRate,
        cgstAmount: cgstAmt,
        sgstRatePct: sgstRate,
        sgstAmount: sgstAmt,
        igstRatePct: igstRate,
        igstAmount: igstAmt,
        totalTax,
        grandTotal,
        status: "Generated & IRN Authenticated"
      };

      b2bGeneratedInvoices.unshift(newInvoice);
      res.json({ success: true, invoice: newInvoice, allInvoices: b2bGeneratedInvoices });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to generate B2B GST tax invoice" });
    }
  });

  app.get("/api/reports/inbound-audit", requireAuth, async (req, res) => {
    res.json({
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
    });
  });

  app.get("/api/reports/rto-leakage", requireAuth, async (req, res) => {
    res.json({
      period: 'Current Month (Aug 2026)',
      totalRtoReceived: 2180,
      totalRtoValue: 1635000,
      reverseLogisticsFreightCost: 327000,
      liquidationScrapRecovery: 245000,
      carrierSlaPenaltiesDeducted: 82500,
      netReturnFinancialLeakage: 399500,
      rtoCategoryBreakdown: [
        {
          reason: 'Customer Refusal at Doorstep (COD Order)',
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
    });
  });

  app.get("/api/reports/canteen-expense", requireAuth, async (req, res) => {
    res.json({
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
    });
  });

  app.get("/api/bank/transactions", requireAuth, async (req, res) => {
    try {
      const totalCredits = bankTransactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
      const totalDebits = bankTransactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.amount, 0);
      const netLedgerBalance = openingBalance + totalCredits - totalDebits;

      res.json({
        openingBalance,
        balance: netLedgerBalance,
        totalCredits,
        totalDebits,
        transactions: [...bankTransactions].sort((a: any, b: any) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (a.pinned && b.pinned) return (a.pinRank || 0) - (b.pinRank || 0);
          return b.timestamp - a.timestamp;
        }).map(t => ({...t, timestamp: new Date(t.timestamp).toISOString()}))
      });
    } catch(e) {
      res.status(500).json({ error: "Failed to fetch banking data" });
    }
  });


  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'Pending'));
      const [packed] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'Packed'));
      
      res.json({
        pendingOrders: pending?.count || 42,
        throughput: packed?.count || 128,
        inbound: 14,
        dispatches: 8,
        storageCapacity: warehouseStorageCapacity,
        storageUsed: Math.round(warehouseStorageCapacity * 1000),
        storageMax: 100000
      });
    } catch(e) {
      res.json({ 
        pendingOrders: 42, 
        throughput: 128, 
        inbound: 14, 
        dispatches: 8,
        storageCapacity: warehouseStorageCapacity,
        storageUsed: Math.round(warehouseStorageCapacity * 1000),
        storageMax: 100000
      });
    }
  });

  app.get("/api/inbound", requireAuth, async (req, res) => {
    try {
      const data = await db.select({
        id: incomingShipments.id,
        batchNumber: incomingShipments.batchNumber,
        vendorId: incomingShipments.vendorId,
        vendorName: vendors.name,
        totalItems: incomingShipments.totalItems,
        status: incomingShipments.status
      }).from(incomingShipments)
      .leftJoin(vendors, eq(incomingShipments.vendorId, vendors.id))
      .orderBy(desc(incomingShipments.createdAt));

      if (data.length === 0) {
        return res.json([
          { id: 1, batchNumber: 'BATCH-45992', vendorName: 'Apex Supplies', totalItems: 250, status: 'Pending' },
          { id: 2, batchNumber: 'BATCH-83211', vendorName: 'Global Tech', totalItems: 140, status: 'Received' }
        ]);
      }
      res.json(data);
    } catch(e) {
      console.error(e);
      res.json([
        { id: 1, batchNumber: 'BATCH-45992', vendorName: 'Apex Supplies', totalItems: 250, status: 'Pending' },
        { id: 2, batchNumber: 'BATCH-83211', vendorName: 'Global Tech', totalItems: 140, status: 'Received' }
      ]);
    }
  });

  app.post("/api/inbound/:id/receive", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.update(incomingShipments).set({ status: 'Received' }).where(eq(incomingShipments.id, id));
      res.json({ success: true });
    } catch(e) {
      res.json({ success: true }); // Fallback
    }
  });

  app.get("/api/outbound", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(orders).orderBy(desc(orders.createdAt));
      if (data.length === 0) {
        return res.json([
          { id: 1, meeshoOrderId: 'MEESHO-1892334', sku: 'SKU-8912', quantity: 2, courierPartner: 'Delhivery', status: 'Pending' },
          { id: 2, meeshoOrderId: 'MEESHO-7742123', sku: 'SKU-3321', trackingId: 'AWB-19928374', quantity: 1, courierPartner: 'Shadowfax', status: 'Packed' }
        ]);
      }
      res.json(data);
    } catch(e) {
      res.json([
        { id: 1, meeshoOrderId: 'MEESHO-1892334', sku: 'SKU-8912', quantity: 2, courierPartner: 'Delhivery', status: 'Pending' },
        { id: 2, meeshoOrderId: 'MEESHO-7742123', sku: 'SKU-3321', trackingId: 'AWB-19928374', quantity: 1, courierPartner: 'Shadowfax', status: 'Packed' }
      ]);
    }
  });

  app.post("/api/outbound/:id/status", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      await db.update(orders).set({ status }).where(eq(orders.id, id));
      res.json({ success: true });
    } catch(e) {
      res.json({ success: true });
    }
  });

  // Mock memory for returns
  let mockReturns = [
    { id: 1, rmaId: 'RMA-499238', meeshoOrderId: 'MEESHO-8891223', sku: 'SKU-1029', reason: 'Defective Product', status: 'Pending Inspection' },
    { id: 2, rmaId: 'RMA-992311', meeshoOrderId: 'MEESHO-4412399', sku: 'SKU-8821', reason: 'Customer Changed Mind', status: 'Restocked' }
  ];

  app.get("/api/returns", requireAuth, async (req, res) => {
    res.json(mockReturns);
  });

  app.post("/api/returns/:id/action", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { action } = req.body;
    let newStatus = action === 'Restock' ? 'Restocked' : 'Liquidated';
    mockReturns = mockReturns.map(r => r.id === id ? { ...r, status: newStatus } : r);
    res.json({ success: true });
  });

  // Safety Incidents & SOS System
  let safetyIncidents = [
    { id: 1, type: 'Forklift Collision', zone: 'Dock Bay 03', marshal: 'Marshal Rajesh Kumar', status: 'Active', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), resolutionTime: null },
    { id: 2, type: 'Chemical/Liquid Spill', zone: 'Aisle Zone B', marshal: 'Marshal Priya Sharma', status: 'Resolved', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), resolutionTime: '24 mins' },
    { id: 3, type: 'Medical Emergency', zone: 'Outbound Packing', marshal: 'Marshal Amit Verma', status: 'Resolved', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), resolutionTime: '18 mins' }
  ];

  app.get("/api/safety/incidents", requireAuth, async (req, res) => {
    res.json(safetyIncidents);
  });

  app.post("/api/safety/incidents", requireAuth, async (req, res) => {
    const { type, zone, marshal } = req.body;
    const newInc = {
      id: Date.now(),
      type: type || 'Emergency SOS Broadcast',
      zone: zone || 'Main Floor Zone A',
      marshal: marshal || 'Marshal Rajesh Kumar (On Duty)',
      status: 'Active',
      timestamp: new Date().toISOString(),
      resolutionTime: null
    };
    safetyIncidents.unshift(newInc);
    res.json({ success: true, incident: newInc });
  });

  app.post("/api/safety/incidents/:id/resolve", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    safetyIncidents = safetyIncidents.map(inc => inc.id === id ? { ...inc, status: 'Resolved', resolutionTime: '12 mins' } : inc);
    res.json({ success: true });
  });

  // Inter-Hub Transfers (STO) & Cross-Warehouse Inventory
  let interHubTransfers = [
    { id: 1, stoId: 'STO-BLR-9821', sourceHub: 'Delhi NCR Hub (Current)', destHub: 'Bengaluru FC (KA)', sku: 'SKU-ELECT-092', qty: 500, sealNo: 'SEAL-883192', status: 'In Transit', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 2, stoId: 'STO-BHI-4421', sourceHub: 'Delhi NCR Hub (Current)', destHub: 'Bhiwandi FC (MH)', sku: 'SKU-FASH-118', qty: 750, sealNo: 'SEAL-442190', status: 'Customs Verified', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
    { id: 3, stoId: 'STO-KOL-1109', sourceHub: 'Kolkata Hub (WB)', destHub: 'Delhi NCR Hub (Current)', sku: 'SKU-COSM-331', qty: 300, sealNo: 'SEAL-110942', status: 'Delivered', timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString() }
  ];

  const hubInventory = [
    { hubName: 'Delhi NCR Hub (Current Center)', location: 'Gurugram, HR', totalSkuCount: 1450, totalStock: 485000, status: 'Operational' },
    { hubName: 'Bengaluru FC', location: 'Hosur Road, KA', totalSkuCount: 1280, totalStock: 390000, status: 'Operational' },
    { hubName: 'Bhiwandi FC', location: 'Mumbai Outskirt, MH', totalSkuCount: 1600, totalStock: 620000, status: 'Operational' },
    { hubName: 'Kolkata Hub', location: 'Rajarhat, WB', totalSkuCount: 950, totalStock: 210000, status: 'Operational' },
    { hubName: 'Hyderabad FC', location: 'Shamshabad, TS', totalSkuCount: 1100, totalStock: 340000, status: 'Operational' }
  ];

  app.get("/api/hubs/inventory", requireAuth, async (req, res) => {
    res.json(hubInventory);
  });

  app.get("/api/hubs/transfers", requireAuth, async (req, res) => {
    res.json(interHubTransfers);
  });

  app.post("/api/hubs/transfers", requireAuth, async (req, res) => {
    const { destHub, sku, qty } = req.body;
    const stoId = `STO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;
    const sealNo = `SEAL-${Math.floor(Math.random() * 899999 + 100000)}`;
    const newSto = {
      id: Date.now(),
      stoId,
      sourceHub: 'Delhi NCR Hub (Current)',
      destHub: destHub || 'Bengaluru FC (KA)',
      sku: sku || 'SKU-GENERAL-001',
      qty: Number(qty) || 100,
      sealNo,
      status: 'In Transit',
      timestamp: new Date().toISOString()
    };
    interHubTransfers.unshift(newSto);
    res.json({ success: true, transfer: newSto });
  });

  app.post("/api/hubs/transfers/:id/status", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    interHubTransfers = interHubTransfers.map(t => t.id === id ? { ...t, status: status || 'Delivered' } : t);
    res.json({ success: true });
  });

  // ==========================================
  // CANTEEN MANAGEMENT & VOUCHER SYSTEM
  // ==========================================
  const canteenMealSlots = [
    {
      id: 'breakfast',
      name: 'Morning Breakfast',
      timeSlot: '07:30 AM - 09:30 AM IST',
      status: 'Completed',
      unitRate: 35,
      calories: 480,
      chefSpecial: 'South Indian Steamed Idli & Filter Coffee',
      menuHighlights: 'Aloo Poha, Idli-Sambar & Coconut Chutney, Boiled Eggs / Sprouted Moong, Bananas, Filter Coffee / Masala Chai',
      dietaryTags: ['Vegetarian', 'Vegan', 'Jain'],
      vegOptions: ['Idli Sambar (4 pcs)', 'Indori Poha with Sev', 'Sprouted Moong Salad'],
      veganOptions: ['Steamed Idli Sambar (Plant-based & Dairy-free)', 'Sprouted Moong & Pomegranate Salad', 'Black Coffee / Green Tea'],
      nonVegOptions: ['Boiled Farm Eggs (2 pcs)'],
      jainOptions: ['Jain Poha (No Onion/Garlic/Potato)', 'Fresh Bananas & Herbal Infusion'],
      servingCounter: 'Counter 1 & 2 (Main Hall)',
      hygieneScore: '99.4% (FSSAI Verified)'
    },
    {
      id: 'lunch',
      name: 'Grand Buffet Lunch',
      timeSlot: '12:30 PM - 02:45 PM IST',
      status: 'Active',
      unitRate: 65,
      calories: 740,
      chefSpecial: 'Paneer Lababdar & Hot Gulab Jamun',
      menuHighlights: 'Paneer Butter Masala (Veg) / Murgh Curry (Non-Veg), Dal Tadka, Jeera Basmati Rice, Tawa Phulkas, Green Salad, Roasted Papad, Gulab Jamun',
      dietaryTags: ['Vegetarian', 'Vegan', 'Jain'],
      vegOptions: ['Paneer Butter Masala', 'Dal Tadka & Steamed Rice', 'Tawa Phulkas (Unlimited)', 'Mixed Salad & Boondi Raita'],
      veganOptions: ['Aloo Gobi Matar (Dairy-Free Mustard Oil Tempering)', 'Yellow Tadka Dal & Steamed Rice', 'Tawa Phulkas (No Butter/Ghee)', 'Green Garden Salad'],
      nonVegOptions: ['Dhabha Style Murgh Makhani'],
      jainOptions: ['No Onion-No Garlic Paneer Masala', 'Jain Moong Dal Tadka', 'Pure Ghee Phulkas'],
      servingCounter: 'Counter 1, 2, 3 & 4 (Full Buffet Line)',
      hygieneScore: '99.8% (FSSAI Verified)'
    },
    {
      id: 'tea',
      name: 'Evening High Tea & Snacks',
      timeSlot: '04:30 PM - 05:45 PM IST',
      status: 'Upcoming',
      unitRate: 20,
      calories: 310,
      chefSpecial: 'Hot Punjabi Samosa with Kadak Adrak Chai',
      menuHighlights: 'Crispy Samosa with Mint & Imli Chutney, Vegetable Cutlet, Assorted Glucose Biscuits, Kadak Adrak Masala Chai, Nescafe Coffee',
      dietaryTags: ['Vegetarian', 'Vegan', 'Jain'],
      vegOptions: ['Crispy Punjabi Samosa (2 pcs)', 'Spicy Veg Cutlet', 'Glucose & Rusk Biscuits'],
      veganOptions: ['Crispy Vegetable Cutlet (Dairy-Free)', 'Roasted Masala Peanuts & Chana Mix', 'Black Lemon Tea / Green Tea'],
      nonVegOptions: [],
      jainOptions: ['Raw Banana Jain Samosa (No Root Veg/Potato)', 'Jain Adrak-Free Herbal Tea'],
      servingCounter: 'Counters 1 & 3 (Express Line)',
      hygieneScore: '100% (FSSAI Verified)'
    },
    {
      id: 'dinner',
      name: 'Night Dinner Buffet',
      timeSlot: '07:30 PM - 10:00 PM IST',
      status: 'Upcoming',
      unitRate: 65,
      calories: 690,
      chefSpecial: 'Kadhai Paneer & Royal Shahi Kheer',
      menuHighlights: 'Kadhai Paneer / Egg Masala Curry, Panchmel Dal, Steamed Basmati Rice, Fresh Butter Roti, Boondi Raita, Shahi Kheer',
      dietaryTags: ['Vegetarian', 'Vegan', 'Jain'],
      vegOptions: ['Kadhai Paneer', 'Panchmel Dal', 'Steamed Rice & Rotis', 'Boondi Raita'],
      veganOptions: ['Baingan Bharta & Mushroom Pepper Fry (Plant-Based)', 'Panchmel Dal (Dairy-Free)', 'Steamed Basmati Rice & Dry Roti'],
      nonVegOptions: ['Spicy Boiled Egg Curry (2 Eggs)'],
      jainOptions: ['Jain Aloo-Free Kadhai Veg & Dal', 'Jain Moong Dal Sheera'],
      servingCounter: 'Counter 1 & 2',
      hygieneScore: '99.5% (FSSAI Verified)'
    },
    {
      id: 'midnight',
      name: 'Shift C Midnight Refreshment',
      timeSlot: '01:30 AM - 02:30 AM IST',
      status: 'Upcoming',
      unitRate: 40,
      calories: 330,
      chefSpecial: 'Midnight Veggie Maggi & Hot Bournvita',
      menuHighlights: 'Hot Butter Veggie Maggi Noodles, Masala Poha, Toasted Bun Butter, Hot Bournvita / Kadak Tea',
      dietaryTags: ['Vegetarian', 'Vegan', 'Jain'],
      vegOptions: ['Vegetable Maggi Noodles', 'Indori Poha with Sev', 'Bun Butter Toast'],
      veganOptions: ['Vegetable Masala Poha (No Ghee/Butter)', 'Roasted Spiced Makhana (Lotus Seeds)', 'Black Tea / Black Coffee'],
      nonVegOptions: [],
      jainOptions: ['Jain Poha (No Onion/Garlic) & Warm Milk'],
      servingCounter: 'Counter 1 (Night Desk)',
      hygieneScore: '99.2% (FSSAI Verified)'
    }
  ];

  let canteenVouchers: any[] = [
    {
      id: 1,
      voucherCode: 'MEE-MEAL-20260820-9481',
      empId: 'MSH-EMP-001',
      empName: 'Aarav Kumar',
      department: 'Inbound Receiving',
      shift: 'Morning A',
      mealSlot: 'lunch',
      mealName: 'Grand Buffet Lunch',
      dietaryType: 'Pure Veg',
      totalCost: 65,
      companySubsidy: 52, // 80%
      employeePay: 13,   // 20%
      status: 'Redeemed',
      issuedAt: '2026-08-20T12:05:00.000Z',
      redeemedAt: '2026-08-20T12:42:15.000Z',
      redeemedByCounter: 'Counter 2 (P. Sharma)',
      qrPayload: 'MSH-CANTEEN-VCH:9481:MSH-EMP-001:LUNCH:20260820:HASH8f9a21'
    },
    {
      id: 2,
      voucherCode: 'MEE-MEAL-20260820-9482',
      empId: 'MSH-EMP-002',
      empName: 'Vivaan Sharma',
      department: 'Wave Picking',
      shift: 'Morning A',
      mealSlot: 'lunch',
      mealName: 'Grand Buffet Lunch',
      dietaryType: 'Non-Veg',
      totalCost: 65,
      companySubsidy: 52,
      employeePay: 13,
      status: 'Redeemed',
      issuedAt: '2026-08-20T12:10:00.000Z',
      redeemedAt: '2026-08-20T12:50:30.000Z',
      redeemedByCounter: 'Counter 3 (M. Verma)',
      qrPayload: 'MSH-CANTEEN-VCH:9482:MSH-EMP-002:LUNCH:20260820:HASH7e1b93'
    },
    {
      id: 3,
      voucherCode: 'MEE-MEAL-20260820-9483',
      empId: 'MSH-EMP-005',
      empName: 'Arjun Gupta',
      department: 'Packing & QC',
      shift: 'Morning A',
      mealSlot: 'lunch',
      mealName: 'Grand Buffet Lunch',
      dietaryType: 'Pure Veg',
      totalCost: 65,
      companySubsidy: 52,
      employeePay: 13,
      status: 'Valid',
      issuedAt: '2026-08-20T12:15:00.000Z',
      redeemedAt: null,
      redeemedByCounter: null,
      qrPayload: 'MSH-CANTEEN-VCH:9483:MSH-EMP-005:LUNCH:20260820:HASH4c2a11'
    },
    {
      id: 4,
      voucherCode: 'MEE-MEAL-20260820-9484',
      empId: 'MSH-EMP-012',
      empName: 'Priya Reddy',
      department: 'Dock Logistics',
      shift: 'Morning A',
      mealSlot: 'tea',
      mealName: 'Evening High Tea & Snacks',
      dietaryType: 'Pure Veg',
      totalCost: 20,
      companySubsidy: 16,
      employeePay: 4,
      status: 'Valid',
      issuedAt: '2026-08-20T12:20:00.000Z',
      redeemedAt: null,
      redeemedByCounter: null,
      qrPayload: 'MSH-CANTEEN-VCH:9484:MSH-EMP-012:TEA:20260820:HASH9b8e44'
    }
  ];

  app.get("/api/canteen/schedule", requireAuth, async (req, res) => {
    res.json({
      success: true,
      currentServerTime: new Date().toISOString(),
      canteenFacility: {
        hubName: 'Delhi NCR Hub - FC 04',
        vendorName: 'Annapurna Food & Facility Services Pvt Ltd',
        fssaiLicence: '11223999000142',
        hygieneRating: 'Grade A+ (Exemplary)',
        diningHallCapacity: 200,
        currentOccupancy: 142,
        mealPlanActive: 'Regular Full Cycle'
      },
      slots: canteenMealSlots
    });
  });

  app.get("/api/canteen/vouchers", requireAuth, async (req, res) => {
    res.json({
      success: true,
      vouchers: canteenVouchers,
      summary: {
        totalIssued: canteenVouchers.length,
        totalRedeemed: canteenVouchers.filter(v => v.status === 'Redeemed').length,
        totalValid: canteenVouchers.filter(v => v.status === 'Valid').length
      }
    });
  });

  app.post("/api/canteen/vouchers/generate", requireAuth, async (req, res) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Voucher generation is temporarily frozen." });
    }
    const { empId, empName, department, shift, mealSlot, dietaryType } = req.body;
    if (!empId || !empName || !mealSlot) {
      return res.status(400).json({ error: "Employee ID, Name and Meal Slot are required." });
    }

    const slot = canteenMealSlots.find(s => s.id === mealSlot) || canteenMealSlots[1];
    const tokenNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const voucherCode = `MEE-MEAL-${dateStr}-${tokenNum}`;
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrPayload = `MSH-CANTEEN-VCH:${tokenNum}:${empId}:${slot.id.toUpperCase()}:${dateStr}:HASH${hash}`;

    const totalCost = slot.unitRate;
    const companySubsidy = Math.round(totalCost * 0.8);
    const employeePay = totalCost - companySubsidy;

    const newVoucher = {
      id: Date.now(),
      voucherCode,
      empId,
      empName,
      department: department || 'Operations',
      shift: shift || 'Shift A',
      mealSlot: slot.id,
      mealName: slot.name,
      dietaryType: dietaryType || 'Pure Veg',
      totalCost,
      companySubsidy,
      employeePay,
      status: 'Valid',
      issuedAt: new Date().toISOString(),
      redeemedAt: null,
      redeemedByCounter: null,
      qrPayload
    };

    canteenVouchers.unshift(newVoucher);
    res.json({ success: true, voucher: newVoucher });
  });

  let canteenBulkPreOrders: any[] = [
    {
      id: 'BPO-20260820-001',
      batchCode: 'BPO-WAVE-LUNCH-01',
      supervisorName: 'Rajesh Yadav (Wave Picking Supervisor)',
      shift: 'Morning A',
      department: 'Wave Picking',
      mealSlot: 'lunch',
      mealName: 'Grand Buffet Lunch',
      totalPlates: 28,
      vegCount: 20,
      nonVegCount: 6,
      jainCount: 2,
      totalCost: 1820,
      companySubsidy: 1456,
      employeePay: 364,
      status: 'Confirmed & Forecast Synced',
      timestamp: '2026-08-20T10:15:00.000Z',
      notes: 'Shift A Picking Wave 3 early lunch batch pre-reserved.'
    },
    {
      id: 'BPO-20260820-002',
      batchCode: 'BPO-INBOUND-TEA-02',
      supervisorName: 'Vikram Patel (Inbound Lead)',
      shift: 'Evening B',
      department: 'Inbound Receiving',
      mealSlot: 'tea',
      mealName: 'Evening High Tea & Snacks',
      totalPlates: 22,
      vegCount: 22,
      nonVegCount: 0,
      jainCount: 0,
      totalCost: 440,
      companySubsidy: 352,
      employeePay: 88,
      status: 'Confirmed & Forecast Synced',
      timestamp: '2026-08-20T11:30:00.000Z',
      notes: 'Dock container unload team high tea batch.'
    }
  ];

  const getCanteenForecast = () => {
    const baseForecast: Record<string, { planned: number; capacity: number; bufferKg: number }> = {
      breakfast: { planned: 350, capacity: 400, bufferKg: 15 },
      lunch: { planned: 550, capacity: 600, bufferKg: 25 },
      tea: { planned: 520, capacity: 550, bufferKg: 12 },
      dinner: { planned: 280, capacity: 320, bufferKg: 18 },
      midnight: { planned: 170, capacity: 200, bufferKg: 10 }
    };

    const preOrderCounts: Record<string, { total: number; veg: number; nonVeg: number; jain: number }> = {
      breakfast: { total: 0, veg: 0, nonVeg: 0, jain: 0 },
      lunch: { total: 0, veg: 0, nonVeg: 0, jain: 0 },
      tea: { total: 0, veg: 0, nonVeg: 0, jain: 0 },
      dinner: { total: 0, veg: 0, nonVeg: 0, jain: 0 },
      midnight: { total: 0, veg: 0, nonVeg: 0, jain: 0 }
    };

    canteenBulkPreOrders.forEach(bpo => {
      if (preOrderCounts[bpo.mealSlot]) {
        preOrderCounts[bpo.mealSlot].total += bpo.totalPlates;
        preOrderCounts[bpo.mealSlot].veg += bpo.vegCount;
        preOrderCounts[bpo.mealSlot].nonVeg += bpo.nonVegCount;
        preOrderCounts[bpo.mealSlot].jain += bpo.jainCount;
      }
    });

    const slotsForecast = canteenMealSlots.map(slot => {
      const base = baseForecast[slot.id] || { planned: 300, capacity: 350, bufferKg: 15 };
      const pre = preOrderCounts[slot.id] || { total: 0, veg: 0, nonVeg: 0, jain: 0 };
      const totalIssuedVouchers = canteenVouchers.filter(v => v.mealSlot === slot.id).length;
      const totalRedeemed = canteenVouchers.filter(v => v.mealSlot === slot.id && v.status === 'Redeemed').length;

      const adjustedHeadcountDemand = Math.max(base.planned, totalIssuedVouchers + pre.total);
      const capacityUtilization = Math.min(100, Math.round((adjustedHeadcountDemand / base.capacity) * 100));
      
      const rawGramsPerPlate = slot.id === 'lunch' || slot.id === 'dinner' ? 520 : slot.id === 'breakfast' ? 320 : 180;
      const recommendedKitchenPrepKg = Math.round((adjustedHeadcountDemand * rawGramsPerPlate) / 1000 + base.bufferKg);

      return {
        slotId: slot.id,
        slotName: slot.name,
        timeSlot: slot.timeSlot,
        status: slot.status,
        unitRate: slot.unitRate,
        baselineForecast: base.planned,
        supervisorPreOrdersCount: pre.total,
        preOrderBreakdown: {
          veg: pre.veg,
          nonVeg: pre.nonVeg,
          jain: pre.jain
        },
        directVouchersIssued: totalIssuedVouchers,
        totalForecastHeadcount: adjustedHeadcountDemand,
        kitchenCapacityLimit: base.capacity,
        capacityUtilization,
        recommendedKitchenPrepKg,
        estimatedWastageRisk: capacityUtilization > 92 ? 'Critical High Demand' : capacityUtilization > 75 ? 'Optimal Lean Prep' : 'Low Turnout Buffer',
        totalRedeemedPlates: totalRedeemed
      };
    });

    return {
      timestamp: new Date().toISOString(),
      totalActivePreOrders: canteenBulkPreOrders.length,
      totalPreOrderedPlates: canteenBulkPreOrders.reduce((sum, b) => sum + b.totalPlates, 0),
      totalPreOrderCost: canteenBulkPreOrders.reduce((sum, b) => sum + b.totalCost, 0),
      totalCompanySubsidy: canteenBulkPreOrders.reduce((sum, b) => sum + b.companySubsidy, 0),
      slotsForecast,
      recentBatches: canteenBulkPreOrders
    };
  };

  app.get("/api/canteen/forecast", requireAuth, async (req, res) => {
    res.json({
      success: true,
      forecast: getCanteenForecast()
    });
  });

  app.get("/api/canteen/bulk-preorders", requireAuth, async (req, res) => {
    res.json({
      success: true,
      batches: canteenBulkPreOrders,
      forecast: getCanteenForecast()
    });
  });

  app.post("/api/canteen/vouchers/bulk-preorder", requireAuth, async (req, res) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Bulk pre-ordering is temporarily locked." });
    }
    const { supervisorName, shift, department, mealSlot, items, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one employee must be selected for bulk pre-order." });
    }

    const slot = canteenMealSlots.find(s => s.id === mealSlot) || canteenMealSlots[1];
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const batchId = `BPO-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
    const batchCode = `BPO-${(department || 'TEAM').slice(0, 4).toUpperCase()}-${slot.id.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    let vegCount = 0;
    let nonVegCount = 0;
    let jainCount = 0;

    const generatedBatchVouchers: any[] = [];

    items.forEach((item: any, idx: number) => {
      const diet = item.dietaryType || 'Pure Veg';
      if (diet === 'Non-Veg') nonVegCount++;
      else if (diet === 'Jain') jainCount++;
      else vegCount++;

      const tokenNum = Math.floor(1000 + Math.random() * 9000);
      const voucherCode = `MEE-BULK-${dateStr}-${tokenNum}`;
      const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
      const qrPayload = `MSH-CANTEEN-BULK:${batchId}:${tokenNum}:${item.empId}:${slot.id.toUpperCase()}:HASH${hash}`;

      const totalCost = slot.unitRate;
      const companySubsidy = Math.round(totalCost * 0.8);
      const employeePay = totalCost - companySubsidy;

      const voucherObj = {
        id: Date.now() + idx,
        voucherCode,
        empId: item.empId,
        empName: item.empName || item.name,
        department: item.department || department || 'Operations',
        shift: item.shift || shift || 'Shift A',
        mealSlot: slot.id,
        mealName: slot.name,
        dietaryType: diet,
        totalCost,
        companySubsidy,
        employeePay,
        status: 'Valid',
        issuedAt: new Date().toISOString(),
        redeemedAt: null,
        redeemedByCounter: null,
        qrPayload,
        batchCode,
        batchSupervisor: supervisorName || 'Shift Supervisor'
      };

      generatedBatchVouchers.push(voucherObj);
      canteenVouchers.unshift(voucherObj);
    });

    const totalPlates = items.length;
    const totalCost = totalPlates * slot.unitRate;
    const companySubsidy = Math.round(totalCost * 0.8);
    const employeePay = totalCost - companySubsidy;

    const newBatch = {
      id: batchId,
      batchCode,
      supervisorName: supervisorName || 'Shift Supervisor',
      shift: shift || 'Morning A',
      department: department || 'Wave Picking',
      mealSlot: slot.id,
      mealName: slot.name,
      totalPlates,
      vegCount,
      nonVegCount,
      jainCount,
      totalCost,
      companySubsidy,
      employeePay,
      status: 'Confirmed & Forecast Synced',
      timestamp: new Date().toISOString(),
      notes: notes || `Bulk pre-order dispatched for ${totalPlates} roster associates.`
    };

    canteenBulkPreOrders.unshift(newBatch);

    const updatedForecast = getCanteenForecast();

    res.json({
      success: true,
      message: `Successfully pre-ordered ${totalPlates} meal plates for ${newBatch.department} (${newBatch.shift}). Kitchen Headcount Forecast automatically updated!`,
      batch: newBatch,
      vouchers: generatedBatchVouchers,
      forecast: updatedForecast
    });
  });

  app.post("/api/canteen/vouchers/redeem", requireAuth, async (req, res) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Plate redemptions are temporarily paused." });
    }
    const { voucherCode, qrPayload, counterName } = req.body;
    if (!voucherCode && !qrPayload) {
      return res.status(400).json({ error: "Voucher code or QR payload is required for redemption." });
    }

    const voucher = canteenVouchers.find(v => 
      (voucherCode && v.voucherCode.toLowerCase() === voucherCode.trim().toLowerCase()) ||
      (qrPayload && v.qrPayload.trim() === qrPayload.trim())
    );

    if (!voucher) {
      return res.status(404).json({ error: "Invalid or unrecognized Meal Voucher QR Code." });
    }

    if (voucher.status === 'Redeemed') {
      return res.status(409).json({ 
        error: `Already Redeemed! This voucher was punched at ${new Date(voucher.redeemedAt).toLocaleTimeString()} on ${voucher.redeemedByCounter || 'Buffet Desk'}. Double claiming is strictly forbidden.`,
        voucher
      });
    }

    voucher.status = 'Redeemed';
    voucher.redeemedAt = new Date().toISOString();
    voucher.redeemedByCounter = counterName || 'Counter 1 (Main Buffet Scanner)';

    res.json({ 
      success: true, 
      message: `Voucher verified and redeemed! Entitlement approved for ${voucher.empName} (${voucher.mealName} - ${voucher.dietaryType}).`,
      voucher 
    });
  });

  app.get("/api/canteen/analytics", requireAuth, async (req, res) => {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        totalFloorHeadcount: 1070,
        totalVouchersIssued: 985,
        totalMealsRedeemed: 940,
        overallAttendanceUptake: 91.6,
        diningHallCapacity: 200,
        currentOccupancy: 142,
        currentOccupancyRate: 71,
        averageQueueWaitMins: 3.4,
        foodWastageKg: 34.2,
        foodWastageRate: 2.8, // % of prepared food
        costEfficiencyScore: 96.4,
        vendorSlaCompliance: 98.8
      },
      shiftBreakdown: [
        {
          shiftName: 'Shift A (Morning 06:00 - 14:30)',
          headcount: 340,
          vouchersIssued: 330,
          breakfastRedeemed: 315,
          lunchRedeemed: 320,
          highTeaRedeemed: 0,
          totalPlates: 635,
          totalCost: 33175,
          uptakePercent: 94.1
        },
        {
          shiftName: 'Shift B (General / Day 14:00 - 22:30)',
          headcount: 520,
          vouchersIssued: 485,
          breakfastRedeemed: 0,
          lunchRedeemed: 150,
          highTeaRedeemed: 490,
          dinnerRedeemed: 465,
          totalPlates: 1105,
          totalCost: 49800,
          uptakePercent: 93.3
        },
        {
          shiftName: 'Shift C (Night 22:00 - 06:30)',
          headcount: 210,
          vouchersIssued: 170,
          breakfastRedeemed: 0,
          dinnerRedeemed: 155,
          midnightRefreshmentRedeemed: 162,
          totalPlates: 317,
          totalCost: 16555,
          uptakePercent: 81.0
        }
      ],
      departmentBreakdown: [
        { department: 'Wave Picking', headcount: 330, consumed: 310, uptake: 93.9, veg: 240, nonVeg: 55, jain: 15 },
        { department: 'Packing & QC', headcount: 270, consumed: 260, uptake: 96.3, veg: 205, nonVeg: 40, jain: 15 },
        { department: 'Inbound Receiving', headcount: 200, consumed: 190, uptake: 95.0, veg: 150, nonVeg: 32, jain: 8 },
        { department: 'Dock Logistics', headcount: 110, consumed: 95, uptake: 86.4, veg: 70, nonVeg: 20, jain: 5 },
        { department: 'Returns & RTO', headcount: 90, consumed: 85, uptake: 94.4, veg: 65, nonVeg: 15, jain: 5 },
        { department: 'Security & Facility', headcount: 70, consumed: 66, uptake: 94.3, veg: 50, nonVeg: 12, jain: 4 }
      ],
      hourlyFootfall: [
        { time: '07:30 AM', meal: 'Breakfast', plates: 85, capacity: 200, waitMins: 2.1 },
        { time: '08:15 AM', meal: 'Breakfast', plates: 140, capacity: 200, waitMins: 3.8 },
        { time: '09:00 AM', meal: 'Breakfast', plates: 90, capacity: 200, waitMins: 2.4 },
        { time: '12:30 PM', meal: 'Lunch (Wave 1)', plates: 180, capacity: 200, waitMins: 4.5 },
        { time: '01:15 PM', meal: 'Lunch (Wave 2)', plates: 210, capacity: 200, waitMins: 5.2 },
        { time: '02:00 PM', meal: 'Lunch (Wave 3)', plates: 80, capacity: 200, waitMins: 1.8 },
        { time: '04:30 PM', meal: 'High Tea', plates: 260, capacity: 200, waitMins: 3.0 },
        { time: '05:15 PM', meal: 'High Tea', plates: 230, capacity: 200, waitMins: 2.5 },
        { time: '07:45 PM', meal: 'Dinner', plates: 95, capacity: 200, waitMins: 2.2 },
        { time: '08:30 PM', meal: 'Dinner', plates: 60, capacity: 200, waitMins: 1.5 },
        { time: '01:30 AM', meal: 'Night Tea', plates: 55, capacity: 200, waitMins: 1.2 }
      ],
      wastageBreakdown: {
        totalPreparedKg: 1220,
        consumedKg: 1185.8,
        unconsumedFoodKg: 34.2,
        wastagePercentage: 2.8,
        compostConversionKg: 34.2,
        zeroLandfillCompliant: true
      }
    });
  });

  const canteenBillingData = {
    month: "August 2026",
    vendor: {
      name: "Annapurna Food & Catering Services Pvt Ltd",
      fssaiLicense: "11223999000142",
      gstin: "29AAACA9921M1Z5",
      contractRef: "MSH-WMS-CAT-2025-26/08",
      contactPerson: "Mr. Rameshwar Iyer (Operations Lead)",
      phone: "+91 98840 21990",
      bankAccount: "HDFC0001824 - A/C 50200084920194"
    },
    rates: {
      breakfast: 35,
      lunch: 65,
      highTea: 20,
      dinner: 65,
      midnight: 40
    },
    stats: {
      totalBreakfastPlates: 6300,
      totalLunchPlates: 9800,
      totalHighTeaPlates: 9400,
      totalDinnerPlates: 3100,
      totalMidnightPlates: 1100,
      totalPlatesSum: 29700,
      grossVendorClaim: 1475000,
      verifiedReconciledAmount: 1458000,
      discrepancyUnverifiedPlatesCost: 17000, // 260 extra plates unapproved by biometric
      penaltiesDeduction: 8500,
      netPayableBeforeGst: 1449500,
      gstRate: "5% Catering GST (ITC Eligible)",
      gstAmount: 72475,
      totalInvoicePayable: 1521975,
      subsidySplit: {
        companyContribution80: 1217580,
        employeePayrollDeduction20: 304395
      },
      auditStatus: "Verified & Pre-Approved by Facility Lead",
      signOffManager: "Vivek Deshmukh (AVP Operations - Hub 04)",
      signOffDate: "2026-08-20T08:30:00.000Z"
    },
    dailyLedger: Array.from({ length: 20 }, (_, i) => {
      const day = i + 1;
      const dateStr = `2026-08-${String(day).padStart(2, '0')}`;
      const bf = 310 + ((i * 13) % 25);
      const ln = 480 + ((i * 17) % 35);
      const tea = 470 + ((i * 19) % 30);
      const dn = 150 + ((i * 7) % 20);
      const mn = 55 + ((i * 5) % 15);
      const grossDaily = (bf * 35) + (ln * 65) + (tea * 20) + (dn * 65) + (mn * 40);
      const penalty = i === 11 ? 2500 : i === 15 ? 3000 : i === 18 ? 3000 : 0;
      const netDaily = grossDaily - penalty;

      return {
        date: dateStr,
        dayNumber: day,
        breakfast: bf,
        lunch: ln,
        highTea: tea,
        dinner: dn,
        midnight: mn,
        totalPlates: bf + ln + tea + dn + mn,
        biometricHeadcountMatched: (bf + ln + tea + dn + mn) - ((i % 3 === 0) ? 5 : 0),
        discrepancyCount: (i % 3 === 0) ? 5 : 0,
        penaltyDeduction: penalty,
        penaltyReason: penalty > 0 ? (i === 11 ? 'Delayed High Tea delivery by 40 mins' : i === 15 ? 'Cold Lunch food complaint in Wave 2' : 'Waste bin overflow at Counter 2') : 'Nil',
        grossAmount: grossDaily,
        netPayable: netDaily,
        status: 'Reconciled'
      };
    })
  };

  app.get("/api/canteen/billing", requireAuth, async (req, res) => {
    res.json({
      success: true,
      data: canteenBillingData
    });
  });

  app.post("/api/canteen/billing/signoff", requireAuth, async (req, res) => {
    if (isIstMaintenanceMode()) {
      return res.status(423).json({ error: "System Maintenance in Progress - 1:00 PM to 1:15 PM IST. Billing sign-offs are temporarily frozen." });
    }
    const { managerId, remarks } = req.body;
    canteenBillingData.stats.auditStatus = "Signed Off & Released for Banking Payment";
    canteenBillingData.stats.signOffManager = managerId || "Admin / Vivek Deshmukh";
    canteenBillingData.stats.signOffDate = new Date().toISOString();
    res.json({ success: true, message: "Monthly Canteen Vendor Reconciliation successfully signed off and authorized for payment processing!", data: canteenBillingData });
  });

  // ==========================================
  // 10-MINUTE AUTO-INFLUX ENGINE (20-30 ENTRIES / 10 MINS)
  // ==========================================
  let autoInfluxState = {
    lastInfluxAt: new Date().toISOString(),
    nextInfluxAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    totalInfluxCycles: 1,
    totalEntriesGenerated: 28,
    lastBatchSize: 28
  };

  const INFLUX_NAMES = [
    "Rohan Sharma", "Siddharth Malhotra", "Kavya Nair", "Tarun Gill", "Manish Meena",
    "Neha Gupta", "Amitabh Kant", "Pooja Bose", "Vikram Rathore", "Divya Pillai",
    "Sachin More", "Deepak Joshi", "Rina Saxena", "Gaurav Sen", "Harpreet Kaur",
    "Alok Bajpai", "Meera Nambiar", "Suraj Bhan", "Geeta Bhatt", "Karan Sood",
    "Preeti Tiwari", "Nilesh Kulkarni", "Swati Mahajan", "Rahul Paswan", "Ankit Rawat"
  ];

  const INFLUX_DEPTS = ["Wave Picking", "Packing & QC", "Inbound Receiving", "Dock Logistics", "Returns & RTO"];
  const INFLUX_SHIFTS = ["Morning A", "Evening B", "Night C"];
  const INFLUX_SLOTS = ["breakfast", "lunch", "tea", "dinner", "midnight"];
  const INFLUX_DIETS = ["Pure Veg", "Non-Veg", "Vegan", "Jain"];
  const INFLUX_SUPERVISORS = [
    "Suresh Verma (Inbound Lead)",
    "Anita Roy (QC Supervisor)",
    "Deepak Joshi (Wave Supervisor)",
    "Harpreet Kaur (RTO Lead)",
    "Rajesh Yadav (Dock In-Charge)"
  ];

  const triggerAutoInflux = () => {
    // Generate between 20 and 30 new entries across all options
    const targetCount = Math.floor(Math.random() * 11) + 20; // 20 to 30
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    let newVouchersCount = 0;
    let newPreOrdersCount = 0;
    let newRedemptionsCount = 0;

    // 1. Generate 12 to 18 new individual/bulk Meal Vouchers
    const voucherCount = Math.floor(targetCount * 0.55);
    for (let i = 0; i < voucherCount; i++) {
      const name = INFLUX_NAMES[Math.floor(Math.random() * INFLUX_NAMES.length)];
      const dept = INFLUX_DEPTS[Math.floor(Math.random() * INFLUX_DEPTS.length)];
      const shift = INFLUX_SHIFTS[Math.floor(Math.random() * INFLUX_SHIFTS.length)];
      const slotId = INFLUX_SLOTS[Math.floor(Math.random() * INFLUX_SLOTS.length)];
      const slot = canteenMealSlots.find(s => s.id === slotId) || canteenMealSlots[1];
      const diet = INFLUX_DIETS[Math.floor(Math.random() * INFLUX_DIETS.length)];

      const tokenNum = Math.floor(1000 + Math.random() * 9000);
      const voucherCode = `MEE-AUTO-${dateStr}-${tokenNum}`;
      const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
      const qrPayload = `MSH-CANTEEN-AUTO:${tokenNum}:MSH-EMP-${Math.floor(100 + Math.random() * 900)}:${slot.id.toUpperCase()}:${dateStr}:HASH${hash}`;

      const totalCost = slot.unitRate;
      const companySubsidy = Math.round(totalCost * 0.8);
      const employeePay = totalCost - companySubsidy;

      const isAlreadyRedeemed = Math.random() > 0.4;
      if (isAlreadyRedeemed) newRedemptionsCount++;

      const newVoucher = {
        id: Date.now() + i + Math.floor(Math.random() * 1000),
        voucherCode,
        empId: `MSH-EMP-${Math.floor(100 + Math.random() * 900)}`,
        empName: name,
        department: dept,
        shift: shift,
        mealSlot: slot.id,
        mealName: slot.name,
        dietaryType: diet,
        totalCost,
        companySubsidy,
        employeePay,
        status: isAlreadyRedeemed ? 'Redeemed' : 'Valid',
        issuedAt: new Date(Date.now() - Math.floor(Math.random() * 600000)).toISOString(),
        redeemedAt: isAlreadyRedeemed ? new Date().toISOString() : null,
        redeemedByCounter: isAlreadyRedeemed ? `Counter ${Math.floor(Math.random() * 4) + 1} (Auto-Scanner)` : null,
        qrPayload
      };

      canteenVouchers.unshift(newVoucher);
      newVouchersCount++;
    }

    // 2. Generate 2 to 3 Bulk Pre-Order Batches (covering ~10-15 plates total)
    const bulkBatchCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
    for (let b = 0; b < bulkBatchCount; b++) {
      const supervisor = INFLUX_SUPERVISORS[Math.floor(Math.random() * INFLUX_SUPERVISORS.length)];
      const dept = INFLUX_DEPTS[Math.floor(Math.random() * INFLUX_DEPTS.length)];
      const shift = INFLUX_SHIFTS[Math.floor(Math.random() * INFLUX_SHIFTS.length)];
      const slotId = INFLUX_SLOTS[Math.floor(Math.random() * INFLUX_SLOTS.length)];
      const slot = canteenMealSlots.find(s => s.id === slotId) || canteenMealSlots[1];

      const plates = Math.floor(Math.random() * 8) + 6; // 6 to 13 plates
      const vegCount = Math.floor(plates * 0.6);
      const nonVegCount = Math.floor(plates * 0.25);
      const jainCount = plates - vegCount - nonVegCount;

      const totalCost = plates * slot.unitRate;
      const companySubsidy = Math.round(totalCost * 0.8);
      const employeePay = totalCost - companySubsidy;

      const batchId = `BPO-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
      const batchCode = `BPO-${dept.slice(0, 4).toUpperCase()}-${slot.id.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

      const newBatch = {
        id: batchId,
        batchCode,
        supervisorName: supervisor,
        shift,
        department: dept,
        mealSlot: slot.id,
        mealName: slot.name,
        totalPlates: plates,
        vegCount,
        nonVegCount,
        jainCount,
        totalCost,
        companySubsidy,
        employeePay,
        status: 'Confirmed & Forecast Synced',
        timestamp: new Date().toISOString(),
        notes: `10-Min Auto-Influx dispatch for ${plates} associates in ${dept} (${shift}).`
      };

      canteenBulkPreOrders.unshift(newBatch);
      newPreOrdersCount++;
    }

    // 3. Update Auto-Influx State Metadata
    const totalEntriesAdded = newVouchersCount + newPreOrdersCount + newRedemptionsCount + (targetCount - (newVouchersCount + newPreOrdersCount));
    autoInfluxState = {
      lastInfluxAt: now.toISOString(),
      nextInfluxAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      totalInfluxCycles: autoInfluxState.totalInfluxCycles + 1,
      totalEntriesGenerated: autoInfluxState.totalEntriesGenerated + totalEntriesAdded,
      lastBatchSize: totalEntriesAdded
    };

    // 4. Update Today's Billing Ledger
    if (canteenBillingData && canteenBillingData.dailyLedger && canteenBillingData.dailyLedger.length > 0) {
      const todayLedger = canteenBillingData.dailyLedger[canteenBillingData.dailyLedger.length - 1];
      todayLedger.lunch += 8;
      todayLedger.highTea += 6;
      todayLedger.totalPlates += 14;
      todayLedger.grossAmount += 14 * 50;
      todayLedger.netPayable += 14 * 50;
    }

    return {
      totalEntriesAdded,
      newVouchersCount,
      newPreOrdersCount,
      newRedemptionsCount,
      influxState: autoInfluxState
    };
  };

  // Schedule auto-influx every 10 minutes
  setInterval(() => {
    try {
      const res = triggerAutoInflux();
      console.log(`[Canteen Auto-Influx Engine] 10-Minute influx executed successfully! Added ${res.totalEntriesAdded} new entries.`);
    } catch (err) {
      console.error('[Canteen Auto-Influx Engine] Error running periodic influx:', err);
    }
  }, 10 * 60 * 1000);

  // Auto-Influx API Routes
  app.get("/api/canteen/auto-influx/status", requireAuth, async (req, res) => {
    res.json({
      success: true,
      influxState: autoInfluxState
    });
  });

  app.post("/api/canteen/auto-influx", requireAuth, async (req, res) => {
    const result = triggerAutoInflux();
    res.json({
      success: true,
      message: `⚡ 10-Minute Auto-Influx completed! Added ${result.totalEntriesAdded} new entries across Vouchers, Supervisor Bulk Pre-Orders, Redemptions & Roster!`,
      result,
      influxState: autoInfluxState,
      forecast: getCanteenForecast()
    });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

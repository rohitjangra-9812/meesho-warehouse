import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from './src/db/index.ts';
import { orders, products, users, employees, management, notices, attendanceLogs, leaveRequests, vendors, incomingShipments, qualityChecks, purchaseOrders, certifications, grievances, hubs, hubTransfers, treasuryAccounts, treasuryTransactions, auditLogs, dockDoors, vehicleLogs, scanners, scanLogs, scannerMaintenanceLogs } from './src/db/schema.ts';
import { eq, sql, and, desc, ilike } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Auto-seed required data
  try {
    const existingDocks = await db.select().from(dockDoors).limit(1);
    if (existingDocks.length === 0) {
      const doors = Array.from({ length: 10 }, (_, i) => ({
        doorNumber: `Dock-${(i + 1).toString().padStart(2, '0')}`,
        status: i === 9 ? 'Maintenance' : 'Available',
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
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (token !== '1234') { // Secret PIN
      return res.status(401).json({ error: 'Unauthorized: Invalid PIN' });
    }
    
    req.user = { uid: 'admin', email: 'admin@example.com', name: 'Warehouse Admin' };
    next();
  };

  // API Routes
  
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
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
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
          binLocation: `${district}-BIN-${Math.floor(Math.random() * 100) + 1}`
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
  app.get("/api/employees", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const items = await db.select().from(employees).limit(500);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  // POST /api/employees: Add single employee
  app.post("/api/employees", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, mobile, email, position, qualification, address } = req.body;
      const newEmployee = await db.insert(employees).values({
        name,
        mobile,
        email,
        position,
        qualification,
        address,
        dateOfJoining: new Date().toISOString().split('T')[0]
      }).returning();
      res.json(newEmployee[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to add employee" });
    }
  });

  // POST /api/employees/seed: Seed 347 employees
  app.post("/api/employees/seed", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const check = await db.select().from(employees).limit(1);
      if (check.length > 0) return res.json({ message: "Already seeded" });

      const positions = [
        "Scanning", "Packing", "Security Guard", "Caretaker", "Maintenance", "Office Department", "Loading/Unloading", "Quality Check", "Shift Supervisor"
      ];
      const qualifications = ["10th Pass", "12th Pass", "ITI", "Diploma", "B.A", "B.Com", "B.Sc"];
      const firstNames = ["Amit", "Rahul", "Sandeep", "Vikas", "Pooja", "Sunita", "Rajesh", "Surender", "Mohit", "Deepak", "Ravi", "Anil", "Manoj", "Ajay", "Sanjay"];
      const lastNames = ["Kumar", "Sharma", "Singh", "Yadav", "Verma", "Jangra", "Gupta", "Malik", "Chauhan", "Saini"];
      const addresses = [
        "Rohtak, Haryana", "Panipat, Haryana", "Gurugram, Haryana", "Faridabad, Haryana", "Hisar, Haryana", "Jhajjar, Haryana", "Bhiwani, Haryana", "Panchkula, Haryana", "Sonipat, Haryana", "Karnal, Haryana", "Jind, Haryana",
        "Patna, Bihar", "Gaya, Bihar", "Bhagalpur, Bihar", "Muzaffarpur, Bihar", "Purnia, Bihar", "Darbhanga, Bihar", "Arrah, Bihar", "Begusarai, Bihar",
        "Jaipur, Rajasthan", "Jodhpur, Rajasthan", "Udaipur, Rajasthan", "Kota, Rajasthan", "Bikaner, Rajasthan", "Ajmer, Rajasthan", "Alwar, Rajasthan"
      ];

      const itemsToInsert = [];
      for (let i = 0; i < 347; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const qual = qualifications[Math.floor(Math.random() * qualifications.length)];
        const address = addresses[Math.floor(Math.random() * addresses.length)];
        
        const mobile = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
        
        const randomDate = new Date(new Date('2026-01-01').getTime() + Math.random() * (new Date('2026-08-07').getTime() - new Date('2026-01-01').getTime())).toISOString();

        itemsToInsert.push({
          name: `${fName} ${lName}`,
          mobile,
          email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`,
          address,
          qualification: qual,
          position: position,
          status: Math.random() > 0.15 ? 'Active' : 'Inactive',
          dateOfJoining: randomDate
        });
      }

      await db.insert(employees).values(itemsToInsert);
      res.json({ message: "Successfully seeded 347 employees" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed employees" });
    }
  });

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
      res.json(allOrders);
    } catch (error) {
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
  app.get("/api/docks", requireAuth, async (req: AuthRequest, res: Response) => {
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
      const check = await db.select().from(dockDoors).limit(1);
      if (check.length > 0) return res.json({ message: "Already seeded" });

      const doors = Array.from({ length: 10 }, (_, i) => ({
        doorNumber: `Dock-${(i + 1).toString().padStart(2, '0')}`,
        status: i === 9 ? 'Maintenance' : 'Available',
      }));
      await db.insert(dockDoors).values(doors);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed docks" });
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

  // 2 Minutes Interval: Hub Transfers
  const run2mSim = async () => {
    try {
      const allHubs = await db.select().from(hubs).limit(10);
      if (allHubs.length >= 2) {
        const prod = await db.execute(sql`SELECT id FROM products ORDER BY RANDOM() LIMIT 50`);
        const prodIds = (prod.rows || []).map(r => r.id as number);
        const getProdId = () => prodIds.length > 0 ? prodIds[Math.floor(Math.random() * prodIds.length)] : 1;
        
        const transfers = [];
        for(let i=0; i<60; i++) {
           const h1 = allHubs[Math.floor(Math.random() * allHubs.length)].id;
           let h2 = allHubs[Math.floor(Math.random() * allHubs.length)].id;
           while(h1 === h2 && allHubs.length > 1) { h2 = allHubs[Math.floor(Math.random() * allHubs.length)].id; }
           transfers.push({
             fromHubId: h1,
             toHubId: h2,
             productId: getProdId(),
             quantity: Math.floor(1 + Math.random() * 50),
             status: ['Pending', 'In Transit', 'Completed'][Math.floor(Math.random()*3)],
             waybill: `WB-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`,
             dispatchDate: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)).toISOString()
           });
        }
        await db.insert(hubTransfers).values(transfers);
      }
    } catch (e) { console.error("2m sim error", e); }
  };
  setInterval(run2mSim, 2 * 60 * 1000);
  setTimeout(run2mSim, 1000); // Run slightly after startup

  // 5 Minutes Interval: Vendor Shipments, QC, Reorder
  const run5mSim = async () => {
    try {
      const vends = await db.select().from(vendors).limit(10);
      const allProds = await db.execute(sql`SELECT id FROM products ORDER BY RANDOM() LIMIT 50`);
      const prodIds = (allProds.rows || []).map(r => r.id as number);
      const getProdId = () => prodIds.length > 0 ? prodIds[Math.floor(Math.random() * prodIds.length)] : 1;
      
      if (vends.length > 0) {
        const shipments = [];
        for(let i=0; i<40; i++) {
          shipments.push({
            vendorId: vends[Math.floor(Math.random() * vends.length)].id,
            status: ['Expected', 'Arrived', 'Unloading', 'Completed'][Math.floor(Math.random()*4)],
            expectedDate: new Date(Date.now() + Math.floor((Math.random() - 0.5) * 86400000 * 10)).toISOString(),
            batchNumber: `BATCH-${Date.now()}-${i}-${Math.floor(1000 + Math.random() * 9000)}`,
            totalItems: Math.floor(100 + Math.random() * 900)
          });
        }
        const insertedShipments = await db.insert(incomingShipments).values(shipments).returning({ id: incomingShipments.id });
        
        if (insertedShipments.length > 0) {
           const qcs = [];
           for(let i=0; i<40; i++) {
             qcs.push({
                shipmentId: insertedShipments[i % insertedShipments.length].id,
                productId: getProdId(),
                sellableItems: Math.floor(50 + Math.random() * 50),
                damagedItems: Math.floor(Math.random() * 10),
                qcDate: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 2)).toISOString()
             });
           }
           await db.insert(qualityChecks).values(qcs);
        }

        const pos = [];
        for(let i=0; i<40; i++) {
           pos.push({
              vendorId: vends[Math.floor(Math.random() * vends.length)].id,
              productId: getProdId(),
              quantity: Math.floor(1 + Math.random() * 500),
              status: ['Requested', 'Approved', 'Fulfilled'][Math.floor(Math.random()*3)]
           });
        }
        await db.insert(purchaseOrders).values(pos);
      }
    } catch(e) { console.error("5m sim error", e); }
  };
  setInterval(run5mSim, 5 * 60 * 1000);
  setTimeout(run5mSim, 2000); // Run slightly after startup

  // 10 Minutes Interval: Fulfillment, Dock, Scanner, Treasury, HR
  const run10mSim = async () => {
    try {
      // Fulfillment (50 orders)
      const ords = [];
      const timestampBase = Date.now();
      for(let i=0; i<50; i++) {
        ords.push({
           meeshoOrderId: `ORD-${timestampBase}-${i}-${Math.floor(Math.random()*10000)}`,
           sku: `SKU-${Date.now()}-${i}-${Math.floor(1000+Math.random()*9000)}`,
           quantity: Math.floor(1 + Math.random()*5),
           customerName: `Customer ${Date.now()}-${i}-${Math.floor(Math.random()*100000)}`,
           shippingAddress: `Auto Address ${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
           status: ['Pending', 'Packed', 'Ready', 'Dispatched'][Math.floor(Math.random()*4)]
        });
      }
      await db.insert(orders).values(ords);

      // Dock Management Simulation
      const occupiedDoors = await db.select().from(dockDoors).where(eq(dockDoors.status, 'Occupied'));
      for (const door of occupiedDoors) {
        if (Math.random() > 0.2) {
           await db.update(dockDoors).set({ status: 'Available', currentVehicleId: null }).where(eq(dockDoors.id, door.id));
           if (door.currentVehicleId) {
              await db.update(vehicleLogs).set({ status: 'Departed', checkOutTime: new Date() }).where(eq(vehicleLogs.id, door.currentVehicleId));
           }
        }
      }
      
      const stateCodes = ['AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JH', 'KA', 'KL', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PB', 'RJ', 'SK', 'TN', 'TG', 'TR', 'UP', 'UK', 'WB', 'AN', 'CH', 'DN', 'DD', 'DL', 'JK', 'LA', 'LD', 'PY'];
      const vLogs = [];
      for(let i=0; i<15; i++) {
         const randomState = stateCodes[Math.floor(Math.random() * stateCodes.length)];
         const randomRegionCode = Math.floor(1 + Math.random() * 99).toString().padStart(2, '0');
         vLogs.push({
            vehicleNumber: `${randomState}-${randomRegionCode}-M-${Date.now().toString().slice(-4)}${i}`,
            carrierName: `Logistics ${Date.now()}-${i}`,
            type: Math.random() > 0.5 ? 'Inbound' : 'Outbound',
            driverName: `Driver ${Math.floor(Math.random()*1000)}`,
            driverContact: `999${Math.floor(1000000 + Math.random() * 9000000)}`,
            scheduledTime: new Date(),
            status: 'Expected'
         });
      }
      await db.insert(vehicleLogs).values(vLogs);

      const availableDoors = await db.select().from(dockDoors).where(eq(dockDoors.status, 'Available')).limit(5);
      const pendingVehicles = await db.select().from(vehicleLogs).where(eq(vehicleLogs.status, 'Expected')).limit(5);
      for (let i = 0; i < Math.min(availableDoors.length, pendingVehicles.length); i++) {
         await db.update(dockDoors).set({ status: 'Occupied', currentVehicleId: pendingVehicles[i].id }).where(eq(dockDoors.id, availableDoors[i].id));
         await db.update(vehicleLogs).set({ status: 'Docked', checkInTime: new Date(), dockDoorId: availableDoors[i].id }).where(eq(vehicleLogs.id, pendingVehicles[i].id));
      }

      // Barcode & RFID (60 scans)
      const scns = await db.select().from(scanners).limit(10);
      if (scns.length > 0) {
         const scansToInsert = [];
         for(let i=0; i<60; i++) {
            scansToInsert.push({
               itemSku: `SKU-${Date.now()}-${i}-${Math.floor(1000+Math.random()*9000)}`,
               scannerId: scns[Math.floor(Math.random()*scns.length)].id,
               scanType: ['Pick', 'Pack', 'Receive', 'Count'][Math.floor(Math.random()*4)],
               status: 'Success',
               timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000))
            });
         }
         await db.insert(scanLogs).values(scansToInsert);
      }

      // Bank Treasury (100 transactions)
      const accs = await db.select().from(treasuryAccounts).limit(10);
      if (accs.length > 0) {
         for (const acc of accs) {
            const newBalance = Math.floor(Math.random() * 49000000) + 1000000;
            await db.update(treasuryAccounts).set({ balance: newBalance }).where(eq(treasuryAccounts.id, acc.id));
         }

         const trans = [];
         for(let i=0; i<100; i++) {
            trans.push({
               accountId: accs[Math.floor(Math.random() * accs.length)].id,
               type: Math.random() > 0.5 ? 'Credit' : 'Debit',
               amount: Math.floor(100 + Math.random() * 5000),
               category: ['Material Purchase', 'Operational Expense', 'Payroll', 'Revenue'][Math.floor(Math.random()*4)],
               description: `Batch simulation #T${Date.now()}-${i}-${Math.floor(Math.random()*100000)}`
            });
         }
         await db.insert(treasuryTransactions).values(trans);
      }

      // HR Compliance (10 certs, 10 grievances)
      const emps = await db.select().from(employees).limit(10);
      if (emps.length > 0) {
         const certs = [];
         const grvs = [];
         for(let i=0; i<10; i++) {
            const empId = emps[Math.floor(Math.random() * emps.length)].id;
            certs.push({
               employeeId: empId,
               name: `Safety Training L${Math.floor(1 + Math.random()*5)}-${Date.now()}-${i}`,
               issueDate: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 100)).toISOString(),
               expiryDate: new Date(Date.now() + Math.floor(Math.random() * 86400000 * 365)).toISOString()
            });
            grvs.push({
               employeeId: empId,
               subject: `Workplace query #${Date.now()}-${i}-${Math.floor(Math.random()*10000)}`,
               description: 'Automated compliance tracking log',
               status: ['Pending', 'In Progress', 'Resolved'][Math.floor(Math.random()*3)]
            });
         }
         await db.insert(certifications).values(certs);
         await db.insert(grievances).values(grvs);
      }
    } catch(e) { console.error("10m sim error", e); }
  };
  setInterval(run10mSim, 10 * 60 * 1000);
  setTimeout(run10mSim, 3000); // Run slightly after startup

  // 60 Minutes Interval: Leave Requests
  const run60mSim = async () => {
    try {
      const emps = await db.select().from(employees).limit(10);
      if (emps.length > 0) {
        const leaves = [];
        for(let i=0; i<10; i++) {
           const startOffset = Math.floor(Math.random() * 86400000 * 30);
           const duration = Math.floor(1 + Math.random() * 5) * 86400000;
           leaves.push({
             employeeId: emps[Math.floor(Math.random() * emps.length)].id,
             startDate: new Date(Date.now() + startOffset).toISOString(),
             endDate: new Date(Date.now() + startOffset + duration).toISOString(),
             reason: `Automated leave request ${Date.now()}-${i}-${Math.floor(Math.random()*10000)}`,
             status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random()*3)]
           });
        }
        await db.insert(leaveRequests).values(leaves);
      }
    } catch(e) { console.error("60m sim error", e); }
  };
  setInterval(run60mSim, 60 * 60 * 1000);
  setTimeout(run60mSim, 4000); // Run slightly after startup

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

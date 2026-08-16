const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  app.get("/api/orders/all", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });`;

const replaceStr = `  app.get("/api/orders/all", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      if (allOrders.length === 0) {
         const customers = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikas Gupta', 'Sneha Reddy', 'Anil Verma', 'Sunita Desai', 'Manoj Tiwari', 'Kavita Joshi'];
         const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
         const statuses = ['Pending', 'Packed', 'Dispatched'];
         const mocks = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            meeshoOrderId: \`MEESHO-\${Math.floor(10000000 + Math.random() * 90000000)}\`,
            sku: \`SKU-\${Math.floor(1000 + Math.random() * 9000)}\`,
            quantity: Math.floor(1 + Math.random() * 5),
            customerName: customers[i % customers.length],
            shippingAddress: \`\${Math.floor(1 + Math.random() * 999)} Main St, \${cities[i % cities.length]}, India\`,
            trackingId: \`TRK\${Math.floor(100000000 + Math.random() * 900000000)}\`,
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
  });`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);

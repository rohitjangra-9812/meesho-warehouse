const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const seedOrdersLogic = `
    // Check and seed Orders
    const existingOrders = await db.select().from(orders).limit(1);
    if (existingOrders.length === 0) {
      const customers = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikas Gupta', 'Sneha Reddy', 'Anil Verma', 'Sunita Desai', 'Manoj Tiwari', 'Kavita Joshi'];
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
      const statuses = ['Pending', 'Packed', 'Pending', 'Dispatched', 'Pending'];
      
      const newOrders = Array.from({ length: 50 }, (_, i) => ({
        meeshoOrderId: \`MEESHO-\${Math.floor(10000000 + Math.random() * 90000000)}\`,
        sku: \`SKU-\${Math.floor(1000 + Math.random() * 9000)}\`,
        quantity: Math.floor(1 + Math.random() * 5),
        customerName: customers[i % customers.length],
        shippingAddress: \`\${Math.floor(1 + Math.random() * 999)} Main St, \${cities[i % cities.length]}, India\`,
        trackingId: Math.random() > 0.5 ? \`TRK\${Math.floor(100000000 + Math.random() * 900000000)}\` : null,
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
           { name: 'Apex Supplies', contactPerson: 'Arun Bajaj', email: 'arun@apex.com', phone: '9876543210', category: 'Packaging', status: 'Active' },
           { name: 'Global Tech', contactPerson: 'Sunil Das', email: 'sunil@globaltech.com', phone: '9876543211', category: 'Electronics', status: 'Active' }
         ]).returning();
         vendorId = newVendors[0].id;
         console.log("Seeded vendors");
      } else {
         vendorId = existingVendors[0].id;
      }
      
      const newShipments = Array.from({ length: 10 }, (_, i) => ({
        vendorId: vendorId,
        batchNumber: \`BATCH-\${Math.floor(10000 + Math.random() * 90000)}\`,
        expectedDate: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        status: ['Pending', 'Received', 'Pending'][i % 3],
        totalItems: Math.floor(100 + Math.random() * 900)
      }));
      await db.insert(incomingShipments).values(newShipments);
      console.log("Seeded incoming shipments");
    }
`;

code = code.replace(
  '// Check and seed Scanners',
  seedOrdersLogic + '\n    // Check and seed Scanners'
);

const fallbackOrdersPending = `
      if (pendingOrders.length === 0) {
         const customers = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikas Gupta', 'Sneha Reddy', 'Anil Verma', 'Sunita Desai', 'Manoj Tiwari', 'Kavita Joshi'];
         const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
         const mocks = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            meeshoOrderId: \`MEESHO-\${Math.floor(10000000 + Math.random() * 90000000)}\`,
            sku: \`SKU-\${Math.floor(1000 + Math.random() * 9000)}\`,
            quantity: Math.floor(1 + Math.random() * 5),
            customerName: customers[i % customers.length],
            shippingAddress: \`\${Math.floor(1 + Math.random() * 999)} Main St, \${cities[i % cities.length]}, India\`,
            trackingId: null,
            courierPartner: ['Delhivery', 'Ecom Express', 'XpressBees', 'Bluedart'][i % 4],
            status: 'Pending',
            createdAt: new Date().toISOString()
         }));
         return res.json(mocks);
      }
`;

const findOrdersPending = `    try {
      const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'Pending'));
      res.json(pendingOrders);
    } catch (error) {`;

const replaceOrdersPending = `    try {
      const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'Pending'));
${fallbackOrdersPending}
      res.json(pendingOrders);
    } catch (error) {`;

code = code.replace(findOrdersPending, replaceOrdersPending);

const findOrdersAll = `      if (items.length === 0) {
         return res.json([
            { id: 1, orderId: "ORD-MOCK-1", trackingNumber: "TRK1234", customerName: "Mock Customer", status: "Processing", priority: "High", destination: "Delhi", createdAt: new Date().toISOString() },
            { id: 2, orderId: "ORD-MOCK-2", trackingNumber: "TRK5678", customerName: "Mock Customer 2", status: "Packed", priority: "Normal", destination: "Mumbai", createdAt: new Date().toISOString() }
         ]);
      }`;

const replaceOrdersAll = `      if (items.length === 0) {
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
      }`;

code = code.replace(findOrdersAll, replaceOrdersAll);

fs.writeFileSync(file, code);

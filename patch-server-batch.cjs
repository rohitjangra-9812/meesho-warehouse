const fs = require('fs');

const batchLogic = `
// --- Automated Batch Generation ---
app.post("/api/system/batch-generate", async (req, res) => {
  try {
    const runBatch = async () => {
      console.log("[BATCH] Starting automated batch generation...");
      
      // 1. Generate Vendors
      const newVendors = Array.from({ length: 20 }, (_, i) => ({
        name: \`Auto Vendor \${Math.floor(Math.random()*100000)}\`,
        contact: \`8\${Math.floor(Math.random() * 900000000) + 100000000}\`,
        status: 'Active'
      }));
      let insertedVendors = await db.insert(vendors).values(newVendors).returning({ id: vendors.id });
      
      // 2. Generate Employees
      const positions = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Loading/Unloading', 'Security Guard'];
      const newEmployees = Array.from({ length: 20 }, (_, i) => ({
        name: \`Batch Emp \${Math.floor(Math.random()*10000)}\`,
        mobile: \`9\${Math.floor(Math.random() * 900000000) + 100000000}\`,
        email: \`batch.emp\${Date.now()}\${i}@meeshowms.com\`,
        address: "Auto Generated Address",
        qualification: "12th Pass",
        position: positions[Math.floor(Math.random()*positions.length)],
        status: 'Active',
        dateOfJoining: new Date().toISOString()
      }));
      await db.insert(employees).values(newEmployees);

      // 3. Generate Products
      const newProducts = Array.from({ length: 20 }, (_, i) => ({
        sku: \`BTCH-\${Math.floor(1000000 + Math.random() * 9000000)}\`,
        name: \`Batch Product \${Math.floor(Math.random()*10000)}\`,
        stockQuantity: Math.floor(Math.random() * 500) + 50,
        binLocation: \`A-\${Math.floor(Math.random() * 90) + 10}\`,
        lowStockThreshold: 20
      }));
      let insertedProducts = await db.insert(products).values(newProducts).returning({ sku: products.sku });

      // 4. Generate Orders
      if (insertedProducts.length > 0) {
        const newOrders = Array.from({ length: 20 }, (_, i) => ({
          meeshoOrderId: \`MEESHO-B-\${Math.floor(Math.random()*10000000)}\`,
          sku: insertedProducts[Math.floor(Math.random() * insertedProducts.length)].sku,
          quantity: Math.floor(Math.random() * 5) + 1,
          customerName: \`Customer \${Math.floor(Math.random()*1000)}\`,
          shippingAddress: \`City \${Math.floor(Math.random()*100)}\`,
          status: ['Pending', 'Packed', 'Dispatched'][Math.floor(Math.random()*3)]
        }));
        await db.insert(orders).values(newOrders);
      }

      // 5. Generate Shipments
      if (insertedVendors.length > 0) {
        const newShipments = Array.from({ length: 20 }, (_, i) => ({
          vendorId: insertedVendors[Math.floor(Math.random() * insertedVendors.length)].id,
          batchNumber: \`BATCH-SHP-\${Math.floor(Math.random()*100000)}\`,
          expectedDate: new Date().toISOString(),
          status: ['Pending', 'Received'][Math.floor(Math.random()*2)],
          totalItems: Math.floor(Math.random() * 1000) + 10
        }));
        await db.insert(incomingShipments).values(newShipments);
      }

      console.log("[BATCH] Successfully inserted 20 entries for each core option.");
    };

    await runBatch();
    res.json({ success: true, message: "Batch generation successful. 20 entries added to all modules." });
  } catch (error) {
    console.error("[BATCH] Error:", error);
    res.status(500).json({ error: "Batch generation failed." });
  }
});
// 30-minute automated background generation
setInterval(async () => {
  try {
     console.log("[BATCH] Running scheduled 30-minute batch generator...");
     // Internal call without HTTP request
     const newVendors = Array.from({ length: 20 }, (_, i) => ({ name: \`Auto Vendor \${Math.floor(Math.random()*100000)}\`, contact: \`8\${Math.floor(Math.random() * 900000000) + 100000000}\`, status: 'Active' }));
     let insertedVendors = await db.insert(vendors).values(newVendors).returning({ id: vendors.id });
     const positions = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Loading/Unloading', 'Security Guard'];
     const newEmployees = Array.from({ length: 20 }, (_, i) => ({ name: \`Batch Emp \${Math.floor(Math.random()*10000)}\`, mobile: \`9\${Math.floor(Math.random() * 900000000) + 100000000}\`, email: \`batch.emp\${Date.now()}\${i}@meeshowms.com\`, address: "Auto Generated", qualification: "12th Pass", position: positions[Math.floor(Math.random()*positions.length)], status: 'Active' }));
     await db.insert(employees).values(newEmployees);
     const newProducts = Array.from({ length: 20 }, (_, i) => ({ sku: \`BTCH-\${Math.floor(1000000 + Math.random() * 9000000)}\`, name: \`Batch Product \${Math.floor(Math.random()*10000)}\`, stockQuantity: Math.floor(Math.random() * 500) + 50, binLocation: \`A-\${Math.floor(Math.random() * 90) + 10}\`, lowStockThreshold: 20 }));
     let insertedProducts = await db.insert(products).values(newProducts).returning({ sku: products.sku });
     if (insertedProducts.length > 0) {
       const newOrders = Array.from({ length: 20 }, (_, i) => ({ meeshoOrderId: \`MEESHO-B-\${Math.floor(Math.random()*10000000)}\`, sku: insertedProducts[Math.floor(Math.random() * insertedProducts.length)].sku, quantity: 1, customerName: \`Customer \${Math.floor(Math.random()*1000)}\`, shippingAddress: \`City \${Math.floor(Math.random()*100)}\`, status: 'Pending' }));
       await db.insert(orders).values(newOrders);
     }
     if (insertedVendors.length > 0) {
       const newShipments = Array.from({ length: 20 }, (_, i) => ({ vendorId: insertedVendors[Math.floor(Math.random() * insertedVendors.length)].id, batchNumber: \`BATCH-SHP-\${Math.floor(Math.random()*100000)}\`, expectedDate: new Date().toISOString(), status: 'Pending', totalItems: 100 }));
       await db.insert(incomingShipments).values(newShipments);
     }
     console.log("[BATCH] Scheduled batch completed successfully.");
  } catch (err) {
     console.error("[BATCH] Scheduled run failed:", err);
  }
}, 30 * 60 * 1000); // 30 mins
`;

let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace('  // Catch-all for unhandled API routes', batchLogic + '\n  // Catch-all for unhandled API routes');
fs.writeFileSync('server.ts', code);

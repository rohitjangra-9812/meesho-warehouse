const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  // --- New Warehouse Modules ---
  app.get("/api/cross-docking", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(crossDocking).orderBy(desc(crossDocking.createdAt));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch cross docking" });
    }
  });
  app.post("/api/cross-docking", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(crossDocking).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Failed to add cross docking" });
    }
  });
  app.get("/api/inspections", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(inspections).orderBy(desc(inspections.createdAt));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch inspections" });
    }
  });
  app.post("/api/inspections", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(inspections).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Failed to add inspection" });
    }
  });
  app.get("/api/special-zones", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(specialZones).orderBy(desc(specialZones.createdAt));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch special zones" });
    }
  });
  app.post("/api/special-zones", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(specialZones).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Failed to add special zone" });
    }
  });
  app.get("/api/packaging", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(packagingLedger).orderBy(desc(packagingLedger.lastRestockDate));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch packaging" });
    }
  });
  app.post("/api/packaging", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(packagingLedger).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Failed to add packaging" });
    }
  });
`;

code = code.replace(
  "  // Catch-all for unhandled API routes",
  newRoutes + "\n  // Catch-all for unhandled API routes"
);

// We need to inject the batch logic update too. Let's find the batch logic strings.
const batchInjection = `
      // 6. Generate New WMS Module Data
      const newCrossDocking = Array.from({ length: 20 }, (_, i) => ({
        inboundShipmentId: \`INB-XD-\${Math.floor(Math.random()*10000)}\`,
        outboundDockId: \`Dock-\${Math.floor(Math.random()*16)+1}\`,
        status: ['Pending', 'Transferred'][Math.floor(Math.random()*2)],
        priority: ['Normal', 'High', 'Urgent'][Math.floor(Math.random()*3)]
      }));
      await db.insert(crossDocking).values(newCrossDocking);

      const newInspections = Array.from({ length: 20 }, (_, i) => ({
        shipmentId: \`SHP-QC-\${Math.floor(Math.random()*10000)}\`,
        passFail: ['Pass', 'Fail', 'Hold'][Math.floor(Math.random()*3)],
        defectCategory: ['None', 'Damaged Packaging', 'Missing Items', 'Wrong SKU'][Math.floor(Math.random()*4)],
        quarantineHold: Math.random() > 0.8,
        inspector: \`Inspector \${Math.floor(Math.random()*50)+1}\`
      }));
      await db.insert(inspections).values(newInspections);

      const newSpecialZones = Array.from({ length: 20 }, (_, i) => ({
        itemName: \`HazMat/Special \${Math.floor(Math.random()*1000)}\`,
        hazardClass: ['Flammable', 'Corrosive', 'High Value', 'Temperature Controlled'][Math.floor(Math.random()*4)],
        tempRequired: \`\${Math.floor(Math.random()*10)}°C\`,
        currentTemp: \`\${Math.floor(Math.random()*10)}°C\`,
        location: \`Zone-\${['A','B','C'][Math.floor(Math.random()*3)]}-\${Math.floor(Math.random()*10)}\`,
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
`;

code = code.replace(
  'console.log("[BATCH] Successfully inserted 20 entries for each core option.");',
  batchInjection + '\n      console.log("[BATCH] Successfully inserted 20 entries for each core option.");'
);

code = code.replace(
  'console.log("[BATCH] Scheduled batch completed successfully.");',
  batchInjection.replace(/await /g, 'await ') + '\n     console.log("[BATCH] Scheduled batch completed successfully.");'
);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const dockApi = `
  // --- DOCK MANAGEMENT ---
  const vehicleTypes = ["32ft Container", "Tata 407", "Eicher Pro", "Trailer", "14ft Canter"];
  const origins = ["Bhiwandi Hub", "Bilaspur DC", "Surat Warehouse", "Pune Hub", "Bengaluru FC", "Hyderabad Hub"];
  const materials = ["Apparel & Fashion", "Electronics", "FMCG / Groceries", "Home Decor", "Automotive Parts"];
  const driverNames = ["Ramu", "Shyam", "Kisan", "Daljit", "Gurpreet", "Manish", "Rajendra", "Sikandar", "Babu", "Altaf"];
  
  let seenVehiclesToday = new Set();
  let lastDay = new Date().getDate();

  const generateUniqueVehicleNo = () => {
    const today = new Date().getDate();
    if (today !== lastDay) {
      seenVehiclesToday.clear();
      lastDay = today;
    }
    let vNo = "";
    do {
      const states = ["HR", "UP", "MH", "GJ", "DL", "RJ"];
      const state = states[Math.floor(Math.random()*states.length)];
      const rto = Math.floor(10 + Math.random()*89);
      const letters = String.fromCharCode(65+Math.floor(Math.random()*26)) + String.fromCharCode(65+Math.floor(Math.random()*26));
      const num = Math.floor(1000 + Math.random()*9000);
      vNo = \`\${state}\${rto} \${letters} \${num}\`;
    } while (seenVehiclesToday.has(vNo));
    seenVehiclesToday.add(vNo);
    return vNo;
  };

  const generateTrip = () => {
    const distance = Math.floor(50 + Math.random() * 1500);
    const efficiency = (3 + Math.random() * 4).toFixed(1);
    const fuel = Math.floor(distance / parseFloat(efficiency));
    // Simulate they arrived some random time in the last 2 hours to show TAT
    const randomElapsed = Math.floor(Math.random() * 7200000); 
    return {
      vehicleNo: generateUniqueVehicleNo(),
      vehicleType: vehicleTypes[Math.floor(Math.random()*vehicleTypes.length)],
      driverName: driverNames[Math.floor(Math.random()*driverNames.length)] + " Singh",
      driverMobile: \`9\${Math.floor(100000000 + Math.random() * 900000000)}\`,
      origin: origins[Math.floor(Math.random()*origins.length)],
      material: materials[Math.floor(Math.random()*materials.length)],
      quantity: Math.floor(50 + Math.random() * 2000),
      distance: distance,
      fuel: fuel,
      efficiency: efficiency,
      assignedAt: Date.now() - randomElapsed,
      eta: new Date(Date.now() - randomElapsed).toISOString()
    };
  };

  // Initialize 20 docks
  let docks = Array.from({length: 20}, (_, i) => {
    // Dock 5 Maintenance, Dock 12 Reserved for example
    if (i === 4) return { id: i + 1, status: 'Maintenance', vehicle: null };
    if (i === 11) return { id: i + 1, status: 'Reserved', vehicle: null };
    
    const isOccupied = Math.random() > 0.5;
    const statusList = ['Occupied / Loading', 'Inbound Unloading'];
    return {
      id: i + 1,
      status: isOccupied ? statusList[Math.floor(Math.random()*statusList.length)] : 'Available',
      vehicle: isOccupied ? generateTrip() : null
    };
  });

  let totalInboundToday = docks.filter(d => d.vehicle).reduce((acc, d) => acc + d.vehicle.quantity, 0);
  let totalFuelToday = docks.filter(d => d.vehicle).reduce((acc, d) => acc + d.vehicle.fuel, 0);

  // Requirement: "MAKE THE COME THE NEW ENTRIES OF THE VECHILE IN THE 20 MINTUES ... DO NOT MAKE THE SAME ... ENTRIES IN THE SAME DAY"
  setInterval(() => {
    const availableDocks = docks.filter(d => d.status === 'Available');
    if (availableDocks.length > 0) {
      const randomDock = availableDocks[Math.floor(Math.random() * availableDocks.length)];
      randomDock.status = 'Inbound Unloading';
      // New vehicle uniquely generated
      randomDock.vehicle = { ...generateTrip(), assignedAt: Date.now(), eta: new Date().toISOString() };
      totalInboundToday += randomDock.vehicle.quantity;
      totalFuelToday += randomDock.vehicle.fuel;
    }
  }, 20 * 60 * 1000); // 20 minutes exact

  app.get("/api/docks", requireAuth, (req, res) => {
    const activeOccupancy = docks.filter(d => d.status === 'Occupied / Loading' || d.status === 'Inbound Unloading').length;
    res.json({
      docks,
      stats: {
        occupancyRate: \`\${activeOccupancy}/20 Docks Busy\`,
        totalInboundToday,
        totalFuelToday
      }
    });
  });

  app.post("/api/docks/:id/assign", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const dock = docks.find(d => d.id === id);
    if (dock) {
      dock.status = req.body.status || 'Inbound Unloading';
      const vNo = req.body.vehicle.vehicleNo;
      if (!seenVehiclesToday.has(vNo)) {
         seenVehiclesToday.add(vNo);
      }
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

  app.post("/api/docks/:id/release", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const dock = docks.find(d => d.id === id);
    if (dock) {
      dock.status = 'Available';
      dock.vehicle = null;
      res.json(dock);
    } else {
      res.status(404).json({error: 'Dock not found'});
    }
  });

  app.post("/api/docks/simulate-arrival", requireAuth, (req, res) => {
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
`;

const targetStr = `  // --- NEW STREAMLINED APIS ---`;
code = code.replace(targetStr, targetStr + "\n" + dockApi);
fs.writeFileSync('server.ts', code);

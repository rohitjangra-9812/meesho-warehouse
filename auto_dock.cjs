const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
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
      if (now - dock.vehicle.assignedAt > 30000) { // 30 seconds
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
`;

code = code.replace('let vehicleTripHistory = new Map<string, any[]>();', injection + '\nlet vehicleTripHistory = new Map<string, any[]>();');

fs.writeFileSync('server.ts', code);
console.log("Added auto dock logic");

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const historySetup = `
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
`;

// Replace the old release endpoint and inject the history endpoint before it.
const releaseStart = code.indexOf('app.post("/api/v3/docks/:id/release"');
const releaseEnd = code.indexOf('});', releaseStart) + 3;

if (releaseStart !== -1) {
  code = code.slice(0, releaseStart) + historySetup + code.slice(releaseEnd);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with vehicle history");
} else {
  console.log("Release endpoint not found!");
}

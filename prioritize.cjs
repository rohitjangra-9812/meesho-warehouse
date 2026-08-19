const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
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
`;

code = code.replace('app.post("/api/v3/docks/toggle-auto", requireAuth, (req, res) => {', injection + '\n  app.post("/api/v3/docks/toggle-auto", requireAuth, (req, res) => {');

fs.writeFileSync('server.ts', code);

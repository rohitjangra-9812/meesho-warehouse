const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update GET /api/v3/docks to include queue and auto status
const getApiRegex = /app\.get\("\/api\/v3\/docks", requireAuth, \(req, res\) => \{\s*const activeOccupancy = docks\.filter\(d => d\.status === 'Occupied \/ Loading' \|\| d\.status === 'Inbound Unloading'\)\.length;\s*res\.json\(\{\s*docks,\s*stats: \{\s*occupancyRate: \`\$\{activeOccupancy\}\/20 Docks Busy\`,\s*totalInboundToday,\s*totalFuelToday\s*\}\s*\}\);\s*\}\);/g;
code = code.replace(getApiRegex, `app.get("/api/v3/docks", requireAuth, (req, res) => {
    const activeOccupancy = docks.filter(d => d.status === 'Occupied / Loading' || d.status === 'Inbound Unloading').length;
    res.json({
      docks,
      queue: dockWaitingQueue,
      autoDockEnabled,
      stats: {
        occupancyRate: \`\${activeOccupancy}/20 Docks Busy\`,
        totalInboundToday,
        totalFuelToday
      }
    });
  });`);

// Update timer from 30000 to 1800000 (30 mins)
const autoDockRegex = /if \(now - dock\.vehicle\.assignedAt > 30000\) \{ \/\/ 30 seconds/g;
code = code.replace(autoDockRegex, `if (now - dock.vehicle.assignedAt > 30 * 60 * 1000) { // 30 minutes`);

// Add toggle endpoint
code = code.replace(`// Automation Logic for Docks`, `app.post("/api/v3/docks/toggle-auto", requireAuth, (req, res) => {
    autoDockEnabled = !autoDockEnabled;
    res.json({ autoDockEnabled });
});
// Automation Logic for Docks`);

fs.writeFileSync('server.ts', code);

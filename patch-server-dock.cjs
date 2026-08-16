const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const doorStatusRoute = `
  app.put("/api/docks/doors/:id/status", requireAuth, async (req, res) => {
    try {
      const doorId = Number(req.params.id);
      const { status } = req.body;
      await db.update(dockDoors).set({ status }).where(eq(dockDoors.id, doorId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update door status" });
    }
  });
`;

code = code.replace(
  '  app.get("/api/docks/paths/optimal",',
  doorStatusRoute + '\n  app.get("/api/docks/paths/optimal",'
);
fs.writeFileSync('server.ts', code);

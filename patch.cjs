const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "  // Vite middleware for development",
  "  // Catch-all for unhandled API routes\n  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));\n\n  // Vite middleware for development"
);
fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "          qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',\n          category: 'General'\n        });",
  "          qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',\n          category: 'General',\n          price: Math.floor(100 + Math.random() * 9900)\n        });"
);

// Also remove the "if (check.length > 0) return res.json({ message: "Already seeded" });"
// so they can actively re-seed and overwrite if they want, or maybe just leave it since the db has the 100 entries.
// Let's actually change the logic so "Refresh Data" explicitly just re-fetches or truncates and seeds so the button does something.
// Wait, the UI just calls fetchInventory() after seed.
// The button in UI says "Refresh Data", which calls `/inventory/seed`. Let's make it actually truncate and re-seed 100 items if they click it!

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will just find the string between "// Deleted GET /api/employees" and "});" corresponding to "Failed to seed employees"
const startIndex = code.indexOf('// Deleted GET /api/employees');
const targetStr = 'res.status(500).json({ error: "Failed to seed employees" });\n    }\n  });';
const endIndex = code.indexOf(targetStr) + targetStr.length;

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  const newCode = code.slice(0, startIndex) + code.slice(endIndex);
  fs.writeFileSync('server.ts', newCode);
  console.log("Wiped bad chunk!");
} else {
  console.log("Failed to find chunk to wipe");
}

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const simStart = code.indexOf('// 30-minute automated background generation');
const simEnd = code.indexOf('app.get("/api/v3/docks"');

if (simStart !== -1 && simEnd !== -1 && simEnd > simStart) {
  const newCode = code.slice(0, simStart) + code.slice(simEnd);
  fs.writeFileSync('server.ts', newCode);
  console.log("Wiped huge simulation block!");
} else {
  console.log("Could not wipe huge sim block");
}

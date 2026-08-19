const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const simStart = code.indexOf('// 2 Minutes Interval: Hub Transfers');
const simEnd = code.indexOf('app.listen(PORT, "0.0.0.0", () => {');

if (simStart !== -1 && simEnd !== -1 && simEnd > simStart) {
  const newCode = code.slice(0, simStart) + code.slice(simEnd);
  fs.writeFileSync('server.ts', newCode);
  console.log("Wiped simulation code!");
} else {
  console.log("Could not wipe sim code");
}

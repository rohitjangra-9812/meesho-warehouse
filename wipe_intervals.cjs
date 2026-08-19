const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Wipe the two setInterval blocks manually based on the line indices from the grep output
// Block 1: 1613-1810 approx
const wipe1Start = code.indexOf('// 30-minute automated background generation');
const wipe1End = code.indexOf('let docks = Array.from({ length: 20 }');
if (wipe1Start !== -1 && wipe1End !== -1) {
  code = code.slice(0, wipe1Start) + code.slice(wipe1End);
}

// Block 2: 1821-1833
const wipe2Start = code.indexOf('// Requirement: "MAKE THE COME THE NEW ENTRIES');
const wipe2End = code.indexOf('app.get("/api/v3/docks"');
if (wipe2Start !== -1 && wipe2End !== -1) {
  code = code.slice(0, wipe2Start) + code.slice(wipe2End);
}

fs.writeFileSync('server.ts', code);
console.log("Wiped intervals");

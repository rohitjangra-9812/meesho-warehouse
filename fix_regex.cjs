const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/    \}\n  \}\);\n    \}\n  \}\);\n  app\.post\("\/api\/v3\/docks\/simulate-arrival"/, '    }\n  });\n  app.post("/api/v3/docks/simulate-arrival"');

fs.writeFileSync('server.ts', code);
console.log("Replaced with regex");

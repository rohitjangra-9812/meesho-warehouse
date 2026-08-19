const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/    \}\n  \}\);\n\n    \}\n  \}\);\n\n  app\.post/, '    }\n  });\n\n  app.post');

fs.writeFileSync('server.ts', code);
console.log("Regex replaced");

const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(/import\s+{([^}]*)}\s+from\s+'drizzle-orm\/pg-core';/, (match, p1) => {
   if (!p1.includes('boolean')) {
      return "import { " + p1 + ", boolean } from 'drizzle-orm/pg-core';";
   }
   return match;
});
fs.writeFileSync('src/db/schema.ts', code);

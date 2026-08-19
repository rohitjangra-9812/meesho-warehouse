const fs = require('fs');
let code = fs.readFileSync('src/db/index.ts', 'utf8');
code = code.replace("import { drizzle } from 'drizzle-orm/node-postgres';", "import { drizzle } from 'drizzle-orm/node-postgres';\nimport pg from 'pg';");
code = code.replace("const pool = new Pool({", "const { Pool } = pg;\nconst pool = new Pool({");
fs.writeFileSync('src/db/index.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "  category: text('category'),\n});",
  "  category: text('category'),\n  price: integer('price'),\n});"
);

fs.writeFileSync('src/db/schema.ts', code);

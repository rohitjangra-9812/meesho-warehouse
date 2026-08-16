const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "  lowStockThreshold: integer('low_stock_threshold').notNull().default(20),",
  "  lowStockThreshold: integer('low_stock_threshold').notNull().default(20),\n  sourceVehicle: text('source_vehicle'),\n  qualityRate: text('quality_rate'),\n  category: text('category'),"
);

fs.writeFileSync('src/db/schema.ts', code);

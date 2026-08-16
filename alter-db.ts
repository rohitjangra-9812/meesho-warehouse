import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';
async function run() {
  await db.execute(sql`ALTER TABLE products ADD COLUMN source_vehicle text;`);
  await db.execute(sql`ALTER TABLE products ADD COLUMN quality_rate text;`);
  await db.execute(sql`ALTER TABLE products ADD COLUMN category text;`);
  console.log("Altered products table");
  process.exit(0);
}
run();

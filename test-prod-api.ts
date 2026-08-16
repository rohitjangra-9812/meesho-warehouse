import { db } from './src/db/index.ts';
import { products } from './src/db/schema.ts';

async function run() {
  const p = await db.select().from(products).limit(1);
  console.log("Product from DB:", p);
  process.exit(0);
}
run();

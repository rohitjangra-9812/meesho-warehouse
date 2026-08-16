import { db } from './src/db/index.ts';
import { products } from './src/db/schema.ts';
import { isNull } from 'drizzle-orm';

async function run() {
  const nullProducts = await db.select().from(products).where(isNull(products.price)).limit(5);
  console.log("Products with null price:", nullProducts.length);
  process.exit(0);
}
run();

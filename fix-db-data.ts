import { db } from './src/db/index.ts';
import { products } from './src/db/schema.ts';
import { sql } from 'drizzle-orm';

async function run() {
  const allProducts = await db.select().from(products).limit(5);
  console.log("Current products:");
  console.log(allProducts);

  // Update existing products that have null fields
  await db.execute(sql`
    UPDATE products 
    SET 
      price = floor(random() * 9900 + 100),
      source_vehicle = 'MH-' || floor(random() * 90 + 10) || '-AB-' || floor(random() * 9000 + 1000),
      quality_rate = CASE 
        WHEN random() > 0.8 THEN 'Excellent' 
        WHEN random() > 0.4 THEN 'Good' 
        ELSE 'Needs Inspection' 
      END,
      category = 'General'
    WHERE price IS NULL OR source_vehicle IS NULL
  `);
  console.log("Updated existing products with new fields.");
  process.exit(0);
}
run();

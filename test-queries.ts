import { db } from './src/db/index.ts';
import { vehicleLogs, scanners } from './src/db/schema.ts';
import { eq, sql } from 'drizzle-orm';

async function run() {
  try {
    const vLogs = await db.select().from(vehicleLogs).where(sql`${vehicleLogs.checkInTime} IS NOT NULL AND ${vehicleLogs.checkOutTime} IS NOT NULL`);
    console.log("vLogs:", vLogs.length);
    const maintScanners = await db.select().from(scanners).where(eq(scanners.status, 'Maintenance'));
    console.log("scanners:", maintScanners.length);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();

const fs = require('fs');

// 1. Update schema.ts
let schemaCode = fs.readFileSync('src/db/schema.ts', 'utf8');
const empSchemaOld = `export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  qualification: text('qualification').notNull(),
  position: text('position').notNull(),
  status: text('status').notNull().default('Active'),
  dateOfJoining: text('date_of_joining').default('2026-01-01'),
  createdAt: timestamp('created_at').defaultNow(),
});`;

const empSchemaNew = `export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  empId: text('emp_id').notNull(),
  name: text('name').notNull(),
  fathersName: text('fathers_name'),
  mobile: text('mobile').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  homeState: text('home_state'),
  age: integer('age'),
  qualification: text('qualification').notNull(),
  department: text('department').notNull(),
  position: text('position').notNull(),
  experience: text('experience'),
  salary: integer('salary'),
  emergencyContact: text('emergency_contact'),
  status: text('status').notNull().default('Active'),
  dateOfJoining: text('date_of_joining').default('2026-01-01'),
  createdAt: timestamp('created_at').defaultNow(),
});`;

if (schemaCode.includes("pgTable('employees'")) {
  // It might be slightly different. Let's use regex
  schemaCode = schemaCode.replace(/export const employees = pgTable\('employees', \{[\s\S]*?\}\);/, empSchemaNew);
  // Ensure integer is imported
  if (!schemaCode.includes('integer')) {
    schemaCode = schemaCode.replace("pgTable, serial, text, timestamp", "pgTable, serial, text, timestamp, integer");
  }
  fs.writeFileSync('src/db/schema.ts', schemaCode);
  console.log("Schema updated");
}


import { relations } from 'drizzle-orm';
import {  integer, pgTable, serial, text, timestamp , boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name'),
  email: text('email').notNull(),
  role: text('role').notNull().default('Packer'), // Admin, Manager, Packer
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  binLocation: text('bin_location').notNull(),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(20),
  sourceVehicle: text('source_vehicle'),
  qualityRate: text('quality_rate'),
  category: text('category'),
  price: integer('price'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  meeshoOrderId: text('meesho_order_id').notNull().unique(),
  sku: text('sku').notNull(),
  quantity: integer('quantity').notNull().default(1),
  customerName: text('customer_name').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  trackingId: text('tracking_id'),
  courierPartner: text('courier_partner'),
  status: text('status').notNull().default('Pending'), // Pending, Packed, Dispatched, Returned
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const employees = pgTable('employees', {
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
});

export const notices = pgTable('notices', {
  id: serial('id').primaryKey(),
  serialNumber: text('serial_number'),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const management = pgTable('management', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  mobile: text('mobile').notNull(),
  email: text('email').notNull(),
  officeLocation: text('office_location').notNull(),
  responsibilities: text('responsibilities').notNull(),
  dateOfJoining: text('date_of_joining').default('2026-01-01'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const attendanceLogs = pgTable('attendance_logs', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id).notNull(),
  date: text('date').notNull(),
  punchIn: text('punch_in'),
  punchOut: text('punch_out'),
  status: text('status').notNull().default('Present'),
  overtimeHours: integer('overtime_hours').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leaveRequests = pgTable('leave_requests', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('Pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact: text('contact').notNull(),
  status: text('status').notNull().default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incomingShipments = pgTable('incoming_shipments', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  batchNumber: text('batch_number').notNull(),
  expectedDate: text('expected_date').notNull(),
  status: text('status').notNull().default('Pending'), // Pending, Received, QC_Failed
  totalItems: integer('total_items').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const qualityChecks = pgTable('quality_checks', {
  id: serial('id').primaryKey(),
  shipmentId: integer('shipment_id').references(() => incomingShipments.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  sellableItems: integer('sellable_items').notNull().default(0),
  damagedItems: integer('damaged_items').notNull().default(0),
  qcDate: text('qc_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status').notNull().default('Requested'), // Requested, Approved, Fulfilled
  createdAt: timestamp('created_at').defaultNow(),
});

export const certifications = pgTable('certifications', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id).notNull(),
  name: text('name').notNull(),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  status: text('status').notNull().default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const grievances = pgTable('grievances', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id).notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Pending'), // Pending, Under Review, In Progress, Resolved
  createdAt: timestamp('created_at').defaultNow(),
});

export const hubs = pgTable('hubs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull().default('Satellite'), // Main Facility, Satellite
  createdAt: timestamp('created_at').defaultNow(),
});

export const hubTransfers = pgTable('hub_transfers', {
  id: serial('id').primaryKey(),
  fromHubId: integer('from_hub_id').references(() => hubs.id).notNull(),
  toHubId: integer('to_hub_id').references(() => hubs.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status').notNull().default('Pending'), // Pending, In Transit, Completed
  waybill: text('waybill').notNull(),
  dispatchDate: text('dispatch_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const treasuryAccounts = pgTable('treasury_accounts', {
  id: serial('id').primaryKey(),
  accountName: text('account_name').notNull(),
  bankName: text('bank_name').notNull(),
  branch: text('branch').notNull(),
  balance: integer('balance').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const treasuryTransactions = pgTable('treasury_transactions', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').references(() => treasuryAccounts.id).notNull(),
  type: text('type').notNull(), // Debit, Credit
  amount: integer('amount').notNull(),
  category: text('category').notNull(), // Material Purchase, Operational Expense, etc.
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const dockDoors = pgTable('dock_doors', {
  id: serial('id').primaryKey(),
  doorNumber: text('door_number').notNull(),
  status: text('status').notNull().default('Available'), // Available, Occupied, Maintenance
  currentVehicleId: integer('current_vehicle_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vehicleLogs = pgTable('vehicle_logs', {
  id: serial('id').primaryKey(),
  vehicleNumber: text('vehicle_number').notNull(),
  carrierName: text('carrier_name').notNull(),
  type: text('type').notNull(), // Inbound, Outbound
  scheduledTime: timestamp('scheduled_time'),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  status: text('status').notNull().default('Expected'), // Expected, Arrived, Docked, Departed, Delayed
  dockDoorId: integer('dock_door_id').references(() => dockDoors.id),
  driverName: text('driver_name').notNull(),
  driverContact: text('driver_contact').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const scanners = pgTable('scanners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Barcode, RFID
  macAddress: text('mac_address').notNull(),
  status: text('status').notNull().default('Online'), // Online, Offline, Maintenance
  batteryLevel: integer('battery_level').notNull().default(100),
  location: text('location').notNull(),
  lastPing: timestamp('last_ping').defaultNow(),
});

export const scanLogs = pgTable('scan_logs', {
  id: serial('id').primaryKey(),
  scannerId: integer('scanner_id').references(() => scanners.id).notNull(),
  itemSku: text('item_sku').notNull(),
  scanType: text('scan_type').notNull(), // Pick, Pack, Receive, Count
  status: text('status').notNull().default('Success'), // Success, Error
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const scannerMaintenanceLogs = pgTable('scanner_maintenance_logs', {
  id: serial('id').primaryKey(),
  scannerId: integer('scanner_id').references(() => scanners.id).notNull(),
  maintenanceType: text('maintenance_type').notNull(), // Repair, Firmware Update, Routine Check
  description: text('description').notNull(),
  date: timestamp('date').defaultNow(),
  technician: text('technician').notNull(),
});

export const crossDocking = pgTable('cross_docking', {
  id: serial('id').primaryKey(),
  inboundShipmentId: text('inbound_shipment_id').notNull(),
  outboundDockId: text('outbound_dock_id').notNull(),
  status: text('status').notNull().default('Pending'), // Pending, Transferred, Cancelled
  priority: text('priority').notNull().default('Normal'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  shipmentId: text('shipment_id').notNull(),
  passFail: text('pass_fail').notNull(), // Pass, Fail, Hold
  defectCategory: text('defect_category'),
  quarantineHold: boolean('quarantine_hold').default(false),
  inspector: text('inspector').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const specialZones = pgTable('special_zones', {
  id: serial('id').primaryKey(),
  itemName: text('item_name').notNull(),
  hazardClass: text('hazard_class').notNull(),
  tempRequired: text('temp_required'),
  currentTemp: text('current_temp'),
  location: text('location').notNull(),
  complianceStatus: text('compliance_status').notNull().default('Compliant'), // Compliant, Review, Violation
  createdAt: timestamp('created_at').defaultNow(),
});

export const packagingLedger = pgTable('packaging_ledger', {
  id: serial('id').primaryKey(),
  materialType: text('material_type').notNull(),
  currentStock: integer('current_stock').notNull(),
  reorderThreshold: integer('reorder_threshold').notNull(),
  autoReorderTriggered: boolean('auto_reorder_triggered').default(false),
  lastRestockDate: timestamp('last_restock_date').defaultNow(),
});

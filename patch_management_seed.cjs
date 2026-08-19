const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLeaders = `const leaders = [
        { name: "Insp Rohit Jangra", role: "Warehouse Owner / Managing Director", mobile: "+91 9812603346", email: "rohitjangra.gov.in", officeLocation: "Bhiwani, Haryana", responsibilities: "Oversees overall business strategy, vendor relations with Meesho, and financial operations.", dateOfJoining: "2026-01-01T00:00:00Z" },
        { name: "Harsh Sharma", role: "Managing Director / Operations Lead", mobile: "+91 8882271630", email: "harsh.sharma@meeshowms.com", officeLocation: "NIT Faridabad, Haryana", responsibilities: "Manages day-to-day fulfillment workflows, inventory tracking, and warehouse efficiency.", dateOfJoining: "2026-01-15T00:00:00Z" },
        { name: "Amit Singh", role: "Logistics & Dispatch Manager", mobile: "9876543212", email: "amit.logistics@meeshowms.com", officeLocation: "Panipat Hub", responsibilities: "Coordinates shipping pipelines, courier handovers, and return logistics.", dateOfJoining: "2026-02-10T00:00:00Z" },
        { name: "Pooja Verma", role: "HR & Administration Manager", mobile: "9876543213", email: "pooja.hr@meeshowms.com", officeLocation: "HQ - Gurugram, Haryana", responsibilities: "Handles workforce staffing, employee directories, attendance, and compliance across all departments.", dateOfJoining: "2026-02-28T00:00:00Z" }
      ];`;

const newLeaders = `const leaders = [
        { name: "Insp Rohit Jangra", role: "Warehouse Owner / Director", mobile: "+91 9812603346", email: "rohit.director@meeshowms.com", officeLocation: "Bhiwani HQ, Haryana", responsibilities: "Overall operations, licensing, site ownership, and executive strategy.", dateOfJoining: "2025-10-01T00:00:00Z" },
        { name: "Rohit Angra", role: "HR Manager", mobile: "+91 9876500001", email: "hr.manager@meeshowms.com", officeLocation: "Admin Block A", responsibilities: "Personnel management, recruitment, compliance, and official HR signatory.", dateOfJoining: "2026-01-10T00:00:00Z" },
        { name: "Sneha Kapoor", role: "Finance & Accounts Manager", mobile: "+91 9876500002", email: "finance@meeshowms.com", officeLocation: "Treasury Office", responsibilities: "Payroll budget, billing, vendor invoices, and treasury operations.", dateOfJoining: "2026-01-15T00:00:00Z" },
        { name: "Harsh Sharma", role: "Shift & Floor Operations Manager", mobile: "+91 8882271630", email: "floor.ops@meeshowms.com", officeLocation: "NIT Faridabad, Haryana", responsibilities: "Inbound/outbound waves, floor safety, picker/packer assignments.", dateOfJoining: "2026-01-15T00:00:00Z" },
        { name: "Amit Singh", role: "Transport & Fleet Logistics Manager", mobile: "+91 9876543212", email: "amit.logistics@meeshowms.com", officeLocation: "Panipat Hub", responsibilities: "Dock operations, dispatch routing, carrier contracts, and vehicle tracking.", dateOfJoining: "2026-02-10T00:00:00Z" },
        { name: "Vikas Verma", role: "Inventory & Quality Control Manager", mobile: "+91 9876500005", email: "qc@meeshowms.com", officeLocation: "Audit Station B", responsibilities: "Stock audits, loss prevention, returns processing, and item inspections.", dateOfJoining: "2026-02-28T00:00:00Z" }
      ];`;

if (code.includes(oldLeaders)) {
  code = code.replace(oldLeaders, newLeaders);
  fs.writeFileSync('server.ts', code);
  console.log("Patched management seed list.");
} else {
  // try to find it dynamically if spacing is different
  const startIdx = code.indexOf('const leaders = [');
  const endIdx = code.indexOf('];', startIdx) + 2;
  if (startIdx !== -1 && endIdx !== -1) {
     code = code.substring(0, startIdx) + newLeaders + code.substring(endIdx);
     fs.writeFileSync('server.ts', code);
     console.log("Patched management seed list dynamically.");
  } else {
     console.log("Could not find management seed list.");
  }
}

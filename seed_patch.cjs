const fs = require('fs');

const seedLogic = `
    // Check and seed Management
    const existingMgmt = await db.select().from(management).limit(1);
    if (existingMgmt.length === 0) {
      const leaders = [
        { name: "Insp Rohit Jangra", role: "Warehouse Owner / Managing Director", mobile: "+91 9812603346", email: "rohitjangra.gov.in", officeLocation: "Bhiwani, Haryana", responsibilities: "Oversees overall business strategy, vendor relations with Meesho, and financial operations.", dateOfJoining: "2026-01-01T00:00:00Z" },
        { name: "Harsh Sharma", role: "Managing Director / Operations Lead", mobile: "+91 8882271630", email: "harsh.sharma@meeshowms.com", officeLocation: "NIT Faridabad, Haryana", responsibilities: "Manages day-to-day fulfillment workflows, inventory tracking, and warehouse efficiency.", dateOfJoining: "2026-01-15T00:00:00Z" },
        { name: "Amit Singh", role: "Logistics & Dispatch Manager", mobile: "9876543212", email: "amit.logistics@meeshowms.com", officeLocation: "Panipat Hub", responsibilities: "Coordinates shipping pipelines, courier handovers, and return logistics.", dateOfJoining: "2026-02-10T00:00:00Z" },
        { name: "Pooja Verma", role: "HR & Administration Manager", mobile: "9876543213", email: "pooja.hr@meeshowms.com", officeLocation: "HQ - Gurugram, Haryana", responsibilities: "Handles workforce staffing, employee directories, attendance, and compliance across all departments.", dateOfJoining: "2026-02-28T00:00:00Z" }
      ];
      await db.insert(management).values(leaders);
      console.log("Seeded management");
    }

    // Check and seed Employees (reduced count for auto-seed to be safe)
    const existingEmps = await db.select().from(employees).limit(1);
    if (existingEmps.length === 0) {
      const positions = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Loading/Unloading', 'Security Guard', 'Shift Supervisor', 'Maintenance', 'Office Department', 'Caretaker'];
      const emps = Array.from({ length: 50 }, (_, i) => ({
        name: \`Employee \${i + 1}\`,
        mobile: \`9\${Math.floor(Math.random() * 900000000) + 100000000}\`,
        email: \`emp\${i + 1}@meeshowms.com\`,
        address: "Haryana",
        qualification: "10th Pass",
        position: positions[i % positions.length],
        status: i % 10 === 0 ? 'Inactive' : 'Active',
        dateOfJoining: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      }));
      await db.insert(employees).values(emps);
      console.log("Seeded employees");
    }

    // Check and seed Inventory (reduced count)
    const existingInv = await db.select().from(products).limit(1);
    if (existingInv.length === 0) {
      const districts = ['Gurugram', 'Faridabad', 'Rohtak', 'Hisar', 'Panipat', 'Bhiwani', 'Sirsa', 'Jind', 'Sonipat', 'Karnal'];
      const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Beauty', 'Footwear', 'Accessories', 'Toys', 'Sports'];
      const prods = Array.from({ length: 100 }, (_, i) => ({
        sku: \`SKU-\${Math.floor(100000 + Math.random() * 900000)}\`,
        name: \`Product \${i + 1}\`,
        category: categories[i % categories.length],
        price: Math.floor(100 + Math.random() * 5000),
        stock: Math.floor(Math.random() * 500),
        binLocation: \`\${districts[i % districts.length]}-A\${Math.floor(Math.random() * 90) + 10}\`,
        status: i % 15 === 0 ? 'Out of Stock' : 'In Stock'
      }));
      await db.insert(products).values(prods);
      console.log("Seeded inventory");
    }

    // Check and seed Scanners
    const existingScanners = await db.select().from(scanners).limit(1);
    if (existingScanners.length === 0) {
      const depts = ['Scanning', 'Packing', 'Quality Check', 'Dispatch', 'Receiving'];
      const scns = Array.from({ length: 10 }, (_, i) => ({
        deviceId: \`SCAN-\${(i + 1).toString().padStart(3, '0')}\`,
        department: depts[i % depts.length],
        status: i % 5 === 0 ? 'Maintenance' : 'Online',
        assignedTo: null,
        batteryLevel: Math.floor(Math.random() * 60) + 40,
        lastPing: new Date().toISOString()
      }));
      await db.insert(scanners).values(scns);
      console.log("Seeded scanners");
    }
`;

let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace('console.log("Seeded treasury accounts");\n    } else {\n       await db.execute(sql`UPDATE treasury_accounts SET balance = 50000000`);\n    }', 'console.log("Seeded treasury accounts");\n    } else {\n       await db.execute(sql`UPDATE treasury_accounts SET balance = 50000000`);\n    }\n' + seedLogic);
fs.writeFileSync('server.ts', code);

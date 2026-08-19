const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const catalogApi = `
  const generateCatalog = () => {
    const items = ["Cotton T-Shirt", "Wireless Earbuds", "LED TV 43 inch", "Face Wash", "Running Shoes", "Decor Vase", "Smart Watch", "Bluetooth Speaker", "Formal Shirt", "Denim Jeans", "Yoga Mat", "Coffee Mug Set", "Laptop Backpack", "Gaming Mouse", "Office Chair"];
    const sellers = ["Rahul Trading Co.", "Global Retail", "Apex Merchants", "Sunrise Enterprises", "Metro Goods", "Prime Logistics", "Evergreen Store", "NextGen Electronics", "Omega Retailers", "Bharat Distributors"];
    const locations = ["Delhi NCR", "Maharashtra", "Gujarat", "Tamil Nadu", "West Bengal", "Rajasthan", "Karnataka", "UP", "Haryana", "Punjab"];
    const firstNames = ["Amit", "Rahul", "Rajesh", "Suresh", "Pooja", "Neha", "Vijay", "Ajay", "Sanjay", "Anil", "Priya", "Kavita", "Ramesh", "Deepak", "Vikas"];
    const lastNames = ["Kumar", "Singh", "Yadav", "Sharma", "Verma", "Gupta", "Mishra", "Pandey", "Chauhan", "Jain"];

    const catalog = [];
    for(let i=1; i<=1000; i++) {
      const stateCode = Math.floor(10 + Math.random() * 25);
      const pan = \`ABCDE\${Math.floor(1000 + Math.random()*9000)}F\`;
      const gstin = \`\${stateCode}\${pan}1Z\${Math.floor(1 + Math.random()*9)}\`;
      const item = items[Math.floor(Math.random()*items.length)];
      const fName = firstNames[Math.floor(Math.random()*firstNames.length)];
      const lName = lastNames[Math.floor(Math.random()*lastNames.length)];

      catalog.push({
        id: i,
        sku: \`SKU-\${10000 + i}\`,
        itemName: \`\${item} - \${Math.floor(Math.random() * 100)} Pack\`,
        quantity: Math.floor(Math.random() * (5000 - 50 + 1)) + 50,
        origin: locations[Math.floor(Math.random()*locations.length)],
        sellerName: \`\${fName} \${lName}\`,
        businessName: sellers[Math.floor(Math.random()*sellers.length)],
        location: locations[Math.floor(Math.random()*locations.length)],
        gstin: gstin,
        phone: \`9\${Math.floor(100000000 + Math.random() * 900000000)}\`,
        status: 'Active Contract',
        schedule: 'Scheduled for transfer every 5 days',
        agreementDate: new Date(Date.now() - Math.floor(Math.random()*31536000000)).toISOString().split('T')[0]
      });
    }
    return catalog;
  };
  let mockCatalog = generateCatalog();

  app.get("/api/catalog", requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = (req.query.search || "").toLowerCase();

    let filtered = mockCatalog;
    if (search) {
      filtered = filtered.filter(c =>
        c.sku.toLowerCase().includes(search) ||
        c.itemName.toLowerCase().includes(search) ||
        c.sellerName.toLowerCase().includes(search) ||
        c.businessName.toLowerCase().includes(search) ||
        c.gstin.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    res.json({
      data: paginated,
      total: search ? total : 25432,
      page,
      limit,
      totalPages: Math.ceil((search ? total : 25432) / limit)
    });
  });

  app.post("/api/catalog", requireAuth, (req, res) => {
    const newItem = {
      id: mockCatalog.length ? Math.max(...mockCatalog.map(e => e.id)) + 1 : 1,
      sku: \`SKU-\${10000 + (mockCatalog.length + 1)}\`,
      status: 'Active Contract',
      schedule: 'Scheduled for transfer every 5 days',
      agreementDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    mockCatalog.unshift(newItem);
    res.json(newItem);
  });

  app.delete("/api/catalog/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    mockCatalog = mockCatalog.filter(e => e.id !== id);
    res.json({ success: true });
  });
`;

const targetStr = `  // --- NEW STREAMLINED APIS ---`;
code = code.replace(targetStr, targetStr + "\n" + catalogApi);
fs.writeFileSync('server.ts', code);

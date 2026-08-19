const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiLogic = `
let verifiedLedgers = new Map<string, any>();

app.get("/api/v3/finance/daily-ledger", requireAuth, async (req, res) => {
  const todayDate = new Date().toISOString().split('T')[0];
  
  // Look for verified ledger
  if (verifiedLedgers.has(todayDate)) {
    return res.json({ ...verifiedLedgers.get(todayDate), isVerified: true });
  }

  // Auto-calculate core metrics (simulated logic for the current day)
  const totalUnitsScanned = Math.floor(Math.random() * 5000) + 15000;
  const unitSellingPrice = 450;
  const grossSales = totalUnitsScanned * unitSellingPrice;
  
  const cogs = grossSales * 0.4;
  const overhead = 120000; // fixed overheads: fuel, wages, power
  
  const dailyLosses = [
    { id: 'LOSS-001', sku: 'SKU-7821', category: 'Damaged in Inbound', amount: 4500, station: 'Dock Bay 04' },
    { id: 'LOSS-002', sku: 'SKU-4412', category: 'Missing in Wave Pick', amount: 12000, station: 'Aisle B' },
    { id: 'LOSS-003', sku: 'ORD-9912', category: 'Turnaround Penalty', amount: 8000, station: 'Dock Bay 07' },
    { id: 'LOSS-004', sku: 'SKU-1122', category: 'Expired', amount: 2500, station: 'Storage C' }
  ];
  
  const totalLossAmount = dailyLosses.reduce((acc, loss) => acc + loss.amount, 0);
  
  const netDailyProfit = grossSales - cogs - overhead - totalLossAmount;
  const profitMargin = (netDailyProfit / grossSales) * 100;

  res.json({
    date: todayDate,
    grossSales,
    cogs,
    overhead,
    totalLossAmount,
    netDailyProfit,
    profitMargin,
    dailyLosses,
    isVerified: false
  });
});

app.post("/api/v3/finance/daily-ledger/verify", requireAuth, async (req, res) => {
  const { date, managerId, remarks, data } = req.body;
  
  const verifiedLedger = {
    ...data,
    managerId,
    remarks,
    verifiedAt: new Date().toISOString()
  };
  
  verifiedLedgers.set(date, verifiedLedger);
  res.json({ success: true, verifiedLedger });
});
`;

code = code.replace('app.get("/bank/transactions"', apiLogic + '\napp.get("/bank/transactions"');

fs.writeFileSync('server.ts', code);

const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  // --- NEW STREAMLINED APIS ---`;

const newApi = `
  app.get("/api/bank/transactions", requireAuth, async (req, res) => {
    try {
      // We will generate 20 realistic transactions over the last 10 minutes
      const now = Date.now();
      const transactions = [
        { id: 101, timeOffset: 30000, counterparty: "Delhivery Surface", purpose: "Freight Charges Settlement", type: "Debit", amount: 45200, status: "Verified" },
        { id: 102, timeOffset: 65000, counterparty: "Apex Packaging", purpose: "Corrugated Boxes GRN", type: "Debit", amount: 125000, status: "Verified" },
        { id: 103, timeOffset: 95000, counterparty: "Meesho Escrow", purpose: "Daily Sales Settlement", type: "Credit", amount: 845000, status: "Completed" },
        { id: 104, timeOffset: 120000, counterparty: "Ramesh Customer", purpose: "RTO Refund", type: "Debit", amount: 1250, status: "Verified" },
        { id: 105, timeOffset: 180000, counterparty: "Global Tech Supplies", purpose: "Barcode Scanners Purchase", type: "Debit", amount: 45000, status: "Verified" },
        { id: 106, timeOffset: 210000, counterparty: "Shadowfax Express", purpose: "Last-mile Delivery Payout", type: "Debit", amount: 32400, status: "Verified" },
        { id: 107, timeOffset: 245000, counterparty: "Meesho Escrow", purpose: "Afternoon Sales Settlement", type: "Credit", amount: 620500, status: "Completed" },
        { id: 108, timeOffset: 270000, counterparty: "DHBVN Utility", purpose: "Warehouse Electricity Bill", type: "Debit", amount: 84000, status: "Verified" },
        { id: 109, timeOffset: 310000, counterparty: "Priya Customer", purpose: "Defective Item Refund", type: "Debit", amount: 890, status: "Verified" },
        { id: 110, timeOffset: 330000, counterparty: "Ecom Express", purpose: "B2B Freight Charges", type: "Debit", amount: 28900, status: "Verified" },
        { id: 111, timeOffset: 365000, counterparty: "Sunita Devi", purpose: "Damaged Goods Refund", type: "Debit", amount: 2100, status: "Verified" },
        { id: 112, timeOffset: 410000, counterparty: "Meesho Escrow", purpose: "Morning Batch Clearance", type: "Credit", amount: 412000, status: "Completed" },
        { id: 113, timeOffset: 450000, counterparty: "Warehouse Staffing Pvt", purpose: "Contract Labor Advance", type: "Debit", amount: 150000, status: "Verified" },
        { id: 114, timeOffset: 485000, counterparty: "BlueDart Aviation", purpose: "Express Air Freight", type: "Debit", amount: 67800, status: "Verified" },
        { id: 115, timeOffset: 510000, counterparty: "Rajesh Customer", purpose: "Lost in Transit Refund", type: "Debit", amount: 3400, status: "Verified" },
        { id: 116, timeOffset: 540000, counterparty: "Safety Equipments Inc", purpose: "Gloves & Helmets Stock", type: "Debit", amount: 12500, status: "Verified" },
        { id: 117, timeOffset: 565000, counterparty: "Meesho Escrow", purpose: "Flash Sale Settlement", type: "Credit", amount: 1250000, status: "Completed" },
        { id: 118, timeOffset: 580000, counterparty: "XpressBees", purpose: "Return Logistics Fee", type: "Debit", amount: 18400, status: "Verified" },
        { id: 119, timeOffset: 590000, counterparty: "Amit Customer", purpose: "Missing Parts Refund", type: "Debit", amount: 500, status: "Verified" },
        { id: 120, timeOffset: 600000, counterparty: "Internet Provider", purpose: "Leased Line Payment", type: "Debit", amount: 15000, status: "Verified" },
      ].map(t => ({
         ...t,
         timestamp: new Date(now - t.timeOffset).toISOString()
      }));

      res.json({
        balance: 14528400,
        transactions: transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      });
    } catch(e) {
      res.status(500).json({ error: "Failed to fetch banking data" });
    }
  });
`;

code = code.replace(targetStr, targetStr + "\\n" + newApi);
fs.writeFileSync(file, code);

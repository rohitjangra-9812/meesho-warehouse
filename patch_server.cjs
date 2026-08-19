const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const bankingCode = `
let bankBalance = 14528400;
let bankTransactions = [
        { id: 101, timestamp: Date.now() - 30000, counterparty: "Delhivery Surface", purpose: "Freight Charges Settlement", type: "Debit", amount: 45200, status: "Verified" },
        { id: 102, timestamp: Date.now() - 65000, counterparty: "Apex Packaging", purpose: "Corrugated Boxes GRN", type: "Debit", amount: 125000, status: "Verified" },
        { id: 103, timestamp: Date.now() - 95000, counterparty: "Meesho Escrow", purpose: "Daily Sales Settlement", type: "Credit", amount: 845000, status: "Completed" },
        { id: 104, timestamp: Date.now() - 120000, counterparty: "Ramesh Customer", purpose: "RTO Refund", type: "Debit", amount: 1250, status: "Verified" }
];
let nextTxId = 105;
const txTypes = [
  { p: "Courier Logistics", a: [10000, 50000], t: "Debit", c: "Ecom Express" },
  { p: "Warehouse Setup", a: [5000, 20000], t: "Debit", c: "Local Vendor" },
  { p: "Sale Batch", a: [100000, 500000], t: "Credit", c: "Meesho Escrow" },
  { p: "Customer Refund", a: [500, 2000], t: "Debit", c: "Customer" }
];

setInterval(() => {
  const r = txTypes[Math.floor(Math.random() * txTypes.length)];
  const amount = Math.floor(Math.random() * (r.a[1] - r.a[0]) + r.a[0]);
  
  if (r.t === 'Credit') bankBalance += amount;
  else bankBalance -= amount;

  bankTransactions.push({
    id: nextTxId++,
    timestamp: Date.now(),
    counterparty: r.c,
    purpose: r.p,
    type: r.t,
    amount: amount,
    status: "Completed"
  });

  if (bankTransactions.length > 50) bankTransactions.shift();
}, 5000);
`;

code = code.replace('const app = express();', bankingCode + '\nconst app = express();');

const apiBlockStart = code.indexOf('app.get("/api/bank/transactions"');
const apiBlockEnd = code.indexOf('});', apiBlockStart) + 3;

const newApiBlock = `app.get("/api/bank/transactions", requireAuth, async (req, res) => {
    try {
      res.json({
        balance: bankBalance,
        transactions: [...bankTransactions].sort((a, b) => b.timestamp - a.timestamp).map(t => ({...t, timestamp: new Date(t.timestamp).toISOString()}))
      });
    } catch(e) {
      res.status(500).json({ error: "Failed to fetch banking data" });
    }
  });`;

code = code.substring(0, apiBlockStart) + newApiBlock + code.substring(apiBlockEnd);

fs.writeFileSync('server.ts', code);
console.log("Patched server for live bank");

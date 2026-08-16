const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We want to replace the POST /api/inventory/seed logic with a truncate and seed of 100 fresh, fully populated items.

const oldSeedRegex = /\/\/ POST \/api\/inventory\/seed: Seed 10000 products[\s\S]*?(?=\/\/ POST \/api\/inventory\/add)/;

const newSeedLogic = `// POST /api/inventory/seed: Seed fresh products
  app.post("/api/inventory/seed", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      await db.delete(products); // Clear existing
      
      const districts = [
        "Gurugram", "Faridabad", "Rohtak", "Hisar", "Karnal", "Panipat", "Sonipat", 
        "Panchkula", "Ambala", "Yamunanagar", "Sirsa", "Fatehabad", "Jind", "Kaithal", 
        "Kurukshetra", "Jhajjar", "Rewari", "Mahendragarh", "Palwal", "Nuh", 
        "Charkhi Dadri", "Bhiwani"
      ];
      
      const adjectives = ["Premium", "Cotton", "Wireless", "Smart", "Luxury", "Classic", "Modern", "Eco-friendly", "Durable", "Portable"];
      const nouns = ["T-Shirt", "Headphones", "Watch", "Sneakers", "Backpack", "Sunglasses", "Speaker", "Wallet", "Jacket", "Jeans"];
      const colors = ["Black", "White", "Blue", "Red", "Green", "Silver", "Gold", "Grey", "Brown", "Navy"];

      const itemsToInsert = [];
      for (let i = 0; i < 100; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const district = districts[Math.floor(Math.random() * districts.length)];
        
        itemsToInsert.push({
          sku: \`SKU-\${Date.now()}-\${i}-\${Math.floor(Math.random() * 10000)}\`,
          name: \`\${adj} \${noun} - \${color}\`,
          stockQuantity: Math.floor(Math.random() * 500) + 10,
          binLocation: \`\${district}-BIN-\${Math.floor(Math.random() * 100) + 1}\`,
          sourceVehicle: \`MH-\${Math.floor(10 + Math.random() * 90)}-AB-\${Math.floor(1000 + Math.random() * 9000)}\`,
          qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',
          category: 'General',
          price: Math.floor(100 + Math.random() * 9900)
        });
      }
      
      await db.insert(products).values(itemsToInsert);
      res.json({ message: "Successfully refreshed inventory data" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed inventory" });
    }
  });

  `;

code = code.replace(oldSeedRegex, newSeedLogic);
fs.writeFileSync('server.ts', code);

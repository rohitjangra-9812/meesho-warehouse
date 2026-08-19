const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const badBlock = `    } catch(e) {
      res.status(500).json({ error: "Failed to fetch banking data" });
    }
  });
    } catch(e) {
      res.status(500).json({ error: "Failed to fetch banking data" });
    }
  });`;

const goodBlock = `    } catch(e) {
      res.status(500).json({ error: "Failed to fetch banking data" });
    }
  });`;

code = code.replace(badBlock, goodBlock);
fs.writeFileSync('server.ts', code);
console.log("Fixed syntax");

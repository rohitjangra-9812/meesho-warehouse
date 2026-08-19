const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The replacement was probably broken. Let's inspect it or just use simple string replacement.
code = code.replace(/\/\/ Deleted GET \/api\/employees \(using mock below instead\)[\s\S]*?\/\* End \*\//, ''); 
// Wait, I didn't add /* End */.


const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf8');
console.log(code);

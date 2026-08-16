const fetch = require('node-fetch');
async function run() {
  const res = await fetch('http://localhost:3000/api/inventory');
  console.log(await res.text());
}
run();

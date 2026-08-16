const fetch = require('node-fetch');
const cp = require('child_process');

async function run() {
  const server = cp.spawn('node', ['dist/server.cjs'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3001' }
  });

  server.stdout.on('data', d => console.log('STDOUT:', d.toString().slice(0, 100)));
  server.stderr.on('data', d => console.log('STDERR:', d.toString().slice(0, 100)));

  await new Promise(r => setTimeout(r, 4000));

  try {
    const res = await fetch('http://localhost:3000/api/inventory', { headers: { 'Authorization': 'Bearer 1234' } });
    console.log('Status:', res.status);
    console.log(await res.text());
  } catch (err) {
    console.log('Error:', err);
  }

  server.kill();
}
run();

import fetch from 'node-fetch';
async function run() {
  const res = await fetch('http://localhost:3000/api/activity-logs', { headers: { 'Authorization': 'Bearer 1234' } });
  console.log(res.status);
  console.log(await res.text());
}
run();

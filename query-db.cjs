const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const res = await pool.query('SELECT * FROM vehicle_logs ORDER BY id DESC LIMIT 5');
  console.log(res.rows);
  pool.end();
}
run();

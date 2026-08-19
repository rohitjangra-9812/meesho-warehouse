const { execSync } = require('child_process');

try {
  // Let's create a DATABASE_URL to use if we have socket
  const user = process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_ADMIN_PASSWORD;
  const dbName = process.env.SQL_DB_NAME;
  const socket = process.env.SQL_HOST;
  
  const url = `postgres://${user}:${password}@localhost:5432/${dbName}?host=${socket}`;
  console.log("Using URL pattern for local connection via socket:", url);

  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: url
    }
  });
  console.log('Drizzle pushed successfully');
} catch (error) {
  console.error('Failed to run Drizzle');
}

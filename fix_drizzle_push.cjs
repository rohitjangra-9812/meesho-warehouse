const { execSync } = require('child_process');

try {
  // Let's create a DATABASE_URL to use if we have socket
  const user = process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_ADMIN_PASSWORD;
  const dbName = process.env.SQL_DB_NAME;
  const socket = process.env.SQL_HOST;
  
  // Drizzle doesn't support the URL format well for sockets, so let's let drizzle.config.ts handle it
  // Wait, drizzle.config.ts uses SQL_HOST, SQL_ADMIN_USER, etc.
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SQL_HOST: socket,
      SQL_DB_NAME: dbName,
      SQL_ADMIN_USER: user,
      SQL_ADMIN_PASSWORD: password
    }
  });
  console.log('Drizzle pushed successfully');
} catch (error) {
  console.error('Failed to run Drizzle', error.message);
}

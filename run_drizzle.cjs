const { execSync } = require('child_process');

try {
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SQL_HOST: process.env.SQL_HOST,
      SQL_DB_NAME: process.env.SQL_DB_NAME,
      SQL_ADMIN_USER: process.env.SQL_ADMIN_USER,
      SQL_ADMIN_PASSWORD: process.env.SQL_ADMIN_PASSWORD
    }
  });
  console.log('Drizzle pushed successfully');
} catch (error) {
  console.error('Failed to run Drizzle', error);
}

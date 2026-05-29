/**
 * Drops device_tokens so Sequelize can recreate it with VARCHAR token (MySQL).
 * Run on Railway: railway run --service <api-service> node scripts/drop-device-tokens.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const RAILWAY_MYSQL_INTERNAL = 'mysql.railway.internal';

const normalizeHost = (host) => {
  if (!host || !host.includes(RAILWAY_MYSQL_INTERNAL)) return host;
  return host.replace(
    new RegExp(`(${RAILWAY_MYSQL_INTERNAL.replace(/\./g, '\\.')})+`, 'g'),
    RAILWAY_MYSQL_INTERNAL
  );
};

async function main() {
  const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let connection;

  if (rawUrl) {
    const url = rawUrl.replace(
      /mysql\.railway\.internal(?:mysql\.railway\.internal)+/g,
      RAILWAY_MYSQL_INTERNAL
    );
    connection = await mysql.createConnection(url);
  } else {
    const host = normalizeHost(
      process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOSTNAME
    );
    connection = await mysql.createConnection({
      host: host || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306),
      user: process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
      database:
        process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE_NAME,
    });
  }

  await connection.query('DROP TABLE IF EXISTS device_tokens');
  console.log('✅ Dropped table device_tokens (if it existed).');
  await connection.end();
}

main().catch((error) => {
  console.error('❌ Failed:', error.message);
  process.exit(1);
});

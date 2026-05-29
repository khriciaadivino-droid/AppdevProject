const { Sequelize } = require('sequelize');

// Set USE_MYSQL=true on Railway and link the MySQL plugin (or set MYSQL_* / DATABASE_URL).
const useMySQL = process.env.USE_MYSQL === 'true';

const mysqlUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const mysqlHost =
  process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOSTNAME;
const mysqlPort = Number(
  process.env.MYSQL_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT_NUMBER || 3306
);
const mysqlDatabase =
  process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE_NAME;
const mysqlUser = process.env.MYSQL_USER || process.env.MYSQLUSER;
const mysqlPassword = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD;

let sequelize;

if (useMySQL && mysqlUrl) {
  sequelize = new Sequelize(mysqlUrl, { dialect: 'mysql', logging: false });
} else if (useMySQL) {
  if (!mysqlHost || mysqlHost === '127.0.0.1' || mysqlHost === 'localhost') {
    console.warn(
      '⚠️ USE_MYSQL=true but MYSQL_HOST is missing or localhost. On Railway, add reference variables from your MySQL service (e.g. MYSQLHOST → MYSQL_HOST).'
    );
  }
  sequelize = new Sequelize(mysqlDatabase || 'railway', mysqlUser || 'root', mysqlPassword || '', {
    host: mysqlHost || '127.0.0.1',
    port: mysqlPort,
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './divino.db',
    logging: false,
  });
}

console.log(`🗄️  Using ${useMySQL ? 'MySQL' : 'SQLite'} database`);

module.exports = sequelize;

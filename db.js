const { Sequelize } = require('sequelize');

// Railway: link MySQL plugin — MYSQLHOST/DATABASE_URL are injected automatically.
// Set USE_MYSQL=true explicitly, or leave unset to auto-use MySQL when Railway vars exist.
const explicitMysql = process.env.USE_MYSQL === 'true';
const explicitSqlite = process.env.USE_MYSQL === 'false';

const RAILWAY_MYSQL_INTERNAL = 'mysql.railway.internal';

/** Fixes duplicated host values from mis-pasted Railway reference vars. */
const normalizeMysqlHost = (host) => {
  if (!host) return host;
  const trimmed = String(host).trim();
  if (!trimmed.includes(RAILWAY_MYSQL_INTERNAL)) return trimmed;
  return trimmed.replace(
    new RegExp(`(${RAILWAY_MYSQL_INTERNAL.replace(/\./g, '\\.')})+`, 'g'),
    RAILWAY_MYSQL_INTERNAL
  );
};

const normalizeMysqlUrl = (url) => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.hostname = normalizeMysqlHost(parsed.hostname);
    return parsed.toString();
  } catch {
    return url.replace(
      /mysql\.railway\.internal(?:mysql\.railway\.internal)+/g,
      RAILWAY_MYSQL_INTERNAL
    );
  }
};

const isValidMysqlHost = (host) =>
  Boolean(host) &&
  host !== '127.0.0.1' &&
  host !== 'localhost' &&
  !host.includes('internalinternal') &&
  !host.includes(`${RAILWAY_MYSQL_INTERNAL}${RAILWAY_MYSQL_INTERNAL}`);

const rawMysqlUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
const mysqlUrl = rawMysqlUrl ? normalizeMysqlUrl(rawMysqlUrl) : null;

const mysqlHost = normalizeMysqlHost(
  process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOSTNAME
);
const mysqlPort = Number(
  process.env.MYSQL_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT_NUMBER || 3306
);
const mysqlDatabase =
  process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE_NAME;
const mysqlUser = process.env.MYSQL_USER || process.env.MYSQLUSER;
const mysqlPassword = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD;

const hasMysqlUrl = Boolean(mysqlUrl);
const hasMysqlHost = isValidMysqlHost(mysqlHost);

const useMySQL = !explicitSqlite && (explicitMysql || hasMysqlUrl || hasMysqlHost);

if (
  !explicitSqlite &&
  !useMySQL &&
  (rawMysqlUrl || mysqlHost) &&
  (process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DATABASE_URL)
) {
  console.warn(
    '⚠️ MySQL env vars look invalid (check MYSQL_HOST is only ${{MySQL.MYSQLHOST}}). Using SQLite.'
  );
}

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
  const storage =
    process.env.SQLITE_STORAGE ||
    (process.env.RAILWAY_ENVIRONMENT ? '/app/data/divino.db' : './divino.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  });
}

console.log(
  `🗄️  Using ${useMySQL ? 'MySQL' : 'SQLite'} database` +
    (useMySQL && mysqlHost ? ` (host: ${mysqlHost})` : '')
);

module.exports = sequelize;

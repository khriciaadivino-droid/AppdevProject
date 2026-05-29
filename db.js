const { Sequelize } = require('sequelize');

// Railway: link MySQL plugin — MYSQLHOST/DATABASE_URL are injected automatically.
// Set USE_MYSQL=true explicitly, or leave unset to auto-use MySQL when Railway vars exist.
const explicitMysql = process.env.USE_MYSQL === 'true';
const explicitSqlite = process.env.USE_MYSQL === 'false';

const RAILWAY_MYSQL_INTERNAL = 'mysql.railway.internal';
const DOUBLED_INTERNAL = RAILWAY_MYSQL_INTERNAL + RAILWAY_MYSQL_INTERNAL;

/** Fixes duplicated host values from mis-pasted Railway reference vars. */
const normalizeMysqlHost = (host) => {
  if (!host) return host;
  let h = String(host).trim();
  while (h.includes(DOUBLED_INTERNAL)) {
    h = h.split(DOUBLED_INTERNAL).join(RAILWAY_MYSQL_INTERNAL);
  }
  if (h.length > RAILWAY_MYSQL_INTERNAL.length && h.startsWith(RAILWAY_MYSQL_INTERNAL)) {
    const rest = h.slice(RAILWAY_MYSQL_INTERNAL.length);
    if (rest === RAILWAY_MYSQL_INTERNAL || rest.startsWith(RAILWAY_MYSQL_INTERNAL)) {
      h = RAILWAY_MYSQL_INTERNAL;
    }
  }
  return h;
};

const normalizeMysqlUrl = (url) => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.hostname = normalizeMysqlHost(parsed.hostname);
    return parsed.toString();
  } catch {
    return String(url).split(DOUBLED_INTERNAL).join(RAILWAY_MYSQL_INTERNAL);
  }
};

const isValidMysqlHost = (host) => {
  const normalized = normalizeMysqlHost(host);
  if (!normalized || normalized === '127.0.0.1' || normalized === 'localhost') {
    return false;
  }
  if (normalized.includes(DOUBLED_INTERNAL)) {
    return false;
  }
  if (
    normalized.includes(RAILWAY_MYSQL_INTERNAL) &&
    normalized !== RAILWAY_MYSQL_INTERNAL
  ) {
    return false;
  }
  return true;
};

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

const mysqlUrlHost = (() => {
  if (!mysqlUrl) return null;
  try {
    return normalizeMysqlHost(new URL(mysqlUrl).hostname);
  } catch {
    return null;
  }
})();

const hasMysqlUrl = Boolean(mysqlUrl) && isValidMysqlHost(mysqlUrlHost);
const hasMysqlHost = isValidMysqlHost(mysqlHost);

let useMySQL = !explicitSqlite && (explicitMysql || hasMysqlUrl || hasMysqlHost);

if (
  !explicitSqlite &&
  !useMySQL &&
  (rawMysqlUrl || mysqlHost) &&
  String(rawMysqlUrl || mysqlHost).includes(RAILWAY_MYSQL_INTERNAL)
) {
  console.warn(
    '⚠️ MySQL host/URL is misconfigured (duplicate mysql.railway.internal). Using SQLite. Set MYSQL_HOST to only ${{MySQL.MYSQLHOST}}.'
  );
}

let sequelize;

if (useMySQL && mysqlUrl && hasMysqlUrl) {
  sequelize = new Sequelize(mysqlUrl, { dialect: 'mysql', logging: false });
} else if (useMySQL && hasMysqlHost) {
  sequelize = new Sequelize(mysqlDatabase || 'railway', mysqlUser || 'root', mysqlPassword || '', {
    host: mysqlHost,
    port: mysqlPort,
    dialect: 'mysql',
    logging: false,
  });
} else {
  useMySQL = false;
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
    (useMySQL && mysqlHost ? ` (host: ${mysqlHost})` : '') +
    (useMySQL && mysqlUrlHost && !mysqlHost ? ` (url host: ${mysqlUrlHost})` : '')
);

module.exports = sequelize;

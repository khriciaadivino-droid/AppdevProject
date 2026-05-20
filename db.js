const { Sequelize } = require('sequelize');

// Default to SQLite for development (no setup needed)
// Set USE_MYSQL=true in .env to use MySQL instead
const useMySQL = process.env.USE_MYSQL === 'true';

const sequelize = useMySQL
    ? new Sequelize(
        process.env.MYSQL_DATABASE || 'khringproj',
        process.env.MYSQL_USER || 'khringproj_user',
        process.env.MYSQL_PASSWORD || 'khringproj_password',
        {
            host: process.env.MYSQL_HOST || '127.0.0.1',
            port: Number(process.env.MYSQL_PORT || 3306),
            dialect: 'mysql',
            logging: false,
        }
    )
    : new Sequelize({
        dialect: 'sqlite',
        storage: './divino.db',
        logging: false,
    });

console.log(`🗄️  Using ${useMySQL ? 'MySQL' : 'SQLite'} database`);

module.exports = sequelize;

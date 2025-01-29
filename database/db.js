const mysql = require('mysql2/promise');

/**
 * Creates and configures a MySQL connection pool for managing database connections efficiently.
 *
 * This pool manages a set of connections to the MySQL database, allowing reuse of connections 
 * for better performance and handling concurrent requests without opening new connections repeatedly.
 * Usage:
 * - The pool handles acquiring and releasing connections automatically.
 * - Use `pool.getConnection()` or `pool.query()` to interact with the database.
 */
const pool = mysql.createPool({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  'timezone': "+00:00",
});

module.exports = {
  pool
};

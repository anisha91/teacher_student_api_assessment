const mysql = require("mysql2/promise");
require("dotenv").config();

// Creating a MySQL connection pool using the `mysql2` library
const pool = mysql.createPool({
  host: process.env.DB_HOST, //If DB_HOST which is Dockerized MYSQL database is not present use localhost
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
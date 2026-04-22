const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "verity_db",
  password: "admin123",
  port: 5432,
});

const query = (text, params) => {
  return pool.query(text, params);
};

// Export prisma client as the main export, and query as a property
module.exports = prisma;
module.exports.query = query;
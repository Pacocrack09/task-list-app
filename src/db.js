const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

async function initializeDatabase() {
  const p = await getPool();
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tasks' AND xtype='U')
    CREATE TABLE tasks (
      id INT IDENTITY(1,1) PRIMARY KEY,
      title NVARCHAR(255) NOT NULL,
      completed BIT DEFAULT 0,
      created_at DATETIME DEFAULT GETDATE()
    )
  `);
  console.log('Database initialized');
}

module.exports = { getPool, initializeDatabase, sql };

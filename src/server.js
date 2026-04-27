require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./db');

const PORT = process.env.PORT || 3000;

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

const { connect, mongoose } = require('./db');
const authRoutes = require('./routes/auth');
const plansRoutes = require('./routes/plans');
const miscRoutes = require('./routes/misc');
const errorHandler = require('./middleware/error');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB after retries:', err);
    process.exit(1);
  }

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(bodyParser.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/plans', plansRoutes);
  app.use('/api', miscRoutes);

  // Central error handler (should be the last middleware)
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`Whally backend listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down server...`);
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
    // Force exit after 10s
    setTimeout(() => {
      console.error('Forcing shutdown');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Capture unhandled errors
  process.on('uncaughtException', err => {
    console.error('uncaughtException', err);
  });
  process.on('unhandledRejection', (reason, p) => {
    console.error('unhandledRejection at', p, 'reason:', reason);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

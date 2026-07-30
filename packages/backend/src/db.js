const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whally';

// Map mongoose readyState to human readable
const STATE_MAP = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

async function tryConnect(uri, options = {}, attempts = 5, initialDelay = 1000) {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < attempts) {
    try {
      await mongoose.connect(uri, options);
      return mongoose;
    } catch (err) {
      attempt += 1;
      console.error(`MongoDB connect attempt ${attempt} failed:`, err.message || err);
      if (attempt >= attempts) throw err;
      // exponential backoff
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

function connect() {
  // Keep mongoose options explicit and compatible with modern drivers
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  // Try connecting with retries
  return tryConnect(MONGODB_URI, options, 5, 1000);
}

function connectionStatus() {
  const state = mongoose.connection.readyState;
  return {
    state,
    stateString: STATE_MAP[state] || 'unknown'
  };
}

module.exports = { connect, mongoose, connectionStatus };

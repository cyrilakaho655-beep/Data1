const express = require('express');
const { connectionStatus } = require('../db');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const db = connectionStatus();
    res.json({ ok: true, uptime: process.uptime(), db });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Health check failed' });
  }
});

module.exports = router;

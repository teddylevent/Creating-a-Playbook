const express = require('express');
const router = express.Router();
const pool = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, rating, wins, losses, version,
              CASE WHEN (wins + losses) = 0 THEN 0
                   ELSE ROUND(wins::numeric / (wins + losses) * 100, 1)
              END AS win_rate
       FROM agents
       ORDER BY rating DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

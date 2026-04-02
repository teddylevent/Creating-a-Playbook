const express = require('express');
const router = express.Router();
const { registerAgent, listAgents, getAgent } = require('../controllers/agentController');
const Match = require('../models/match');

router.post('/', registerAgent);
router.get('/', listAgents);
router.get('/:id', getAgent);

// Match history for an agent
router.get('/:id/matches', async (req, res) => {
  try {
    const matches = await Match.findByAgent(req.params.id);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

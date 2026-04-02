const Bet = require('../models/bet');
const Agent = require('../models/agent');
const Match = require('../models/match');

async function placeBet(req, res) {
  try {
    const { user_id, match_id, agent_id, amount } = req.body;
    if (!user_id || !match_id || !agent_id || !amount) {
      return res.status(400).json({ error: 'user_id, match_id, agent_id, and amount are required' });
    }
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    // Ensure balance row exists
    await Bet.ensureBalance(user_id);

    const balance = await Bet.getBalance(user_id);
    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient coins', balance });
    }

    // Validate agent and match exist
    const [agent, match] = await Promise.all([
      Agent.findById(agent_id),
      Match.findById(match_id),
    ]);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const bet = await Bet.create({ user_id, match_id, agent_id, amount });
    const newBalance = await Bet.getBalance(user_id);
    res.status(201).json({ bet, new_balance: newBalance });
  } catch (err) {
    console.error('placeBet error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getBalance(req, res) {
  try {
    const { user_id } = req.params;
    await Bet.ensureBalance(user_id);
    const coins = await Bet.getBalance(user_id);
    res.json({ user_id, coins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { placeBet, getBalance };

const Agent = require('../models/agent');
const Match = require('../models/match');
const Bet = require('../models/bet');
const { runMatch } = require('../utils/simulationEngine');
const { calculateElo } = require('../utils/elo');

async function runMatchHandler(req, res) {
  try {
    const { agent1_id, agent2_id } = req.body;
    if (!agent1_id || !agent2_id) {
      return res.status(400).json({ error: 'agent1_id and agent2_id are required' });
    }
    if (agent1_id === agent2_id) {
      return res.status(400).json({ error: 'Agents must be different' });
    }

    const [agent1, agent2] = await Promise.all([
      Agent.findById(agent1_id),
      Agent.findById(agent2_id),
    ]);
    if (!agent1) return res.status(404).json({ error: `Agent ${agent1_id} not found` });
    if (!agent2) return res.status(404).json({ error: `Agent ${agent2_id} not found` });

    // Run simulation
    const { winnerId, result, replay } = await runMatch(agent1, agent2);

    // Persist match
    const match = await Match.create({
      agent1_id,
      agent2_id,
      winner_id: winnerId,
      replay_data: replay,
    });

    // Update ELO
    const { newRatingA, newRatingB } = calculateElo(agent1.rating, agent2.rating, result);
    await Promise.all([
      Agent.updateRating(agent1_id, newRatingA),
      Agent.updateRating(agent2_id, newRatingB),
    ]);

    // Update wins/losses
    if (winnerId === agent1_id) {
      await Agent.incrementWins(agent1_id);
      await Agent.incrementLosses(agent2_id);
    } else if (winnerId === agent2_id) {
      await Agent.incrementWins(agent2_id);
      await Agent.incrementLosses(agent1_id);
    }

    // Settle bets
    if (winnerId) {
      await Bet.settle(match.id, winnerId);
    }

    res.json({
      match_id: match.id,
      winner_id: winnerId,
      result,
      agent1: { id: agent1_id, name: agent1.name, new_rating: newRatingA },
      agent2: { id: agent2_id, name: agent2.name, new_rating: newRatingB },
      ticks: replay.ticks,
    });
  } catch (err) {
    console.error('runMatch error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function listMatches(req, res) {
  try {
    const matches = await Match.findAll();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMatch(req, res) {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { runMatchHandler, listMatches, getMatch };

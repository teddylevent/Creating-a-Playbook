const express = require('express');
const router = express.Router();
const { createBot, ARCHETYPES } = require('../models/Bot');
const { playerOverall } = require('../models/Player');

module.exports = function(store) {
  // Get all archetypes
  router.get('/archetypes', (req, res) => {
    res.json(Object.keys(ARCHETYPES));
  });

  // Create a new bot
  router.post('/', (req, res) => {
    const { teamName, managerName, archetype } = req.body;
    const bot = createBot({ teamName, managerName, archetype });
    store.bots.push(bot);
    res.status(201).json(bot);
  });

  // Get all bots (summary)
  router.get('/', (req, res) => {
    res.json(store.bots.map(b => ({
      id: b.id,
      teamName: b.teamName,
      managerName: b.managerName,
      archetype: b.archetype,
      personalityLabel: b.personalityLabel,
      traits: b.traits,
      stats: b.stats,
      formation: b.formation,
      playerCount: b.players.length,
    })));
  });

  // Get a single bot with full details
  router.get('/:id', (req, res) => {
    const bot = store.bots.find(b => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    res.json({
      ...bot,
      players: bot.players.map(p => ({
        ...p,
        overall: playerOverall(p),
      })),
    });
  });

  // Get bot relationships
  router.get('/:id/relationships', (req, res) => {
    const bot = store.bots.find(b => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const relationships = {};
    for (const [otherId, status] of Object.entries(bot.relationships)) {
      const other = store.bots.find(b => b.id === otherId);
      if (other) {
        relationships[otherId] = { teamName: other.teamName, status };
      }
    }
    res.json(relationships);
  });

  return router;
};

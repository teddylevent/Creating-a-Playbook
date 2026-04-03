const express = require('express');
const router = express.Router();

module.exports = function(store, leagueService, feedService, mediaBot, relationshipService) {
  // Create league
  router.post('/create', (req, res) => {
    const { name } = req.body;
    const league = leagueService.createLeague(name);
    relationshipService.initRelationships();
    res.status(201).json(league);
  });

  // Generate fixtures
  router.post('/fixtures', (req, res) => {
    try {
      const fixtures = leagueService.generateFixtures();
      res.json({ matchdays: fixtures.length, fixtures });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Simulate next matchday
  router.post('/simulate', (req, res) => {
    try {
      const result = leagueService.simulateMatchday();

      // Generate feed posts for each match
      for (const match of result.matches) {
        const homeBot = store.bots.find(b => b.id === match.homeTeamId);
        const awayBot = store.bots.find(b => b.id === match.awayTeamId);

        // Pre-match posts (retroactively)
        feedService.generatePreMatchPost(homeBot, awayBot.teamName);
        feedService.generatePreMatchPost(awayBot, homeBot.teamName);

        // Match summary from media
        mediaBot.postMatchSummary(match);

        // Post-match reactions
        feedService.generatePostMatchPost(homeBot, match);
        feedService.generatePostMatchPost(awayBot, match);

        // Update relationships
        relationshipService.updateAfterMatch(match);

        // Rivalry posts if applicable
        if (homeBot.relationships[awayBot.id] === 'rival') {
          feedService.generateRivalryPost(homeBot, awayBot.teamName);
        }
        if (awayBot.relationships[homeBot.id] === 'rival') {
          feedService.generateRivalryPost(awayBot, homeBot.teamName);
        }
      }

      // Random daily posts from some bots
      for (const bot of store.bots) {
        if (Math.random() < 0.3) {
          feedService.generateRandomPost(bot);
        }
      }

      // Media trade rumors
      mediaBot.generateTradeRumors();

      // Power rankings every 3 matchdays
      if (result.matchday && result.matchday % 3 === 0) {
        const standings = leagueService.getStandings();
        mediaBot.postPowerRankings(standings);
      }

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get standings
  router.get('/standings', (req, res) => {
    res.json(leagueService.getStandings());
  });

  // Get league info
  router.get('/', (req, res) => {
    res.json(store.league || { error: 'No league created' });
  });

  // Get all matches
  router.get('/matches', (req, res) => {
    res.json(store.matches.slice().reverse());
  });

  // Get specific match
  router.get('/matches/:id', (req, res) => {
    const match = store.matches.find(m => m.id === req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  });

  return router;
};

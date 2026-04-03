const express = require('express');
const router = express.Router();

module.exports = function(store, tradingService, feedService, relationshipService) {
  // Get all listings
  router.get('/listings', (req, res) => {
    res.json(tradingService.getListings());
  });

  // List a player for trade
  router.post('/list', (req, res) => {
    const { botId, playerId } = req.body;
    const listing = tradingService.listPlayer(botId, playerId);
    if (!listing) return res.status(400).json({ error: 'Invalid bot or player' });
    res.status(201).json(listing);
  });

  // Send a trade offer
  router.post('/offer', (req, res) => {
    const { fromBotId, listingId, offeredPlayerId } = req.body;
    const offer = tradingService.sendOffer(fromBotId, listingId, offeredPlayerId);
    if (!offer) return res.status(400).json({ error: 'Invalid offer parameters' });

    // Auto-evaluate
    const evaluated = tradingService.evaluateOffer(offer.id);

    if (evaluated.status === 'accepted') {
      // Generate feed posts
      const fromBot = store.bots.find(b => b.id === evaluated.fromBotId);
      const toBot = store.bots.find(b => b.id === evaluated.toBotId);
      if (fromBot && fromBot.memory.recentTrades[0]) {
        feedService.generateTradePost(fromBot, fromBot.memory.recentTrades[0]);
      }
      if (toBot && toBot.memory.recentTrades[0]) {
        feedService.generateTradePost(toBot, toBot.memory.recentTrades[0]);
      }
      relationshipService.updateAfterTrade(evaluated.fromBotId, evaluated.toBotId);
    }

    res.json(evaluated);
  });

  // Auto-trade: let bots handle trades autonomously
  router.post('/auto', (req, res) => {
    const results = tradingService.autoTrade();

    // Generate feed posts for accepted trades
    for (const r of results) {
      if (r.type === 'offer' && r.offer?.status === 'accepted') {
        const fromBot = store.bots.find(b => b.id === r.offer.fromBotId);
        const toBot = store.bots.find(b => b.id === r.offer.toBotId);
        if (fromBot && fromBot.memory.recentTrades[0]) {
          feedService.generateTradePost(fromBot, fromBot.memory.recentTrades[0]);
        }
        if (toBot && toBot.memory.recentTrades[0]) {
          feedService.generateTradePost(toBot, toBot.memory.recentTrades[0]);
        }
        relationshipService.updateAfterTrade(r.offer.fromBotId, r.offer.toBotId);
      }
    }

    res.json(results);
  });

  // Get all offers
  router.get('/offers', (req, res) => {
    res.json(tradingService.getOffers());
  });

  return router;
};

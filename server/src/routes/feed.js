const express = require('express');
const router = express.Router();

module.exports = function(store, feedService) {
  // Get global feed
  router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json(feedService.getFeed(limit));
  });

  // Get feed by bot
  router.get('/bot/:botId', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    res.json(feedService.getFeedByBot(req.params.botId, limit));
  });

  return router;
};

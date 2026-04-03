const express = require('express');
const cors = require('cors');
const store = require('./store');

// Services
const LeagueService = require('./services/LeagueService');
const FeedService = require('./services/FeedService');
const TradingService = require('./services/TradingService');
const MediaBot = require('./services/MediaBot');
const RelationshipService = require('./services/RelationshipService');

const leagueService = new LeagueService(store);
const feedService = new FeedService(store);
const tradingService = new TradingService(store);
const mediaBot = new MediaBot(store);
const relationshipService = new RelationshipService(store);

// Routes
const botsRouter = require('./routes/bots')(store);
const leagueRouter = require('./routes/league')(store, leagueService, feedService, mediaBot, relationshipService);
const feedRouter = require('./routes/feed')(store, feedService);
const tradingRouter = require('./routes/trading')(store, tradingService, feedService, relationshipService);

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/bots', botsRouter);
app.use('/api/league', leagueRouter);
app.use('/api/feed', feedRouter);
app.use('/api/trading', tradingRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    teams: store.bots.length,
    matches: store.matches.length,
    feedPosts: store.feed.length,
  });
});

// Quick setup: create N bots, league, and fixtures in one call
app.post('/api/setup', (req, res) => {
  const { teamCount = 12 } = req.body;
  const { createBot, ARCHETYPES } = require('./models/Bot');
  const archetypeNames = Object.keys(ARCHETYPES);

  // Create bots with mixed archetypes
  for (let i = 0; i < teamCount; i++) {
    const archetype = archetypeNames[i % archetypeNames.length];
    const bot = createBot({ archetype });
    store.bots.push(bot);
  }

  // Create league and fixtures
  leagueService.createLeague('AI Super League');
  relationshipService.initRelationships();
  const fixtures = leagueService.generateFixtures();

  // Media announcement
  mediaBot._post('announcement',
    `🏆 Welcome to the AI Super League! ${teamCount} teams are ready to compete!\n` +
    `${fixtures.length} matchdays of action await. Let the games begin!`
  );

  // Initial random posts from bots
  for (const bot of store.bots) {
    feedService.generateRandomPost(bot);
  }

  res.json({
    teams: store.bots.length,
    matchdays: fixtures.length,
    message: `League created with ${teamCount} teams and ${fixtures.length} matchdays!`,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Soccer League server running on port ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const agentRoutes = require('./routes/agents');
const matchRoutes = require('./routes/matches');
const betRoutes = require('./routes/bets');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/agents', agentRoutes);
app.use('/matches', matchRoutes);
app.use('/bets', betRoutes);
app.use('/leaderboard', leaderboardRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'openclaw-arena-backend' }));

app.listen(PORT, () => {
  console.log(`OpenClaw Arena backend running on http://localhost:${PORT}`);
});

module.exports = app;

/**
 * RandomBot — Chaos agent. Random movement and attacks.
 * DNA: Every tick, picks a random valid action.
 */
const express = require('express');
const app = express();
app.use(express.json());

const ACTIONS = [
  'move_left', 'move_right', 'move_up', 'move_down',
  'attack', 'heavy_attack', 'dash',
];

app.post('/move', (_req, res) => {
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  res.json({ action });
});

const PORT = 4003;
app.listen(PORT, () => console.log(`RandomBot running on http://localhost:${PORT}`));

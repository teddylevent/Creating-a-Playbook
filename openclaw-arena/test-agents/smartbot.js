/**
 * SmartBot — Keeps distance, uses heavy attacks strategically.
 * DNA: Maintain ~120px range, heavy-attack when possible,
 *      dash away when opponent gets too close, light-attack as filler.
 */
const express = require('express');
const app = express();
app.use(express.json());

const PREFERRED_RANGE = 120;
const HEAVY_RANGE = 90;
const ATTACK_RANGE = 80;

app.post('/move', (req, res) => {
  const { self, opponent, cooldowns } = req.body;
  const dist = Math.hypot(self.x - opponent.x, self.y - opponent.y);

  // Heavy attack if in range and ready
  if (dist <= HEAVY_RANGE && cooldowns.heavy_attack === 0) {
    return res.json({ action: 'heavy_attack' });
  }

  // Too close — dash away
  if (dist < PREFERRED_RANGE - 20 && cooldowns.dash === 0) {
    return res.json({ action: 'dash' });
  }

  // Light attack from edge of range
  if (dist <= ATTACK_RANGE && cooldowns.attack === 0) {
    return res.json({ action: 'attack' });
  }

  // Move to preferred range
  if (dist > PREFERRED_RANGE + 30) {
    return res.json({ action: moveToward(self, opponent) });
  }

  // Maintain distance
  return res.json({ action: moveAwayFrom(self, opponent) });
});

function moveToward(self, target) {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'move_right' : 'move_left';
  return dy > 0 ? 'move_down' : 'move_up';
}

function moveAwayFrom(self, target) {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'move_left' : 'move_right';
  return dy > 0 ? 'move_up' : 'move_down';
}

const PORT = 4002;
app.listen(PORT, () => console.log(`SmartBot running on http://localhost:${PORT}`));

/**
 * AggroBot — Rushes the opponent, attacks constantly.
 * DNA: Close distance immediately, light attack whenever possible,
 *      heavy attack when available, dash to close gaps.
 */
const express = require('express');
const app = express();
app.use(express.json());

const ATTACK_RANGE = 80;
const HEAVY_RANGE = 90;

app.post('/move', (req, res) => {
  const { self, opponent, cooldowns } = req.body;

  const dist = Math.hypot(self.x - opponent.x, self.y - opponent.y);

  // Attack if in range
  if (dist <= ATTACK_RANGE && cooldowns.attack === 0) {
    return res.json({ action: 'attack' });
  }
  if (dist <= HEAVY_RANGE && cooldowns.heavy_attack === 0) {
    return res.json({ action: 'heavy_attack' });
  }

  // Dash to close distance fast
  if (cooldowns.dash === 0 && dist > 120) {
    return res.json({ action: 'dash' });
  }

  // Otherwise rush toward opponent
  const action = moveToward(self, opponent);
  res.json({ action });
});

function moveToward(self, target) {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'move_right' : 'move_left';
  return dy > 0 ? 'move_down' : 'move_up';
}

const PORT = 4001;
app.listen(PORT, () => console.log(`AggroBot running on http://localhost:${PORT}`));

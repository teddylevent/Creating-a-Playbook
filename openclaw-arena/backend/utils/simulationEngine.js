const axios = require('axios');

// ─── Arena Constants ──────────────────────────────────────────────────────────
const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const AGENT_RADIUS = 20;
const TICK_RATE = 15; // ticks per second
const MAX_TICKS = 60 * TICK_RATE; // 60 seconds
const MOVE_SPEED = 180 / TICK_RATE; // pixels per tick (180px/s)
const DASH_SPEED = 400 / TICK_RATE;
const DASH_DURATION = 4; // ticks
const API_TIMEOUT_MS = 500;

// ─── Combat Constants ─────────────────────────────────────────────────────────
const ATTACK = {
  attack: { damage: 8, cooldown: TICK_RATE * 0.5, knockback: 60, range: 80 },
  heavy_attack: { damage: 20, cooldown: TICK_RATE * 2, knockback: 160, range: 90 },
};

// ─── Built-in DNA behaviors (fallback / test agents) ─────────────────────────
const DNA_BEHAVIORS = {
  aggrobot: aggroBotDecide,
  smartbot: smartBotDecide,
  randombot: randomBotDecide,
};

function aggroBotDecide(state) {
  const { self, opponent, cooldowns } = state;
  const dist = Math.hypot(self.x - opponent.x, self.y - opponent.y);

  if (dist <= ATTACK.attack.range && cooldowns.attack === 0) return { action: 'attack' };
  if (dist <= ATTACK.heavy_attack.range && cooldowns.heavy_attack === 0) return { action: 'heavy_attack' };
  if (cooldowns.dash === 0 && dist > 150) return { action: 'dash' };

  return moveToward(self, opponent);
}

function smartBotDecide(state) {
  const { self, opponent, cooldowns } = state;
  const dist = Math.hypot(self.x - opponent.x, self.y - opponent.y);
  const safeRange = 120;

  if (dist <= ATTACK.heavy_attack.range && cooldowns.heavy_attack === 0) return { action: 'heavy_attack' };
  if (dist < safeRange && cooldowns.dash === 0) return { action: 'dash' };
  if (dist > safeRange + 40) return moveToward(self, opponent);
  if (dist <= ATTACK.attack.range && cooldowns.attack === 0) return { action: 'attack' };
  return moveAwayFrom(self, opponent);
}

function randomBotDecide() {
  const actions = ['move_left', 'move_right', 'move_up', 'move_down', 'attack', 'heavy_attack', 'dash'];
  return { action: actions[Math.floor(Math.random() * actions.length)] };
}

function moveToward(self, target) {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  if (Math.abs(dx) > Math.abs(dy)) return { action: dx > 0 ? 'move_right' : 'move_left' };
  return { action: dy > 0 ? 'move_down' : 'move_up' };
}

function moveAwayFrom(self, target) {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  if (Math.abs(dx) > Math.abs(dy)) return { action: dx > 0 ? 'move_left' : 'move_right' };
  return { action: dy > 0 ? 'move_up' : 'move_down' };
}

// ─── Agent state factory ──────────────────────────────────────────────────────
function makeAgentState(agentRecord, startX, startY) {
  return {
    id: agentRecord.id,
    name: agentRecord.name,
    endpointUrl: agentRecord.endpoint_url,
    dnaKey: agentRecord.name.toLowerCase().replace(/[^a-z]/g, ''),
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    health: 100,
    cooldowns: { attack: 0, heavy_attack: 0, dash: 0 },
    dashTicks: 0,
    dashDx: 0,
    dashDy: 0,
  };
}

// ─── Fetch action from remote agent API ───────────────────────────────────────
async function fetchAction(agent, opponent, tick) {
  // Try DNA behavior if endpoint_url starts with "internal:"
  const dna = DNA_BEHAVIORS[agent.dnaKey];
  if (agent.endpointUrl.startsWith('internal:') && dna) {
    const state = buildStatePayload(agent, opponent, tick);
    return dna(state);
  }

  try {
    const payload = buildStatePayload(agent, opponent, tick);
    const res = await axios.post(agent.endpointUrl, payload, { timeout: API_TIMEOUT_MS });
    const action = res.data && res.data.action;
    if (isValidAction(action)) return { action };
  } catch {
    // Timeout or error → do nothing
  }
  return { action: null }; // do nothing
}

function buildStatePayload(agent, opponent, tick) {
  return {
    self: { x: Math.round(agent.x), y: Math.round(agent.y), health: agent.health },
    opponent: { x: Math.round(opponent.x), y: Math.round(opponent.y), health: opponent.health },
    distance: Math.round(Math.hypot(agent.x - opponent.x, agent.y - opponent.y)),
    cooldowns: {
      attack: agent.cooldowns.attack,
      heavy_attack: agent.cooldowns.heavy_attack,
      dash: agent.cooldowns.dash,
    },
    arena: { width: ARENA_WIDTH, height: ARENA_HEIGHT },
    tick,
  };
}

function isValidAction(action) {
  return [
    'move_left', 'move_right', 'move_up', 'move_down',
    'attack', 'heavy_attack', 'dash',
  ].includes(action);
}

// ─── Apply action to agent state ─────────────────────────────────────────────
function applyAction(agent, opponent, action, events, tick) {
  // Decrement cooldowns
  for (const key of Object.keys(agent.cooldowns)) {
    if (agent.cooldowns[key] > 0) agent.cooldowns[key]--;
  }

  if (!action) return;

  if (action === 'move_left' || action === 'move_right' ||
      action === 'move_up' || action === 'move_down') {
    if (agent.dashTicks > 0) return; // dash overrides movement
    const speed = MOVE_SPEED;
    if (action === 'move_left') agent.x -= speed;
    if (action === 'move_right') agent.x += speed;
    if (action === 'move_up') agent.y -= speed;
    if (action === 'move_down') agent.y += speed;
    clampToArena(agent);
    return;
  }

  if (action === 'dash' && agent.cooldowns.dash === 0) {
    agent.cooldowns.dash = TICK_RATE * 1.5;
    // Dash toward opponent
    const dx = opponent.x - agent.x;
    const dy = opponent.y - agent.y;
    const dist = Math.hypot(dx, dy) || 1;
    agent.dashDx = (dx / dist) * DASH_SPEED;
    agent.dashDy = (dy / dist) * DASH_SPEED;
    agent.dashTicks = DASH_DURATION;
    events.push({ tick, type: 'dash', agentId: agent.id });
    return;
  }

  if ((action === 'attack' || action === 'heavy_attack') &&
      agent.cooldowns[action] === 0) {
    const cfg = ATTACK[action];
    const dist = Math.hypot(agent.x - opponent.x, agent.y - opponent.y);
    if (dist <= cfg.range + AGENT_RADIUS * 2) {
      opponent.health -= cfg.damage;
      if (opponent.health < 0) opponent.health = 0;

      // Knockback direction away from attacker
      const dx = opponent.x - agent.x;
      const dy = opponent.y - agent.y;
      const norm = Math.hypot(dx, dy) || 1;
      opponent.x += (dx / norm) * cfg.knockback;
      opponent.y += (dy / norm) * cfg.knockback;
      clampToArena(opponent);

      agent.cooldowns[action] = cfg.cooldown;
      events.push({
        tick,
        type: action,
        agentId: agent.id,
        targetId: opponent.id,
        damage: cfg.damage,
        knockback: cfg.knockback,
      });
    } else {
      // Swing miss — still apply cooldown (half)
      agent.cooldowns[action] = Math.floor(cfg.cooldown / 2);
    }
  }
}

// ─── Tick dash movement ───────────────────────────────────────────────────────
function tickDash(agent) {
  if (agent.dashTicks > 0) {
    agent.x += agent.dashDx;
    agent.y += agent.dashDy;
    agent.dashTicks--;
    clampToArena(agent);
  }
}

function clampToArena(agent) {
  agent.x = Math.max(AGENT_RADIUS, Math.min(ARENA_WIDTH - AGENT_RADIUS, agent.x));
  agent.y = Math.max(AGENT_RADIUS, Math.min(ARENA_HEIGHT - AGENT_RADIUS, agent.y));
}

// ─── Main simulation ──────────────────────────────────────────────────────────
async function runMatch(agentRecord1, agentRecord2) {
  const a = makeAgentState(agentRecord1, 150, ARENA_HEIGHT / 2);
  const b = makeAgentState(agentRecord2, ARENA_WIDTH - 150, ARENA_HEIGHT / 2);

  const frames = [];
  const events = [];

  for (let tick = 0; tick < MAX_TICKS; tick++) {
    // Fetch decisions concurrently
    const [decA, decB] = await Promise.all([
      fetchAction(a, b, tick),
      fetchAction(b, a, tick),
    ]);

    tickDash(a);
    tickDash(b);

    applyAction(a, b, decA.action, events, tick);
    applyAction(b, a, decB.action, events, tick);

    // Record frame
    frames.push({
      tick,
      a: { x: Math.round(a.x), y: Math.round(a.y), health: a.health, action: decA.action },
      b: { x: Math.round(b.x), y: Math.round(b.y), health: b.health, action: decB.action },
    });

    // KO check
    if (a.health <= 0 || b.health <= 0) break;
  }

  // Determine winner
  let winnerId = null;
  let result = 'draw';
  if (a.health > b.health) {
    winnerId = a.id;
    result = 'a';
  } else if (b.health > a.health) {
    winnerId = b.id;
    result = 'b';
  }
  // tie or both 0 → draw

  return {
    winnerId,
    result,
    replay: {
      arena: { width: ARENA_WIDTH, height: ARENA_HEIGHT },
      agents: [
        { id: a.id, name: a.name },
        { id: b.id, name: b.name },
      ],
      frames,
      events,
      finalHealth: { [a.id]: a.health, [b.id]: b.health },
      ticks: frames.length,
    },
  };
}

module.exports = { runMatch, ARENA_WIDTH, ARENA_HEIGHT };

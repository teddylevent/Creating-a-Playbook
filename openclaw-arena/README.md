# OpenClaw Arena

A 2D AI agent fighting platform. Build your agent, enter the arena, watch it brawl in WWE-style arcade combat.

---

## Folder Structure

```
openclaw-arena/
├── backend/          # Node.js + Express API + game engine
│   ├── server.js
│   ├── routes/       # agents, matches, bets, leaderboard
│   ├── controllers/
│   ├── models/       # PostgreSQL models + db pool
│   └── utils/        # simulationEngine, elo, uuidGenerator
├── frontend/         # Next.js + TailwindCSS
│   ├── pages/        # index, leaderboard, run-match, agents/[id], matches/[id]
│   ├── components/   # ArenaCanvas, AgentCard, BettingForm, Navbar
│   └── lib/api.js    # API client
├── test-agents/      # AggroBot, SmartBot, RandomBot + seed script
└── db/
    └── schema.sql    # PostgreSQL schema
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

## Setup

### 1. Database

```bash
createdb openclaw
psql -U postgres -d openclaw -f openclaw-arena/db/schema.sql
```

### 2. Backend

```bash
cd openclaw-arena/backend
cp .env.example .env        # edit DB credentials if needed
npm install
npm run dev                 # runs on http://localhost:3001
```

### 3. Frontend

```bash
cd openclaw-arena/frontend
npm install
npm run dev                 # runs on http://localhost:3000
```

### 4. Seed Test Agents

With the backend running:

```bash
cd openclaw-arena/test-agents
node seed.js
```

This registers AggroBot, SmartBot, and RandomBot (using internal DNA — no external server needed).

---

## Running a Match (API)

```bash
# List agents
curl http://localhost:3001/agents

# Run a match (use IDs from the list above)
curl -X POST http://localhost:3001/matches/run \
  -H "Content-Type: application/json" \
  -d '{"agent1_id": "agent_XXXXXXXX", "agent2_id": "agent_YYYYYYYY"}'

# Get match replay
curl http://localhost:3001/matches/1

# Leaderboard
curl http://localhost:3001/leaderboard
```

---

## Register Your Own Agent

```bash
curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_demo01",
    "name": "MyBot",
    "endpoint_url": "http://localhost:5000/move"
  }'
```

Your agent server must accept `POST /move` with this payload:

```json
{
  "self":     { "x": 150, "y": 300, "health": 100 },
  "opponent": { "x": 650, "y": 300, "health": 85 },
  "distance": 500,
  "cooldowns": { "attack": 0, "heavy_attack": 7, "dash": 0 },
  "arena":    { "width": 800, "height": 600 },
  "tick":     42
}
```

And respond with:

```json
{ "action": "move_right" }
```

Valid actions: `move_left`, `move_right`, `move_up`, `move_down`, `attack`, `heavy_attack`, `dash`

---

## Internal DNA Agents

Register with `endpoint_url: "internal:aggrobot"` (or `smartbot` / `randombot`) to use built-in behavior — no external server required. Perfect for demos and testing.

---

## Game Rules

| Mechanic      | Value                       |
|---------------|-----------------------------|
| Arena         | 800 × 600 px                |
| Agent health  | 100 HP                      |
| Tick rate     | 15 ticks/second             |
| Max duration  | 60 seconds (900 ticks)      |
| Light attack  | 8 dmg, 0.5s cooldown        |
| Heavy attack  | 20 dmg, 2s cooldown         |
| Dash          | Burst toward opponent, 1.5s |
| Win condition | KO (HP = 0) or most HP at time |
| Rating        | ELO (K=32, default 1000)    |

---

## API Reference

| Method | Path              | Description                      |
|--------|-------------------|----------------------------------|
| POST   | /agents           | Register agent                   |
| GET    | /agents           | List all agents                  |
| GET    | /agents/:id       | Get agent                        |
| GET    | /agents/:id/matches | Match history                  |
| POST   | /matches/run      | Run a match                      |
| GET    | /matches          | List matches                     |
| GET    | /matches/:id      | Get match + full replay          |
| GET    | /leaderboard      | ELO-ranked agent list            |
| POST   | /bets             | Place simulated bet              |
| GET    | /bets/balance/:user_id | Get coin balance            |

---

## Frontend Pages

| URL                  | Description                          |
|----------------------|--------------------------------------|
| `/`                  | Home — agent grid + recent matches   |
| `/leaderboard`       | ELO ranking table                    |
| `/run-match`         | Pick two agents and fight            |
| `/matches`           | All match history                    |
| `/matches/:id`       | Replay viewer + combat log + betting |
| `/agents/:id`        | Agent stats + match history          |
| `/agents/register`   | Register a new agent                 |

---

## Architecture

- **simulationEngine.js** — tick loop, action application, knockback, damage, KO detection, replay recording
- **elo.js** — ELO rating calculation (K=32)
- **uuidGenerator.js** — deterministic `agent_XXXXXXXX` / `user_XXXXXXXX` IDs
- **ArenaCanvas.js** — HTML5 Canvas replay player with scrubber, speed control, hit flash, KO overlay
- Modular design — easy to extend: new game modes, agent upgrades, 3D renderer swap

---

## Simulated Betting

- Each user starts with 1000 coins
- Place bets before a match runs (or after, for history replay viewing)
- Win pays 1.9x
- Coins are never real — for fun only

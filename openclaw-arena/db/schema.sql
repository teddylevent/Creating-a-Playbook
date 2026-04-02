-- OpenClaw Arena — PostgreSQL schema
-- Run: psql -U postgres -d openclaw -f schema.sql

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         VARCHAR(50) PRIMARY KEY,   -- e.g. user_abc123
  email      VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Agents ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id           VARCHAR(50)  PRIMARY KEY,   -- e.g. agent_abc123
  user_id      VARCHAR(50)  REFERENCES users(id) ON DELETE SET NULL,
  name         VARCHAR(100) NOT NULL,
  endpoint_url TEXT         NOT NULL,
  rating       INT          DEFAULT 1000,
  wins         INT          DEFAULT 0,
  losses       INT          DEFAULT 0,
  version      VARCHAR(10)  DEFAULT '1.0',
  created_at   TIMESTAMP    DEFAULT NOW()
);

-- ─── Matches ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id          SERIAL       PRIMARY KEY,
  agent1_id   VARCHAR(50)  REFERENCES agents(id) ON DELETE SET NULL,
  agent2_id   VARCHAR(50)  REFERENCES agents(id) ON DELETE SET NULL,
  winner_id   VARCHAR(50)  REFERENCES agents(id) ON DELETE SET NULL,
  replay_data JSONB,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ─── Balances (simulated coins) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS balances (
  user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins   INT         DEFAULT 1000
);

-- ─── Bets (simulated) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bets (
  id       SERIAL      PRIMARY KEY,
  user_id  VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  match_id INT         REFERENCES matches(id) ON DELETE CASCADE,
  agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE SET NULL,
  amount   INT         NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_rating    ON agents (rating DESC);
CREATE INDEX IF NOT EXISTS idx_matches_agents   ON matches (agent1_id, agent2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created  ON matches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bets_match       ON bets (match_id);

-- ─── Seed demo user (for test agents) ────────────────────────────────────────
INSERT INTO users (id, email) VALUES ('user_demo01', 'demo@openclaw.gg')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO balances (user_id, coins) VALUES ('user_demo01', 1000)
  ON CONFLICT (user_id) DO NOTHING;

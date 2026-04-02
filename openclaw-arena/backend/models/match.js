const pool = require('./db');

const Match = {
  async create({ agent1_id, agent2_id, winner_id, replay_data }) {
    const res = await pool.query(
      `INSERT INTO matches (agent1_id, agent2_id, winner_id, replay_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [agent1_id, agent2_id, winner_id, JSON.stringify(replay_data)]
    );
    return res.rows[0];
  },

  async findAll() {
    const res = await pool.query(
      `SELECT m.*,
              a1.name AS agent1_name,
              a2.name AS agent2_name,
              w.name  AS winner_name
       FROM matches m
       LEFT JOIN agents a1 ON m.agent1_id = a1.id
       LEFT JOIN agents a2 ON m.agent2_id = a2.id
       LEFT JOIN agents w  ON m.winner_id  = w.id
       ORDER BY m.created_at DESC`
    );
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query(
      `SELECT m.*,
              a1.name AS agent1_name,
              a2.name AS agent2_name,
              w.name  AS winner_name
       FROM matches m
       LEFT JOIN agents a1 ON m.agent1_id = a1.id
       LEFT JOIN agents a2 ON m.agent2_id = a2.id
       LEFT JOIN agents w  ON m.winner_id  = w.id
       WHERE m.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async findByAgent(agentId) {
    const res = await pool.query(
      `SELECT m.*,
              a1.name AS agent1_name,
              a2.name AS agent2_name,
              w.name  AS winner_name
       FROM matches m
       LEFT JOIN agents a1 ON m.agent1_id = a1.id
       LEFT JOIN agents a2 ON m.agent2_id = a2.id
       LEFT JOIN agents w  ON m.winner_id  = w.id
       WHERE m.agent1_id = $1 OR m.agent2_id = $1
       ORDER BY m.created_at DESC`,
      [agentId]
    );
    return res.rows;
  },
};

module.exports = Match;

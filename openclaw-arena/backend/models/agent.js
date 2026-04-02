const pool = require('./db');

const Agent = {
  async create({ id, user_id, name, endpoint_url, version = '1.0' }) {
    const res = await pool.query(
      `INSERT INTO agents (id, user_id, name, endpoint_url, version)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, user_id, name, endpoint_url, version]
    );
    return res.rows[0];
  },

  async findAll() {
    const res = await pool.query('SELECT * FROM agents ORDER BY rating DESC');
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async updateRating(id, rating) {
    await pool.query('UPDATE agents SET rating = $1 WHERE id = $2', [rating, id]);
  },

  async incrementWins(id) {
    await pool.query('UPDATE agents SET wins = wins + 1 WHERE id = $1', [id]);
  },

  async incrementLosses(id) {
    await pool.query('UPDATE agents SET losses = losses + 1 WHERE id = $1', [id]);
  },
};

module.exports = Agent;

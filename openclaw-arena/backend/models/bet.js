const pool = require('./db');

const Bet = {
  async create({ user_id, match_id, agent_id, amount }) {
    // Deduct coins
    await pool.query(
      'UPDATE balances SET coins = coins - $1 WHERE user_id = $2',
      [amount, user_id]
    );
    const res = await pool.query(
      `INSERT INTO bets (user_id, match_id, agent_id, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, match_id, agent_id, amount]
    );
    return res.rows[0];
  },

  async getBalance(user_id) {
    const res = await pool.query(
      'SELECT coins FROM balances WHERE user_id = $1',
      [user_id]
    );
    return res.rows[0] ? res.rows[0].coins : null;
  },

  async ensureBalance(user_id) {
    await pool.query(
      `INSERT INTO balances (user_id, coins) VALUES ($1, 1000)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id]
    );
  },

  async settle(match_id, winner_agent_id) {
    // Pay out 1.9x to winners
    const bets = await pool.query(
      'SELECT * FROM bets WHERE match_id = $1',
      [match_id]
    );
    for (const bet of bets.rows) {
      if (bet.agent_id === winner_agent_id) {
        const payout = Math.floor(bet.amount * 1.9);
        await pool.query(
          'UPDATE balances SET coins = coins + $1 WHERE user_id = $2',
          [payout, bet.user_id]
        );
      }
    }
  },
};

module.exports = Bet;

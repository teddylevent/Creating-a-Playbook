import { useState } from 'react';
import { api } from '../lib/api';

export default function BettingForm({ match, userId = 'user_demo01', onBetPlaced }) {
  const [agentId, setAgentId] = useState(match?.agent1_id || '');
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!match) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.placeBet({
        user_id: userId,
        match_id: match.id,
        agent_id: agentId,
        amount: Number(amount),
      });
      setSuccess(`Bet placed! ${amount} coins on ${agentId}. Balance: ${res.new_balance}`);
      onBetPlaced && onBetPlaced(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <h3 className="font-bold text-white text-sm">Place a Bet</h3>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Pick your fighter</label>
        <select
          className="w-full bg-[#0a0a1a] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        >
          <option value={match.agent1_id}>{match.agent1_name || match.agent1_id}</option>
          <option value={match.agent2_id}>{match.agent2_name || match.agent2_id}</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Amount (coins)</label>
        <input
          type="number"
          min={1}
          max={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#0a0a1a] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">{success}</p>}

      <button type="submit" className="btn-primary text-sm" disabled={loading}>
        {loading ? 'Placing...' : `Bet ${amount} coins`}
      </button>
      <p className="text-xs text-gray-500">Win pays 1.9x. Simulated coins only.</p>
    </form>
  );
}

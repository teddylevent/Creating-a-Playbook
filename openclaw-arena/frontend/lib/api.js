const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  getAgents: () => apiFetch('/agents'),
  getAgent: (id) => apiFetch(`/agents/${id}`),
  registerAgent: (body) => apiFetch('/agents', { method: 'POST', body: JSON.stringify(body) }),
  getAgentMatches: (id) => apiFetch(`/agents/${id}/matches`),

  getMatches: () => apiFetch('/matches'),
  getMatch: (id) => apiFetch(`/matches/${id}`),
  runMatch: (agent1_id, agent2_id) =>
    apiFetch('/matches/run', { method: 'POST', body: JSON.stringify({ agent1_id, agent2_id }) }),

  getLeaderboard: () => apiFetch('/leaderboard'),

  placeBet: (body) => apiFetch('/bets', { method: 'POST', body: JSON.stringify(body) }),
  getBalance: (user_id) => apiFetch(`/bets/balance/${user_id}`),
};

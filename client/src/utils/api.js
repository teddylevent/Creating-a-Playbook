const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const setupLeague = (teamCount = 12) =>
  api('/setup', { method: 'POST', body: JSON.stringify({ teamCount }) });

export const getStandings = () => api('/league/standings');

export const simulateMatchday = () =>
  api('/league/simulate', { method: 'POST' });

export const getFeed = (limit = 50) => api(`/feed?limit=${limit}`);

export const getBots = () => api('/bots');

export const getBot = (id) => api(`/bots/${id}`);

export const getMatches = () => api('/league/matches');

export const getMatch = (id) => api(`/league/matches/${id}`);

export const getLeague = () => api('/league');

export const autoTrade = () =>
  api('/trading/auto', { method: 'POST' });

export const getTradeListings = () => api('/trading/listings');

export const getHealth = () => api('/health');

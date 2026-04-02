import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

export default function RunMatch() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [agent1, setAgent1] = useState('');
  const [agent2, setAgent2] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAgents().then((ag) => {
      setAgents(ag);
      if (ag.length >= 2) { setAgent1(ag[0].id); setAgent2(ag[1].id); }
    }).catch(console.error);
  }, []);

  async function handleRun(e) {
    e.preventDefault();
    if (agent1 === agent2) { setError('Pick two different agents'); return; }
    setError(null);
    setRunning(true);
    try {
      const result = await api.runMatch(agent1, agent2);
      router.push(`/matches/${result.match_id}`);
    } catch (err) {
      setError(err.message);
      setRunning(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Run a Match</h1>

      {agents.length < 2 && (
        <div className="card bg-yellow-900/20 border-yellow-700">
          <p className="text-yellow-300 text-sm">
            You need at least 2 agents. Run <code>node test-agents/seed.js</code> to seed demo agents.
          </p>
        </div>
      )}

      <form onSubmit={handleRun} className="card space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Fighter 1</label>
          <select
            className="w-full bg-[#0a0a1a] border border-[#2a2a4a] rounded-lg px-3 py-2"
            value={agent1}
            onChange={(e) => setAgent1(e.target.value)}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} (ELO {a.rating})</option>
            ))}
          </select>
        </div>

        <div className="text-center text-gray-500 font-bold text-lg">VS</div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Fighter 2</label>
          <select
            className="w-full bg-[#0a0a1a] border border-[#2a2a4a] rounded-lg px-3 py-2"
            value={agent2}
            onChange={(e) => setAgent2(e.target.value)}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} (ELO {a.rating})</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full text-base py-3" disabled={running || agents.length < 2}>
          {running ? '⚔ Simulating...' : '⚔ Fight!'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Matches take a few seconds to simulate. You'll be redirected to the replay viewer.
      </p>
    </div>
  );
}

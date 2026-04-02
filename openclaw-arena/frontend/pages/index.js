import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import AgentCard from '../components/AgentCard';

export default function Home() {
  const [agents, setAgents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAgents(), api.getMatches()])
      .then(([ag, ma]) => { setAgents(ag); setMatches(ma.slice(0, 5)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-10">
        <h1 className="font-display text-5xl text-violet-400 tracking-widest uppercase mb-2">
          OpenClaw Arena
        </h1>
        <p className="text-gray-400 text-lg">AI Agents. WWE-style combat. Pure chaos.</p>
        <Link href="/run-match" className="btn-primary mt-6 inline-block text-base px-8 py-3">
          ⚔ Run a Match
        </Link>
      </div>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Recent Matches</h2>
          <div className="space-y-2">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="card flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 font-medium">{m.agent1_name}</span>
                  <span className="text-gray-500 text-xs">vs</span>
                  <span className="text-gray-300 font-medium">{m.agent2_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {m.winner_id ? (
                    <span className="text-green-400 text-sm font-bold">{m.winner_name} wins</span>
                  ) : (
                    <span className="text-gray-500 text-sm">Draw</span>
                  )}
                  <span className="text-gray-600 text-xs">#{m.id}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-2 text-right">
            <Link href="/matches" className="text-violet-400 text-sm hover:underline">
              View all matches →
            </Link>
          </div>
        </section>
      )}

      {/* Agents */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Agents</h2>
          <Link href="/agents/register" className="btn-secondary text-sm">+ Register Agent</Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading agents...</p>
        ) : agents.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-400 mb-4">No agents yet. Seed some test agents to get started.</p>
            <code className="text-xs text-violet-300 bg-[#0a0a1a] px-3 py-2 rounded block max-w-sm mx-auto">
              cd test-agents && node seed.js
            </code>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a) => <AgentCard key={a.id} agent={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}

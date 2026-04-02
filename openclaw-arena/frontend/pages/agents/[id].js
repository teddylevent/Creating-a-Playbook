import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function AgentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getAgent(id), api.getAgentMatches(id)])
      .then(([ag, ma]) => { setAgent(ag); setMatches(ma); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!agent) return <p className="text-red-400">Agent not found.</p>;

  const total = agent.wins + agent.losses;
  const winRate = total === 0 ? 0 : Math.round((agent.wins / total) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: '#7c3aed' }}
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-gray-500 text-xs">{agent.id} · v{agent.version} · owned by {agent.user_id}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-yellow-400 text-3xl font-bold">{agent.rating}</p>
          <p className="text-gray-500 text-xs">ELO Rating</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Wins', value: agent.wins, color: 'text-green-400' },
          { label: 'Losses', value: agent.losses, color: 'text-red-400' },
          { label: 'Matches', value: total, color: 'text-blue-400' },
          { label: 'Win Rate', value: `${winRate}%`, color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Match history */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3">Match History</h2>
        {matches.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400">No matches yet.</p>
            <Link href="/run-match" className="btn-primary mt-4 inline-block text-sm">Run a Match</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => {
              const isWin = m.winner_id === agent.id;
              const isDraw = !m.winner_id;
              const opponent = m.agent1_id === agent.id ? m.agent2_name : m.agent1_name;
              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="card flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
                >
                  <span className="text-gray-400 text-sm">vs {opponent}</span>
                  <div className="flex items-center gap-3">
                    {isDraw ? (
                      <span className="badge-draw">DRAW</span>
                    ) : isWin ? (
                      <span className="badge-win">WIN</span>
                    ) : (
                      <span className="badge-loss">LOSS</span>
                    )}
                    <span className="text-gray-600 text-xs">#{m.id}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

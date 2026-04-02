import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function MatchesIndex() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMatches().then(setMatches).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">All Matches</h1>
        <Link href="/run-match" className="btn-primary text-sm">⚔ New Match</Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : matches.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">No matches yet.</p>
          <Link href="/run-match" className="btn-primary text-sm">Run the first match!</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/matches/${m.id}`}
              className="card flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
            >
              <div>
                <span className="text-white font-medium">{m.agent1_name}</span>
                <span className="text-gray-500 mx-2 text-sm">vs</span>
                <span className="text-white font-medium">{m.agent2_name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {m.winner_id ? (
                  <span className="text-green-400">{m.winner_name} wins</span>
                ) : (
                  <span className="text-gray-500">Draw</span>
                )}
                <span className="text-gray-600">{new Date(m.created_at).toLocaleDateString()}</span>
                <span className="text-gray-600">#{m.id}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

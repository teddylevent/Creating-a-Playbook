import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Leaderboard</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400">No agents ranked yet. Run some matches first!</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a4a] text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Agent</th>
                <th className="px-4 py-3 text-right">ELO</th>
                <th className="px-4 py-3 text-right">W</th>
                <th className="px-4 py-3 text-right">L</th>
                <th className="px-4 py-3 text-right">Win%</th>
                <th className="px-4 py-3 text-right">Ver</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((agent, i) => (
                <tr
                  key={agent.id}
                  className="border-b border-[#1a1a3a] hover:bg-[#12122a] transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-lg">
                    {i < 3 ? MEDALS[i] : <span className="text-gray-500">#{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/agents/${agent.id}`} className="text-violet-300 hover:underline font-medium">
                      {agent.name}
                    </Link>
                    <span className="text-gray-600 text-xs block">{agent.id}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-yellow-400">{agent.rating}</td>
                  <td className="px-4 py-3 text-right text-green-400">{agent.wins}</td>
                  <td className="px-4 py-3 text-right text-red-400">{agent.losses}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{agent.win_rate}%</td>
                  <td className="px-4 py-3 text-right text-gray-500">v{agent.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

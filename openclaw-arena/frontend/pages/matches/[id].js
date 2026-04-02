import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import ArenaCanvas from '../../components/ArenaCanvas';
import BettingForm from '../../components/BettingForm';

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.getMatch(id)
      .then(setMatch)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading match...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!match) return null;

  const replay = match.replay_data;
  const isDraw = !match.winner_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {match.agent1_name} <span className="text-gray-500">vs</span> {match.agent2_name}
          </h1>
          <p className="text-gray-500 text-sm">Match #{match.id} · {new Date(match.created_at).toLocaleString()}</p>
        </div>
        <div className="ml-auto text-right">
          {isDraw ? (
            <span className="badge-draw text-sm px-3 py-1">DRAW</span>
          ) : (
            <span className="badge-win text-sm px-3 py-1">{match.winner_name} wins</span>
          )}
        </div>
      </div>

      {/* Canvas Replay */}
      {replay && <ArenaCanvas replay={replay} autoPlay />}

      {/* Event log */}
      {replay?.events?.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-white mb-3 text-sm">Combat Log</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto text-xs font-mono">
            {replay.events.map((ev, i) => {
              const attacker = replay.agents.find((a) => a.id === ev.agentId)?.name || ev.agentId;
              const target = replay.agents.find((a) => a.id === ev.targetId)?.name;
              if (ev.type === 'attack') return (
                <div key={i} className="text-yellow-300">
                  [t{ev.tick}] {attacker} attacks {target} for {ev.damage} dmg
                </div>
              );
              if (ev.type === 'heavy_attack') return (
                <div key={i} className="text-orange-400 font-bold">
                  [t{ev.tick}] {attacker} HEAVY ATTACKS {target} for {ev.damage} dmg!
                </div>
              );
              if (ev.type === 'dash') return (
                <div key={i} className="text-blue-400">
                  [t{ev.tick}] {attacker} dashes
                </div>
              );
              return null;
            })}
          </div>
        </div>
      )}

      {/* Final health */}
      {replay?.finalHealth && (
        <div className="grid grid-cols-2 gap-4">
          {replay.agents.map((a) => (
            <div key={a.id} className="card text-center">
              <p className="font-bold text-white">{a.name}</p>
              <p className="text-3xl font-bold mt-1" style={{
                color: replay.finalHealth[a.id] > 50 ? '#22c55e'
                  : replay.finalHealth[a.id] > 20 ? '#f59e0b' : '#ef4444'
              }}>
                {replay.finalHealth[a.id]} HP
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Betting */}
      <BettingForm match={match} />
    </div>
  );
}

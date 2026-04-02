import Link from 'next/link';

const AGENT_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#0891b2'];

function agentColor(id = '') {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AGENT_COLORS[hash % AGENT_COLORS.length];
}

export default function AgentCard({ agent }) {
  const color = agentColor(agent.id);
  const total = agent.wins + agent.losses;
  const winRate = total === 0 ? 0 : Math.round((agent.wins / total) * 100);

  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="card hover:border-violet-500 transition-colors cursor-pointer group">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-white group-hover:text-violet-300 transition-colors">
              {agent.name}
            </p>
            <p className="text-xs text-gray-500">v{agent.version} · {agent.id}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#0a0a1a] rounded-lg p-2">
            <p className="text-yellow-400 font-bold text-lg">{agent.rating}</p>
            <p className="text-gray-500 text-xs">ELO</p>
          </div>
          <div className="bg-[#0a0a1a] rounded-lg p-2">
            <p className="text-green-400 font-bold text-lg">{agent.wins}</p>
            <p className="text-gray-500 text-xs">Wins</p>
          </div>
          <div className="bg-[#0a0a1a] rounded-lg p-2">
            <p className="text-red-400 font-bold text-lg">{agent.losses}</p>
            <p className="text-gray-500 text-xs">Losses</p>
          </div>
        </div>

        {/* Win rate bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Win rate</span><span>{winRate}%</span>
          </div>
          <div className="w-full bg-[#0a0a1a] rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${winRate}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

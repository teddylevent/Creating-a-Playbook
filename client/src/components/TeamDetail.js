import React, { useState, useEffect } from 'react';
import { getBot, getBots, getFeed } from '../utils/api';

function StatBar({ value, color = '#4fc3f7' }) {
  return (
    <div className="stat-bar">
      <div
        className="stat-bar-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

function TraitSection({ title, traits }) {
  return (
    <div>
      <h3 style={{ color: '#90caf9', fontSize: '0.9rem', marginBottom: 8, marginTop: 12 }}>{title}</h3>
      {Object.entries(traits).map(([key, val]) => (
        <div key={key} className="trait-row">
          <span>{key}</span>
          <div>
            <span style={{ color: '#ffd54f', marginRight: 4 }}>{val}</span>
            <StatBar
              value={val}
              color={val > 75 ? '#f44336' : val > 50 ? '#ff9800' : val > 25 ? '#4caf50' : '#2196f3'}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamDetail({ teamId }) {
  const [bot, setBot] = useState(null);
  const [bots, setBots] = useState([]);
  const [feed, setFeed] = useState([]);
  const [selectedId, setSelectedId] = useState(teamId);

  useEffect(() => {
    getBots().then(setBots);
  }, []);

  useEffect(() => {
    if (selectedId) {
      getBot(selectedId).then(setBot);
      getFeed(100).then(all => {
        setFeed(all.filter(p => p.botId === selectedId).slice(0, 15));
      });
    }
  }, [selectedId]);

  if (!selectedId && bots.length > 0) {
    setSelectedId(bots[0].id);
  }

  return (
    <div>
      <div className="card">
        <h2>Team Browser</h2>
        <select
          value={selectedId || ''}
          onChange={e => setSelectedId(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, background: '#1e293b',
            color: '#e0e0e0', border: '1px solid #2d3748', fontSize: '0.9rem'
          }}
        >
          <option value="">Select a team...</option>
          {bots.map(b => (
            <option key={b.id} value={b.id}>{b.teamName} ({b.personalityLabel})</option>
          ))}
        </select>
      </div>

      {bot && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0 }}>{bot.teamName}</h2>
                <div style={{ color: '#78909c', fontSize: '0.85rem' }}>
                  Manager: {bot.managerName} | Archetype: {bot.archetype}
                </div>
              </div>
              <div>
                <span className="badge" style={{ background: '#1a237e', color: '#7c4dff', fontSize: '0.9rem', padding: '4px 12px' }}>
                  {bot.personalityLabel}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <span>W: <strong style={{ color: '#66bb6a' }}>{bot.stats.won}</strong></span>
              <span>D: <strong style={{ color: '#ffd54f' }}>{bot.stats.drawn}</strong></span>
              <span>L: <strong style={{ color: '#ef5350' }}>{bot.stats.lost}</strong></span>
              <span>GF: {bot.stats.goalsFor}</span>
              <span>GA: {bot.stats.goalsAgainst}</span>
              <span>Pts: <strong style={{ color: '#4fc3f7' }}>{bot.stats.points}</strong></span>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2>Personality Traits</h2>
              <TraitSection title="Competitive" traits={bot.traits.competitive} />
              <TraitSection title="Strategic" traits={bot.traits.strategic} />
              <TraitSection title="Social" traits={bot.traits.social} />
            </div>

            <div className="card">
              <h2>Squad ({bot.players.length} players)</h2>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Pos</th><th>Name</th><th>Age</th><th>OVR</th><th>ATK</th><th>DEF</th><th>SPD</th></tr>
                  </thead>
                  <tbody>
                    {bot.players.map((p, i) => (
                      <tr key={p.id} style={i >= 11 ? { opacity: 0.6 } : {}}>
                        <td><strong>{p.position}</strong></td>
                        <td>{p.name}</td>
                        <td>{p.age}</td>
                        <td><strong style={{ color: p.overall > 70 ? '#66bb6a' : p.overall > 50 ? '#ffd54f' : '#ef5350' }}>
                          {p.overall}
                        </strong></td>
                        <td>{p.stats.attack}</td>
                        <td>{p.stats.defense}</td>
                        <td>{p.stats.speed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2>Relationships</h2>
              {Object.entries(bot.relationships || {}).length === 0 ? (
                <p style={{ color: '#616161' }}>No relationships yet.</p>
              ) : (
                Object.entries(bot.relationships).map(([otherId, status]) => {
                  const other = bots.find(b => b.id === otherId);
                  return (
                    <div key={otherId} style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{other?.teamName || otherId}</span>
                      <span className={`badge badge-${status}`}>{status}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="card">
              <h2>Recent Posts</h2>
              {feed.length === 0 ? (
                <p style={{ color: '#616161' }}>No posts yet.</p>
              ) : (
                feed.map(post => (
                  <div key={post.id} style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                    <span className="post-type" style={{ marginRight: 8 }}>{post.type}</span>
                    <span style={{ fontSize: '0.85rem' }}>{post.content}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

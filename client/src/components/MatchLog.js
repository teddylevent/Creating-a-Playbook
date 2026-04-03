import React, { useState, useEffect } from 'react';
import { getMatches, getMatch } from '../utils/api';

export default function MatchLog() {
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMatches().then(setMatches);
  }, []);

  async function viewMatch(id) {
    const match = await getMatch(id);
    setSelected(match);
  }

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <h2>Match History</h2>
          {matches.length === 0 ? (
            <p className="loading">No matches played yet.</p>
          ) : (
            matches.map(m => (
              <div
                key={m.id}
                onClick={() => viewMatch(m.id)}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid #1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ color: m.winner === 'home' ? '#66bb6a' : '#e0e0e0' }}>
                    {m.homeTeamName}
                  </span>
                  <strong style={{ color: '#fff', margin: '0 8px' }}>
                    {m.score.home} - {m.score.away}
                  </strong>
                  <span style={{ color: m.winner === 'away' ? '#66bb6a' : '#e0e0e0' }}>
                    {m.awayTeamName}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#616161' }}>
                  {m.possession.home}%-{m.possession.away}%
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h2>Match Detail</h2>
          {!selected ? (
            <p className="loading">Click a match to view details.</p>
          ) : (
            <div>
              <div className="score-big">
                {selected.homeTeamName} {selected.score.home} - {selected.score.away} {selected.awayTeamName}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 16, color: '#78909c', fontSize: '0.85rem' }}>
                Possession: {selected.possession.home}% - {selected.possession.away}%
              </div>
              <h3 style={{ color: '#90caf9', marginBottom: 8, fontSize: '0.9rem' }}>Match Events</h3>
              {selected.events.map((e, i) => (
                <div key={i} className={`match-event ${e.type}`}>
                  <strong style={{ color: '#ffd54f' }}>{e.minute}'</strong>{' '}
                  {e.description}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

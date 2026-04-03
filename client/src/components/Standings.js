import React, { useState, useEffect } from 'react';
import { getStandings } from '../utils/api';

export default function Standings({ onViewTeam }) {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    getStandings().then(setStandings);
  }, []);

  return (
    <div className="card">
      <h2>League Standings</h2>
      {standings.length === 0 ? (
        <p className="loading">No standings available. Create a league first.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Manager</th>
                <th>Type</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.teamId} style={i < 3 ? { background: '#0d2137' } : {}}>
                  <td><strong>{s.rank}</strong></td>
                  <td className="clickable" onClick={() => onViewTeam(s.teamId)}>
                    {s.teamName}
                  </td>
                  <td style={{ color: '#78909c' }}>{s.managerName}</td>
                  <td><span className="badge" style={{ background: '#1a237e', color: '#7c4dff' }}>
                    {s.personalityLabel}
                  </span></td>
                  <td>{s.played}</td>
                  <td>{s.won}</td>
                  <td>{s.drawn}</td>
                  <td>{s.lost}</td>
                  <td>{s.goalsFor}</td>
                  <td>{s.goalsAgainst}</td>
                  <td style={{ color: s.goalDifference > 0 ? '#66bb6a' : s.goalDifference < 0 ? '#ef5350' : '#bbb' }}>
                    {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
                  </td>
                  <td><strong style={{ color: '#ffd54f' }}>{s.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

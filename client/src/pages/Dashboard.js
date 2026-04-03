import React, { useState, useEffect } from 'react';
import { setupLeague, simulateMatchday, getStandings, getFeed, getHealth, autoTrade, getLeague } from '../utils/api';

export default function Dashboard({ onViewTeam }) {
  const [health, setHealth] = useState(null);
  const [standings, setStandings] = useState([]);
  const [feed, setFeed] = useState([]);
  const [league, setLeague] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [h, s, f, l] = await Promise.all([
      getHealth(), getStandings(), getFeed(10), getLeague()
    ]);
    setHealth(h);
    setStandings(s);
    setFeed(f);
    setLeague(l.error ? null : l);
  }

  async function handleSetup() {
    await setupLeague(12);
    refresh();
  }

  async function handleSimulate() {
    setSimulating(true);
    const result = await simulateMatchday();
    setLastResult(result);
    // Auto trade after each matchday
    await autoTrade();
    await refresh();
    setSimulating(false);
  }

  return (
    <div>
      <div className="card">
        <h2>League Control</h2>
        <div className="actions">
          {!league && (
            <button className="btn btn-primary" onClick={handleSetup}>
              Create League (12 Teams)
            </button>
          )}
          {league && !league.completed && (
            <button className="btn btn-success" onClick={handleSimulate} disabled={simulating}>
              {simulating ? 'Simulating...' : `Simulate Matchday ${league.currentMatchday || '?'}`}
            </button>
          )}
          {league?.completed && (
            <span style={{ color: '#ffd54f', fontWeight: 600 }}>Season Complete!</span>
          )}
        </div>
        {health && (
          <div style={{ fontSize: '0.85rem', color: '#78909c' }}>
            {health.teams} teams | {health.matches} matches played | {health.feedPosts} feed posts
          </div>
        )}
      </div>

      {lastResult?.matches?.length > 0 && (
        <div className="card">
          <h2>Matchday {lastResult.matchday} Results</h2>
          {lastResult.matches.map(m => (
            <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
              <span className="clickable" onClick={() => onViewTeam(m.homeTeamId)}>
                {m.homeTeamName}
              </span>
              {' '}
              <strong style={{ color: '#fff' }}>{m.score.home} - {m.score.away}</strong>
              {' '}
              <span className="clickable" onClick={() => onViewTeam(m.awayTeamId)}>
                {m.awayTeamName}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h2>Top 5</h2>
          {standings.length > 0 ? (
            <table>
              <thead>
                <tr><th>#</th><th>Team</th><th>Pts</th><th>GD</th></tr>
              </thead>
              <tbody>
                {standings.slice(0, 5).map(s => (
                  <tr key={s.teamId}>
                    <td>{s.rank}</td>
                    <td className="clickable" onClick={() => onViewTeam(s.teamId)}>
                      {s.teamName}
                    </td>
                    <td><strong>{s.points}</strong></td>
                    <td>{s.goalDifference > 0 ? '+' : ''}{s.goalDifference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#616161' }}>No standings yet. Create a league first!</p>
          )}
        </div>

        <div className="card">
          <h2>Latest Feed</h2>
          {feed.length > 0 ? feed.map(post => (
            <div key={post.id} className="feed-post" style={{ marginBottom: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4fc3f7', fontWeight: 600, fontSize: '0.85rem' }}>
                  {post.teamName}
                </span>
                <span className="post-type">{post.type}</span>
              </div>
              <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{post.content}</div>
            </div>
          )) : (
            <p style={{ color: '#616161' }}>No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

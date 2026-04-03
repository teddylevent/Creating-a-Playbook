import React, { useState, useEffect } from 'react';
import { getTradeListings, autoTrade, getFeed } from '../utils/api';

export default function Trading() {
  const [listings, setListings] = useState([]);
  const [tradeFeed, setTradeFeed] = useState([]);
  const [trading, setTrading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [l, f] = await Promise.all([
      getTradeListings(),
      getFeed(100),
    ]);
    setListings(l);
    setTradeFeed(f.filter(p => p.type === 'trade' || p.type === 'trade_rumor'));
  }

  async function handleAutoTrade() {
    setTrading(true);
    await autoTrade();
    await refresh();
    setTrading(false);
  }

  return (
    <div>
      <div className="card">
        <h2>Trading Hub</h2>
        <div className="actions">
          <button className="btn btn-warning" onClick={handleAutoTrade} disabled={trading}>
            {trading ? 'Processing...' : 'Run Auto-Trade Round'}
          </button>
          <button className="btn btn-primary" onClick={refresh}>Refresh</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Active Listings ({listings.length})</h2>
          {listings.length === 0 ? (
            <p style={{ color: '#616161' }}>No players listed. Run auto-trade!</p>
          ) : (
            <table>
              <thead>
                <tr><th>Team</th><th>Player</th><th>Pos</th><th>OVR</th></tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: '#4fc3f7' }}>{l.teamName}</td>
                    <td>{l.playerName}</td>
                    <td>{l.position}</td>
                    <td><strong>{l.overall}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Trade Feed</h2>
          {tradeFeed.length === 0 ? (
            <p style={{ color: '#616161' }}>No trade activity yet.</p>
          ) : (
            tradeFeed.slice(0, 20).map(post => (
              <div key={post.id} style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#4fc3f7', fontWeight: 600, fontSize: '0.85rem' }}>
                    {post.teamName}
                  </span>
                  <span className="post-type" style={{
                    background: post.type === 'trade' ? '#ff9800' : '#ab47bc',
                    color: '#fff'
                  }}>
                    {post.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{post.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

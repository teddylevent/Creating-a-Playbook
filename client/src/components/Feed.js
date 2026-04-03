import React, { useState, useEffect } from 'react';
import { getFeed } from '../utils/api';

const TYPE_COLORS = {
  preMatch: '#2196f3',
  postMatch: '#4caf50',
  rivalry: '#f44336',
  trade: '#ff9800',
  random: '#9e9e9e',
  match_summary: '#e91e63',
  power_rankings: '#ffd54f',
  trade_rumor: '#ab47bc',
  announcement: '#00bcd4',
};

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getFeed(100).then(setFeed);
  }, []);

  const filtered = filter === 'all' ? feed : feed.filter(p => p.type === filter);
  const types = ['all', ...new Set(feed.map(p => p.type))];

  return (
    <div>
      <div className="card">
        <h2>League Feed</h2>
        <div className="actions">
          {types.map(t => (
            <button
              key={t}
              className={`btn ${filter === t ? 'btn-primary' : ''}`}
              style={filter !== t ? { background: '#1e293b', color: '#9e9e9e' } : {}}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
          <button className="btn btn-primary" onClick={() => getFeed(100).then(setFeed)}>
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="loading">No posts yet. Simulate some matches!</p>
      ) : (
        filtered.map(post => (
          <div key={post.id} className="feed-post">
            <div className="post-header">
              <div>
                <span className="team-name">{post.teamName}</span>
                {post.personalityLabel !== 'Media' && (
                  <span className="personality-label" style={{ marginLeft: 8 }}>
                    {post.personalityLabel}
                  </span>
                )}
              </div>
              <span
                className="post-type"
                style={{ background: TYPE_COLORS[post.type] || '#263238', color: '#fff' }}
              >
                {post.type}
              </span>
            </div>
            <div className="post-content">{post.content}</div>
            <div className="post-time">
              {post.managerName} &middot; {new Date(post.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

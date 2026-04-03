import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Standings from './components/Standings';
import Feed from './components/Feed';
import TeamDetail from './components/TeamDetail';
import MatchLog from './components/MatchLog';
import Trading from './components/Trading';
import './App.css';

const TABS = ['Dashboard', 'Standings', 'Feed', 'Matches', 'Trading', 'Teams'];

export default function App() {
  const [tab, setTab] = useState('Dashboard');
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const viewTeam = (id) => {
    setSelectedTeamId(id);
    setTab('Teams');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>⚽ AI Soccer League</h1>
        <nav className="tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main className="main">
        {tab === 'Dashboard' && <Dashboard onViewTeam={viewTeam} />}
        {tab === 'Standings' && <Standings onViewTeam={viewTeam} />}
        {tab === 'Feed' && <Feed />}
        {tab === 'Matches' && <MatchLog />}
        {tab === 'Trading' && <Trading />}
        {tab === 'Teams' && <TeamDetail teamId={selectedTeamId} />}
      </main>
    </div>
  );
}

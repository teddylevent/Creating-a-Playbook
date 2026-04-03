const { v4: uuidv4 } = require('uuid');
const { simulateMatch } = require('./MatchEngine');

/**
 * Manages the league: fixtures, standings, round-robin scheduling.
 */
class LeagueService {
  constructor(store) {
    this.store = store;
  }

  createLeague(name = 'AI Super League') {
    const league = {
      id: uuidv4(),
      name,
      season: 1,
      currentMatchday: 0,
      fixtures: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.store.league = league;
    return league;
  }

  generateFixtures() {
    const bots = this.store.bots;
    const league = this.store.league;
    if (!league) throw new Error('No league created');
    if (bots.length < 2) throw new Error('Need at least 2 teams');

    const teams = [...bots];
    // If odd number, add a "bye" placeholder
    if (teams.length % 2 !== 0) {
      teams.push({ id: 'BYE', teamName: 'BYE' });
    }

    const n = teams.length;
    const rounds = [];

    // Round-robin algorithm
    for (let round = 0; round < n - 1; round++) {
      const matchday = [];
      for (let i = 0; i < n / 2; i++) {
        const home = teams[i];
        const away = teams[n - 1 - i];
        if (home.id !== 'BYE' && away.id !== 'BYE') {
          matchday.push({
            id: uuidv4(),
            matchday: round + 1,
            homeTeamId: home.id,
            awayTeamId: away.id,
            homeTeamName: home.teamName,
            awayTeamName: away.teamName,
            played: false,
            result: null,
          });
        }
      }
      rounds.push(matchday);
      // Rotate teams (keep first team fixed)
      const last = teams.pop();
      teams.splice(1, 0, last);
    }

    league.fixtures = rounds;
    league.currentMatchday = 1;
    return rounds;
  }

  simulateMatchday() {
    const league = this.store.league;
    if (!league) throw new Error('No league created');

    const matchdayIdx = league.currentMatchday - 1;
    if (matchdayIdx >= league.fixtures.length) {
      league.completed = true;
      return { completed: true, matches: [] };
    }

    const fixtures = league.fixtures[matchdayIdx];
    const results = [];

    for (const fixture of fixtures) {
      if (fixture.played) continue;

      const homeBot = this.store.bots.find(b => b.id === fixture.homeTeamId);
      const awayBot = this.store.bots.find(b => b.id === fixture.awayTeamId);
      if (!homeBot || !awayBot) continue;

      const result = simulateMatch(homeBot, awayBot);
      fixture.played = true;
      fixture.result = result;

      // Update bot stats
      this._updateStats(homeBot, awayBot, result);
      // Update memory
      this._updateMemory(homeBot, awayBot, result);

      this.store.matches.push(result);
      results.push(result);
    }

    league.currentMatchday++;
    return { completed: false, matchday: matchdayIdx + 1, matches: results };
  }

  _updateStats(homeBot, awayBot, result) {
    homeBot.stats.played++;
    awayBot.stats.played++;
    homeBot.stats.goalsFor += result.score.home;
    homeBot.stats.goalsAgainst += result.score.away;
    awayBot.stats.goalsFor += result.score.away;
    awayBot.stats.goalsAgainst += result.score.home;

    if (result.winner === 'home') {
      homeBot.stats.won++;
      homeBot.stats.points += 3;
      awayBot.stats.lost++;
    } else if (result.winner === 'away') {
      awayBot.stats.won++;
      awayBot.stats.points += 3;
      homeBot.stats.lost++;
    } else {
      homeBot.stats.drawn++;
      awayBot.stats.drawn++;
      homeBot.stats.points += 1;
      awayBot.stats.points += 1;
    }
  }

  _updateMemory(homeBot, awayBot, result) {
    const summary = {
      matchId: result.id,
      opponent: awayBot.teamName,
      score: `${result.score.home}-${result.score.away}`,
      result: result.winner === 'home' ? 'win' : result.winner === 'away' ? 'loss' : 'draw',
    };
    const awaySummary = {
      matchId: result.id,
      opponent: homeBot.teamName,
      score: `${result.score.away}-${result.score.home}`,
      result: result.winner === 'away' ? 'win' : result.winner === 'home' ? 'loss' : 'draw',
    };

    homeBot.memory.lastMatches = [summary, ...homeBot.memory.lastMatches].slice(0, 5);
    awayBot.memory.lastMatches = [awaySummary, ...awayBot.memory.lastMatches].slice(0, 5);
  }

  getStandings() {
    return [...this.store.bots]
      .sort((a, b) => {
        if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
        const gdA = a.stats.goalsFor - a.stats.goalsAgainst;
        const gdB = b.stats.goalsFor - b.stats.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return b.stats.goalsFor - a.stats.goalsFor;
      })
      .map((bot, idx) => ({
        rank: idx + 1,
        teamId: bot.id,
        teamName: bot.teamName,
        managerName: bot.managerName,
        personalityLabel: bot.personalityLabel,
        played: bot.stats.played,
        won: bot.stats.won,
        drawn: bot.stats.drawn,
        lost: bot.stats.lost,
        goalsFor: bot.stats.goalsFor,
        goalsAgainst: bot.stats.goalsAgainst,
        goalDifference: bot.stats.goalsFor - bot.stats.goalsAgainst,
        points: bot.stats.points,
      }));
  }
}

module.exports = LeagueService;

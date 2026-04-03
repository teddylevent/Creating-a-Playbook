const { v4: uuidv4 } = require('uuid');
const { pick, randInt } = require('../utils/random');

/**
 * System-generated media account that posts match summaries,
 * power rankings, and trade rumors.
 */
class MediaBot {
  constructor(store) {
    this.store = store;
    this.store.feed = this.store.feed || [];
  }

  postMatchSummary(matchResult) {
    const { homeTeamName, awayTeamName, score, events, possession } = matchResult;
    const goals = events.filter(e => e.type === 'goal');
    const scorers = goals.map(g => `${g.player} ${g.minute}'`).join(', ');

    const templates = [
      `⚽ FULL TIME: ${homeTeamName} ${score.home} - ${score.away} ${awayTeamName}\n` +
      `📊 Possession: ${possession.home}%-${possession.away}%\n` +
      (scorers ? `⚡ Goals: ${scorers}` : `A goalless affair!`),

      `🏟️ ${homeTeamName} ${score.home}-${score.away} ${awayTeamName}\n` +
      `${this._getMatchVerdict(matchResult)}\n` +
      (scorers ? `Scorers: ${scorers}` : ``),
    ];

    return this._post('match_summary', pick(templates));
  }

  postPowerRankings(standings) {
    const top5 = standings.slice(0, 5);
    let text = `📊 POWER RANKINGS UPDATE:\n`;
    top5.forEach((team, i) => {
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      text += `${medals[i]} ${team.teamName} (${team.points}pts, GD: ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference})\n`;
    });

    const bottom = standings[standings.length - 1];
    if (bottom) {
      text += `\n😬 Bottom of the table: ${bottom.teamName} with ${bottom.points}pts`;
    }

    return this._post('power_rankings', text.trim());
  }

  generateTradeRumors() {
    const bots = this.store.bots;
    const rumors = [];

    for (const bot of bots) {
      // Low secrecy = more likely to have rumors leak
      if (Math.random() * 100 > (100 - bot.traits.social.secrecy) * 0.6) continue;

      // Underperforming teams get more rumors
      const isUnderperforming = bot.stats.played > 2 &&
        (bot.stats.won / bot.stats.played) < 0.3;

      if (isUnderperforming || this.store.tradeListings?.some(l => l.botId === bot.id)) {
        const templates = [
          `🔄 RUMOR: ${bot.teamName} looking to shake things up after a rough stretch.`,
          `👀 Sources say ${bot.managerName} at ${bot.teamName} is actively seeking reinforcements.`,
          `🗞️ Whispers around the league suggest ${bot.teamName} could make a big move soon.`,
          `📰 ${bot.teamName}'s ${bot.managerName} spotted scouting heavily. Transfer incoming?`,
          `🔥 BREAKING: Multiple clubs monitoring the situation at ${bot.teamName}.`,
        ];
        const rumor = this._post('trade_rumor', pick(templates));
        rumors.push(rumor);
      }
    }

    // General league rumors
    if (Math.random() < 0.4 && bots.length >= 2) {
      const bot1 = bots[randInt(0, bots.length - 1)];
      let bot2 = bots[randInt(0, bots.length - 1)];
      while (bot2.id === bot1.id && bots.length > 1) {
        bot2 = bots[randInt(0, bots.length - 1)];
      }
      const generalRumors = [
        `🤝 Sources: ${bot1.teamName} and ${bot2.teamName} in talks over a potential swap deal.`,
        `💬 Tension between ${bot1.managerName} and ${bot2.managerName} could boil over next matchday.`,
        `📊 Analysts say ${bot1.teamName} vs ${bot2.teamName} could decide the title race.`,
      ];
      rumors.push(this._post('trade_rumor', pick(generalRumors)));
    }

    return rumors;
  }

  _getMatchVerdict(result) {
    const diff = Math.abs(result.score.home - result.score.away);
    if (result.winner === 'draw') return 'A hard-fought draw between two evenly matched sides.';
    const winner = result.winner === 'home' ? result.homeTeamName : result.awayTeamName;
    const loser = result.winner === 'home' ? result.awayTeamName : result.homeTeamName;
    if (diff >= 3) return `${winner} completely dominated ${loser} in a one-sided affair.`;
    if (diff === 2) return `Comfortable victory for ${winner} over ${loser}.`;
    return `A tight contest sees ${winner} edge past ${loser}.`;
  }

  _post(type, content) {
    const post = {
      id: uuidv4(),
      botId: '__media__',
      teamName: '📰 League Media',
      managerName: 'AI Sports Network',
      personalityLabel: 'Media',
      type,
      content,
      createdAt: new Date().toISOString(),
    };
    this.store.feed.unshift(post);
    return post;
  }
}

module.exports = MediaBot;

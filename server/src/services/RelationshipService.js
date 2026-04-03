const { randFloat } = require('../utils/random');

/**
 * Manages relationships between bots: friendly, neutral, rival.
 * Relationships evolve based on match results and trades.
 */
class RelationshipService {
  constructor(store) {
    this.store = store;
  }

  // Initialize all relationships as neutral
  initRelationships() {
    for (const bot of this.store.bots) {
      bot.relationships = bot.relationships || {};
      for (const other of this.store.bots) {
        if (other.id === bot.id) continue;
        if (!bot.relationships[other.id]) {
          bot.relationships[other.id] = 'neutral';
        }
      }
    }
  }

  // Update relationships after a match
  updateAfterMatch(matchResult) {
    const homeBot = this.store.bots.find(b => b.id === matchResult.homeTeamId);
    const awayBot = this.store.bots.find(b => b.id === matchResult.awayTeamId);
    if (!homeBot || !awayBot) return;

    // Close/contentious matches can create rivalries
    const scoreDiff = Math.abs(matchResult.score.home - matchResult.score.away);
    const totalGoals = matchResult.score.home + matchResult.score.away;

    // Both bots' aggression affects rivalry likelihood
    const aggressionAvg = (homeBot.traits.competitive.aggression + awayBot.traits.competitive.aggression) / 2;

    let rivalryChance = 0;
    if (scoreDiff <= 1 && totalGoals >= 2) rivalryChance += 15;  // close, high-scoring game
    if (aggressionAvg > 60) rivalryChance += 10;

    // Losses can breed rivalry (from the loser's perspective)
    const loser = matchResult.winner === 'home' ? awayBot : matchResult.winner === 'away' ? homeBot : null;
    const winner = matchResult.winner === 'home' ? homeBot : matchResult.winner === 'away' ? awayBot : null;

    if (loser && winner) {
      if (loser.traits.competitive.aggression > 60 && randFloat(0, 100) < rivalryChance + 10) {
        this._setRelationship(loser, winner, 'rival');
        // Add to memory
        if (!loser.memory.rivals.includes(winner.id)) {
          loser.memory.rivals = [...loser.memory.rivals, winner.id].slice(0, 3);
        }
      }
    }

    // Draws between aggressive bots can be mutual rivalry
    if (matchResult.winner === 'draw' && aggressionAvg > 65 && randFloat(0, 100) < rivalryChance) {
      this._setRelationship(homeBot, awayBot, 'rival');
      this._setRelationship(awayBot, homeBot, 'rival');
    }
  }

  // Successful trades can improve relationships
  updateAfterTrade(fromBotId, toBotId) {
    const fromBot = this.store.bots.find(b => b.id === fromBotId);
    const toBot = this.store.bots.find(b => b.id === toBotId);
    if (!fromBot || !toBot) return;

    const currentFrom = fromBot.relationships[toBotId] || 'neutral';
    const currentTo = toBot.relationships[fromBotId] || 'neutral';

    // Trade improves relationship one step
    if (currentFrom === 'rival') {
      this._setRelationship(fromBot, toBot, 'neutral');
    } else if (currentFrom === 'neutral') {
      if (randFloat(0, 100) < 40) {
        this._setRelationship(fromBot, toBot, 'friendly');
      }
    }

    if (currentTo === 'rival') {
      this._setRelationship(toBot, fromBot, 'neutral');
    } else if (currentTo === 'neutral') {
      if (randFloat(0, 100) < 40) {
        this._setRelationship(toBot, fromBot, 'friendly');
      }
    }
  }

  _setRelationship(bot, otherBot, status) {
    bot.relationships[otherBot.id] = status;
  }

  getRelationship(botId1, botId2) {
    const bot = this.store.bots.find(b => b.id === botId1);
    if (!bot) return 'neutral';
    return bot.relationships[botId2] || 'neutral';
  }

  getAllRelationships(botId) {
    const bot = this.store.bots.find(b => b.id === botId);
    if (!bot) return {};

    const result = {};
    for (const [otherId, status] of Object.entries(bot.relationships)) {
      const other = this.store.bots.find(b => b.id === otherId);
      if (other) {
        result[otherId] = { teamName: other.teamName, status };
      }
    }
    return result;
  }
}

module.exports = RelationshipService;

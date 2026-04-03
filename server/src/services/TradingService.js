const { v4: uuidv4 } = require('uuid');
const { playerOverall } = require('../models/Player');
const { randFloat } = require('../utils/random');

/**
 * Handles player-for-player trading between bots.
 */
class TradingService {
  constructor(store) {
    this.store = store;
    this.store.tradeListings = this.store.tradeListings || [];
    this.store.tradeOffers = this.store.tradeOffers || [];
  }

  // Bot lists a player as available for trade
  listPlayer(botId, playerId) {
    const bot = this.store.bots.find(b => b.id === botId);
    if (!bot) return null;

    const player = bot.players.find(p => p.id === playerId);
    if (!player) return null;

    const listing = {
      id: uuidv4(),
      botId,
      teamName: bot.teamName,
      playerId,
      playerName: player.name,
      position: player.position,
      overall: playerOverall(player),
      createdAt: new Date().toISOString(),
    };

    this.store.tradeListings.push(listing);
    return listing;
  }

  // Bot sends a trade offer: my player for your listed player
  sendOffer(fromBotId, toListingId, offeredPlayerId) {
    const fromBot = this.store.bots.find(b => b.id === fromBotId);
    const listing = this.store.tradeListings.find(l => l.id === toListingId);
    if (!fromBot || !listing) return null;

    const offeredPlayer = fromBot.players.find(p => p.id === offeredPlayerId);
    if (!offeredPlayer) return null;

    const offer = {
      id: uuidv4(),
      fromBotId,
      fromTeamName: fromBot.teamName,
      toBotId: listing.botId,
      listingId: listing.id,
      offeredPlayerId,
      offeredPlayerName: offeredPlayer.name,
      offeredPlayerOverall: playerOverall(offeredPlayer),
      requestedPlayerId: listing.playerId,
      requestedPlayerName: listing.playerName,
      requestedPlayerOverall: listing.overall,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.store.tradeOffers.push(offer);
    return offer;
  }

  // Bot AI evaluates an incoming trade offer
  evaluateOffer(offerId) {
    const offer = this.store.tradeOffers.find(o => o.id === offerId);
    if (!offer || offer.status !== 'pending') return null;

    const receivingBot = this.store.bots.find(b => b.id === offer.toBotId);
    if (!receivingBot) return null;

    const accept = this._shouldAccept(receivingBot, offer);
    offer.status = accept ? 'accepted' : 'rejected';

    if (accept) {
      this._executeTrade(offer);
    }

    return offer;
  }

  _shouldAccept(bot, offer) {
    const valueDiff = offer.offeredPlayerOverall - offer.requestedPlayerOverall;
    const { riskTolerance } = bot.traits.competitive;
    const { analytical } = bot.traits.strategic;

    // Check relationship with offering bot
    const relationship = bot.relationships[offer.fromBotId] || 'neutral';
    let relationshipMod = 0;
    if (relationship === 'friendly') relationshipMod = 10;
    if (relationship === 'rival') relationshipMod = -15;

    // Analytical bots demand fair or better value
    const threshold = -5 - (riskTolerance / 10) + (analytical / 15) + relationshipMod;

    // Check if the offered player fills a team weakness
    const needBonus = this._getPositionNeedBonus(bot, offer);

    const score = valueDiff + needBonus + randFloat(-5, 5);
    return score >= threshold;
  }

  _getPositionNeedBonus(bot, offer) {
    // If the bot's weakest position matches the offered player, bonus
    const starters = bot.players.slice(0, 11);
    const positionStrength = {};
    for (const p of starters) {
      if (!positionStrength[p.position]) positionStrength[p.position] = [];
      positionStrength[p.position].push(playerOverall(p));
    }

    // Find weakest position average
    let weakest = null;
    let weakestAvg = 100;
    for (const [pos, overalls] of Object.entries(positionStrength)) {
      const avg = overalls.reduce((a, b) => a + b, 0) / overalls.length;
      if (avg < weakestAvg) {
        weakestAvg = avg;
        weakest = pos;
      }
    }

    // Check offered player from the sending bot
    const sendingBot = this.store.bots.find(b => b.id === offer.fromBotId);
    const offeredPlayer = sendingBot?.players.find(p => p.id === offer.offeredPlayerId);

    if (offeredPlayer && offeredPlayer.position === weakest) return 10;
    return 0;
  }

  _executeTrade(offer) {
    const fromBot = this.store.bots.find(b => b.id === offer.fromBotId);
    const toBot = this.store.bots.find(b => b.id === offer.toBotId);
    if (!fromBot || !toBot) return;

    const fromPlayerIdx = fromBot.players.findIndex(p => p.id === offer.offeredPlayerId);
    const toPlayerIdx = toBot.players.findIndex(p => p.id === offer.requestedPlayerId);

    if (fromPlayerIdx === -1 || toPlayerIdx === -1) return;

    // Swap players
    const fromPlayer = fromBot.players[fromPlayerIdx];
    const toPlayer = toBot.players[toPlayerIdx];
    fromBot.players[fromPlayerIdx] = toPlayer;
    toBot.players[toPlayerIdx] = fromPlayer;

    // Update memory
    const tradeMem = {
      with: toBot.teamName,
      gave: offer.offeredPlayerName,
      received: offer.requestedPlayerName,
      date: new Date().toISOString(),
    };
    fromBot.memory.recentTrades = [tradeMem, ...fromBot.memory.recentTrades].slice(0, 5);
    toBot.memory.recentTrades = [
      { ...tradeMem, with: fromBot.teamName, gave: offer.requestedPlayerName, received: offer.offeredPlayerName },
      ...toBot.memory.recentTrades,
    ].slice(0, 5);

    // Remove listing
    this.store.tradeListings = this.store.tradeListings.filter(l => l.id !== offer.listingId);
  }

  // Auto-generate trade activity: bots decide what to list and who to trade with
  autoTrade() {
    const results = [];

    for (const bot of this.store.bots) {
      // Chance to list a player based on riskTolerance
      if (Math.random() * 100 < bot.traits.competitive.riskTolerance * 0.3) {
        const subs = bot.players.slice(11);
        if (subs.length > 0) {
          const weakest = subs.reduce((w, p) => playerOverall(p) < playerOverall(w) ? p : w);
          const listing = this.listPlayer(bot.id, weakest.id);
          if (listing) results.push({ type: 'listing', listing });
        }
      }
    }

    // Bots consider existing listings
    for (const listing of [...this.store.tradeListings]) {
      for (const bot of this.store.bots) {
        if (bot.id === listing.botId) continue;
        if (Math.random() > 0.2) continue;

        // Pick a player to offer
        const subs = bot.players.slice(11);
        if (subs.length === 0) continue;
        const toOffer = subs[Math.floor(Math.random() * subs.length)];

        const offer = this.sendOffer(bot.id, listing.id, toOffer.id);
        if (offer) {
          const evaluated = this.evaluateOffer(offer.id);
          results.push({ type: 'offer', offer: evaluated });
        }
      }
    }

    return results;
  }

  getListings() {
    return this.store.tradeListings;
  }

  getOffers() {
    return this.store.tradeOffers;
  }
}

module.exports = TradingService;

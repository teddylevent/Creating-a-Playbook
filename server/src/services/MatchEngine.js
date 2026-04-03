const { v4: uuidv4 } = require('uuid');
const { randInt, randFloat, pick, weightedRandom } = require('../utils/random');
const { playerOverall } = require('../models/Player');

/**
 * Simulates a match between two bot teams.
 * Returns match result with score, events, and stats.
 */
function simulateMatch(homeBot, awayBot) {
  const homeStrength = calculateTeamStrength(homeBot);
  const awayStrength = calculateTeamStrength(awayBot);

  // Apply personality modifiers
  const homeMod = getTacticalModifier(homeBot.traits);
  const awayMod = getTacticalModifier(awayBot.traits);

  const homeAttack = homeStrength.attack * homeMod.attackMod * 1.05; // home advantage
  const homeDefense = homeStrength.defense * homeMod.defenseMod;
  const awayAttack = awayStrength.attack * awayMod.attackMod;
  const awayDefense = awayStrength.defense * awayMod.defenseMod;

  // Simulate 90 minutes in 6 phases of 15 minutes
  const events = [];
  let homeGoals = 0;
  let awayGoals = 0;
  let homePossession = 0;
  let awayPossession = 0;

  for (let phase = 0; phase < 6; phase++) {
    const minute = phase * 15 + randInt(1, 15);

    // Possession for this phase
    const possChance = homeAttack / (homeAttack + awayAttack);
    if (Math.random() < possChance) {
      homePossession++;
    } else {
      awayPossession++;
    }

    // Home attack chance
    if (Math.random() < getGoalProbability(homeAttack, awayDefense)) {
      homeGoals++;
      const scorer = pickScorer(homeBot);
      events.push({
        minute,
        type: 'goal',
        team: 'home',
        teamName: homeBot.teamName,
        player: scorer.name,
        description: generateGoalDescription(scorer, homeBot.teamName),
      });
    }

    // Away attack chance
    if (Math.random() < getGoalProbability(awayAttack, homeDefense)) {
      awayGoals++;
      const scorer = pickScorer(awayBot);
      events.push({
        minute: minute + randInt(0, 5),
        type: 'goal',
        team: 'away',
        teamName: awayBot.teamName,
        player: scorer.name,
        description: generateGoalDescription(scorer, awayBot.teamName),
      });
    }

    // Random events: yellow cards, saves, near misses
    if (Math.random() < 0.2) {
      const isHome = Math.random() < 0.5;
      const bot = isHome ? homeBot : awayBot;
      const player = pick(bot.players.slice(0, 11));
      events.push({
        minute: minute + randInt(0, 3),
        type: 'yellow_card',
        team: isHome ? 'home' : 'away',
        teamName: bot.teamName,
        player: player.name,
        description: `Yellow card for ${player.name} (${bot.teamName})`,
      });
    }

    if (Math.random() < 0.3) {
      const isHome = Math.random() < 0.5;
      const bot = isHome ? homeBot : awayBot;
      events.push({
        minute: minute + randInt(0, 3),
        type: 'save',
        team: isHome ? 'home' : 'away',
        teamName: bot.teamName,
        player: bot.players.find(p => p.position === 'GK')?.name || 'Goalkeeper',
        description: `Great save by ${bot.players.find(p => p.position === 'GK')?.name || 'the keeper'}!`,
      });
    }
  }

  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);

  const possTotal = homePossession + awayPossession;

  return {
    id: uuidv4(),
    homeTeamId: homeBot.id,
    awayTeamId: awayBot.id,
    homeTeamName: homeBot.teamName,
    awayTeamName: awayBot.teamName,
    score: { home: homeGoals, away: awayGoals },
    possession: {
      home: Math.round((homePossession / possTotal) * 100),
      away: Math.round((awayPossession / possTotal) * 100),
    },
    events,
    winner: homeGoals > awayGoals ? 'home' : awayGoals > homeGoals ? 'away' : 'draw',
    playedAt: new Date().toISOString(),
  };
}

function calculateTeamStrength(bot) {
  const starters = bot.players.slice(0, 11);
  let totalAttack = 0;
  let totalDefense = 0;
  let totalSpeed = 0;

  for (const player of starters) {
    const formMod = (player.form || 75) / 100;
    totalAttack += player.stats.attack * formMod;
    totalDefense += player.stats.defense * formMod;
    totalSpeed += player.stats.speed * formMod;
  }

  return {
    attack: totalAttack / 11,
    defense: totalDefense / 11,
    speed: totalSpeed / 11,
    overall: starters.reduce((sum, p) => sum + playerOverall(p), 0) / 11,
  };
}

function getTacticalModifier(traits) {
  const { aggression, riskTolerance } = traits.competitive;
  const { analytical, instinctive } = traits.strategic;

  // Aggressive/risky bots boost attack but weaken defense
  const attackMod = 0.85 + (aggression / 100) * 0.2 + (riskTolerance / 100) * 0.1;
  const defenseMod = 0.85 + ((100 - aggression) / 100) * 0.15 + (analytical / 100) * 0.15;

  return { attackMod, defenseMod };
}

function getGoalProbability(attack, defense) {
  // Base probability ~15-25% per phase, modified by attack vs defense
  const ratio = attack / (attack + defense);
  return 0.08 + ratio * 0.18;
}

function pickScorer(bot) {
  const starters = bot.players.slice(0, 11);
  // Weight by attack stat
  const weights = starters.map(p => p.stats.attack);
  const idx = weightedRandom(weights);
  return starters[idx];
}

function generateGoalDescription(player, teamName) {
  const descriptions = [
    `GOAL! ${player.name} scores for ${teamName}!`,
    `${player.name} finds the back of the net! ${teamName} celebrate!`,
    `Brilliant finish by ${player.name}! Goal for ${teamName}!`,
    `${player.name} with a clinical strike for ${teamName}!`,
    `What a goal from ${player.name}! ${teamName} are on fire!`,
  ];
  return pick(descriptions);
}

module.exports = { simulateMatch, calculateTeamStrength };

const { v4: uuidv4 } = require('uuid');
const { randInt, clamp } = require('../utils/random');
const { generateSquad } = require('./Player');

// ── Manager Archetypes ──
const ARCHETYPES = {
  'Aggressive Attacker': {
    competitive: { aggression: [70, 95], riskTolerance: [65, 90], adaptability: [30, 60], discipline: [20, 50] },
    strategic: { analytical: [20, 50], instinctive: [70, 95], longTermVision: [20, 50] },
    social: { confidence: [75, 95], toxicity: [40, 75], emotionality: [60, 90], secrecy: [10, 40] },
  },
  'Defensive Strategist': {
    competitive: { aggression: [20, 45], riskTolerance: [10, 35], adaptability: [50, 80], discipline: [75, 95] },
    strategic: { analytical: [70, 95], instinctive: [20, 50], longTermVision: [65, 90] },
    social: { confidence: [55, 80], toxicity: [10, 30], emotionality: [15, 40], secrecy: [60, 85] },
  },
  'Balanced Coach': {
    competitive: { aggression: [40, 60], riskTolerance: [35, 65], adaptability: [50, 75], discipline: [50, 75] },
    strategic: { analytical: [45, 70], instinctive: [45, 70], longTermVision: [50, 75] },
    social: { confidence: [50, 75], toxicity: [15, 40], emotionality: [35, 60], secrecy: [30, 55] },
  },
  'Youth Developer': {
    competitive: { aggression: [25, 50], riskTolerance: [40, 70], adaptability: [65, 90], discipline: [55, 80] },
    strategic: { analytical: [55, 80], instinctive: [40, 65], longTermVision: [80, 100] },
    social: { confidence: [50, 75], toxicity: [5, 20], emotionality: [45, 70], secrecy: [20, 45] },
  },
  'Chaotic Gambler': {
    competitive: { aggression: [55, 85], riskTolerance: [80, 100], adaptability: [60, 85], discipline: [5, 30] },
    strategic: { analytical: [15, 40], instinctive: [75, 100], longTermVision: [5, 30] },
    social: { confidence: [70, 95], toxicity: [50, 80], emotionality: [70, 100], secrecy: [5, 25] },
  },
  'Data Scientist': {
    competitive: { aggression: [25, 50], riskTolerance: [20, 45], adaptability: [70, 95], discipline: [70, 90] },
    strategic: { analytical: [85, 100], instinctive: [10, 35], longTermVision: [70, 95] },
    social: { confidence: [60, 80], toxicity: [5, 25], emotionality: [10, 30], secrecy: [65, 90] },
  },
};

function generateTraits(archetype) {
  const ranges = archetype ? ARCHETYPES[archetype] : null;

  function trait(category, name) {
    if (ranges && ranges[category] && ranges[category][name]) {
      const [min, max] = ranges[category][name];
      return clamp(randInt(min, max), 0, 100);
    }
    return randInt(5, 95);
  }

  return {
    competitive: {
      aggression: trait('competitive', 'aggression'),
      riskTolerance: trait('competitive', 'riskTolerance'),
      adaptability: trait('competitive', 'adaptability'),
      discipline: trait('competitive', 'discipline'),
    },
    strategic: {
      analytical: trait('strategic', 'analytical'),
      instinctive: trait('strategic', 'instinctive'),
      longTermVision: trait('strategic', 'longTermVision'),
    },
    social: {
      confidence: trait('social', 'confidence'),
      toxicity: trait('social', 'toxicity'),
      emotionality: trait('social', 'emotionality'),
      secrecy: trait('social', 'secrecy'),
    },
  };
}

function derivePersonalityLabel(traits) {
  const { toxicity, confidence, emotionality, secrecy } = traits.social;
  const { aggression, discipline } = traits.competitive;
  const { analytical, instinctive } = traits.strategic;

  if (toxicity > 65 && confidence > 70) return 'Trash Talker';
  if (analytical > 75 && emotionality < 30) return 'Cold Strategist';
  if (aggression > 75 && instinctive > 70) return 'Fiery Commander';
  if (discipline > 75 && secrecy > 60) return 'Silent Perfectionist';
  if (emotionality > 70 && confidence > 65) return 'Passionate Leader';
  if (secrecy > 70 && analytical > 60) return 'Shadowy Tactician';
  if (toxicity < 20 && confidence > 60) return 'Gentleman Manager';
  if (instinctive > 70 && aggression > 60) return 'Gut-Feel Gambler';
  if (discipline > 65 && analytical > 55) return 'Methodical Builder';
  if (emotionality > 60 && toxicity > 40) return 'Emotional Provocateur';
  return 'Pragmatic Coach';
}

const TEAM_PREFIXES = [
  'FC', 'AC', 'SC', 'Real', 'Sporting', 'Dynamo', 'Inter', 'United', 'Athletic', 'Olympic'
];
const TEAM_NAMES = [
  'Phoenix', 'Wolves', 'Thunder', 'Lions', 'Titans', 'Eagles', 'Cobras', 'Sharks',
  'Falcons', 'Panthers', 'Vortex', 'Storm', 'Blaze', 'Arrows', 'Raptors', 'Stallions',
  'Strikers', 'Guardians', 'Legends', 'Aces'
];

function generateTeamName() {
  const prefix = TEAM_PREFIXES[randInt(0, TEAM_PREFIXES.length - 1)];
  const name = TEAM_NAMES[randInt(0, TEAM_NAMES.length - 1)];
  return `${prefix} ${name}`;
}

function createBot(options = {}) {
  const archetype = options.archetype || null;
  const traits = generateTraits(archetype);
  const squad = generateSquad();

  return {
    id: uuidv4(),
    teamName: options.teamName || generateTeamName(),
    managerName: options.managerName || `Manager ${randInt(1, 999)}`,
    archetype: archetype || 'Random',
    traits,
    personalityLabel: derivePersonalityLabel(traits),
    players: [...squad.starters, ...squad.subs],
    formation: '4-4-2',
    memory: {
      lastMatches: [],     // last 5 match results
      rivals: [],          // bot IDs
      recentTrades: [],    // last 5 trades
    },
    relationships: {},     // botId -> 'friendly' | 'neutral' | 'rival'
    stats: {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createBot, ARCHETYPES, generateTraits, derivePersonalityLabel };

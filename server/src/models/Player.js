const { v4: uuidv4 } = require('uuid');
const { randInt } = require('../utils/random');

const FIRST_NAMES = [
  'Marco', 'Lucas', 'Carlos', 'Ahmed', 'Yuki', 'James', 'Pedro', 'Ivan',
  'Omar', 'Leo', 'Kai', 'Diego', 'Felix', 'Bruno', 'Rafael', 'Theo',
  'Mateo', 'Andre', 'Hugo', 'Enzo', 'Niko', 'Sami', 'Axel', 'Riku',
  'Dante', 'Emil', 'Javier', 'Kofi', 'Liam', 'Noah', 'Elio', 'Idris'
];

const LAST_NAMES = [
  'Silva', 'Martinez', 'Tanaka', 'Mueller', 'Park', 'Johnson', 'Santos',
  'Petrov', 'Ali', 'Kim', 'Berg', 'Costa', 'Romano', 'Fischer', 'Lopez',
  'Fernandez', 'Nakamura', 'Weber', 'Moreno', 'Schmidt', 'Torres', 'Okafor',
  'Andersen', 'Diallo', 'Reis', 'Hoffman', 'Vargas', 'Ito', 'Blake', 'Sato'
];

const POSITIONS = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'RW', 'ST'];
const SUB_POSITIONS = ['GK', 'CB', 'CM', 'ST'];

function createPlayer(position, overrides = {}) {
  const baseStats = getPositionBaseStats(position);
  return {
    id: uuidv4(),
    name: `${FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randInt(0, LAST_NAMES.length - 1)]}`,
    position,
    age: randInt(18, 35),
    stats: {
      attack: randInt(baseStats.attack[0], baseStats.attack[1]),
      defense: randInt(baseStats.defense[0], baseStats.defense[1]),
      speed: randInt(30, 95),
      stamina: randInt(40, 95),
      technique: randInt(30, 90),
      passing: randInt(35, 90),
    },
    form: randInt(60, 100), // current form percentage
    ...overrides,
  };
}

function getPositionBaseStats(position) {
  switch (position) {
    case 'GK': return { attack: [10, 30], defense: [70, 95] };
    case 'CB': return { attack: [20, 50], defense: [65, 95] };
    case 'LB': case 'RB': return { attack: [35, 70], defense: [55, 85] };
    case 'CDM': return { attack: [30, 60], defense: [60, 90] };
    case 'CM': return { attack: [40, 80], defense: [40, 75] };
    case 'LW': case 'RW': return { attack: [60, 95], defense: [20, 50] };
    case 'ST': return { attack: [65, 95], defense: [15, 45] };
    default: return { attack: [30, 70], defense: [30, 70] };
  }
}

function playerOverall(player) {
  const s = player.stats;
  const posWeights = {
    GK: { attack: 0.05, defense: 0.35, speed: 0.1, stamina: 0.1, technique: 0.15, passing: 0.25 },
    CB: { attack: 0.1, defense: 0.35, speed: 0.15, stamina: 0.15, technique: 0.1, passing: 0.15 },
    LB: { attack: 0.15, defense: 0.25, speed: 0.2, stamina: 0.15, technique: 0.1, passing: 0.15 },
    RB: { attack: 0.15, defense: 0.25, speed: 0.2, stamina: 0.15, technique: 0.1, passing: 0.15 },
    CDM: { attack: 0.1, defense: 0.3, speed: 0.1, stamina: 0.2, technique: 0.1, passing: 0.2 },
    CM: { attack: 0.2, defense: 0.15, speed: 0.1, stamina: 0.15, technique: 0.2, passing: 0.2 },
    LW: { attack: 0.3, defense: 0.05, speed: 0.25, stamina: 0.1, technique: 0.2, passing: 0.1 },
    RW: { attack: 0.3, defense: 0.05, speed: 0.25, stamina: 0.1, technique: 0.2, passing: 0.1 },
    ST: { attack: 0.35, defense: 0.05, speed: 0.2, stamina: 0.1, technique: 0.2, passing: 0.1 },
  };
  const w = posWeights[player.position] || posWeights.CM;
  return Math.round(
    s.attack * w.attack + s.defense * w.defense + s.speed * w.speed +
    s.stamina * w.stamina + s.technique * w.technique + s.passing * w.passing
  );
}

function generateSquad() {
  const starters = POSITIONS.map(pos => createPlayer(pos));
  const subs = SUB_POSITIONS.map(pos => createPlayer(pos));
  return { starters, subs };
}

module.exports = { createPlayer, playerOverall, generateSquad, POSITIONS, SUB_POSITIONS };

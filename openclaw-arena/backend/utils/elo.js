const K_FACTOR = 32;

/**
 * Calculate expected score for player A vs player B
 */
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a match.
 * @param {number} ratingA - Current rating of agent A
 * @param {number} ratingB - Current rating of agent B
 * @param {'a'|'b'|'draw'} result - Who won ('a', 'b', or 'draw')
 * @returns {{ newRatingA: number, newRatingB: number }}
 */
function calculateElo(ratingA, ratingB, result) {
  const expA = expectedScore(ratingA, ratingB);
  const expB = expectedScore(ratingB, ratingA);

  let scoreA, scoreB;
  if (result === 'a') {
    scoreA = 1;
    scoreB = 0;
  } else if (result === 'b') {
    scoreA = 0;
    scoreB = 1;
  } else {
    scoreA = 0.5;
    scoreB = 0.5;
  }

  const newRatingA = Math.round(ratingA + K_FACTOR * (scoreA - expA));
  const newRatingB = Math.round(ratingB + K_FACTOR * (scoreB - expB));

  return { newRatingA, newRatingB };
}

module.exports = { calculateElo };

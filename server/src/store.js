/**
 * In-memory data store for MVP.
 * Replace with PostgreSQL/MongoDB for production.
 */
const store = {
  bots: [],
  matches: [],
  feed: [],
  tradeListings: [],
  tradeOffers: [],
  league: null,
};

module.exports = store;

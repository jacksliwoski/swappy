// Ultra simple in-memory "DB". Replace with a real DB later.

const store = {
  users: new Map(),       // id -> { id, xp, level, stats }
  listings: new Map(),    // id -> listing
  trades: new Map(),      // id -> { id, buyerId, sellerId, listingId, status }
  seq: { listing: 1, trade: 1 }
};

// XP / Leveling
const LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 300 },
  { level: 4, xp: 700 },
  { level: 5, xp: 1500 }
];

function levelFromXp(xp) {
  let lvl = 1;
  for (const step of LEVELS) if (xp >= step.xp) lvl = step.level;
  return lvl;
}

function ensureUser(id) {
  if (!store.users.has(id)) {
    store.users.set(id, {
      id,
      xp: 0,
      level: 1,
      stats: { tradesCompleted: 0, listingsCreated: 0 }
    });
  }
  return store.users.get(id);
}

function addXp(id, amount) {
  const u = ensureUser(id);
  u.xp += amount;
  const before = u.level;
  u.level = levelFromXp(u.xp);
  return { before, after: u.level, xp: u.xp };
}

module.exports = {
  store,
  ensureUser,
  addXp
};

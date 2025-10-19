// src/db/filedb.js
// super simple JSON file "database": users.json, resets.json
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const dataDir = path.join(__dirname, '..', '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const resetsFile = path.join(dataDir, 'resets.json');
const inventoryFile = path.join(dataDir, 'inventory.json');

// Placeholder data for 2 demo users
const DEMO_USERS = {
  byEmail: {
    'jack@swappy.demo': {
      id: 'u_demo_1',
      email: 'jack@swappy.demo',
      passwordHash: '', // Will be set to bcrypt('password123')
      age: 10,
      guardianName: 'Sarah Martinez',
      guardianEmail: 'sarah.m@example.com',
      
      // Profile data
      location: 'Seattle, WA',
      timeWindow: 'Weekends 10am-4pm',
      travelMode: 'driving',
      maxMinutes: 20,
      indoorPreferred: false,
      wheelchairAccess: false,
      parkingNeeded: true,
      isUnder18: true,
      categoryInterests: ['LEGO sets', 'Pokemon cards', 'action figures', 'board games', 'video games'],
      
      // Trading stats
      username: 'jack',
      avatar: '🦖',
      level: 3,
      xp: 450,
      xpToNextLevel: 500,
      hasGuardian: true,
      createdAt: '2025-01-15T10:00:00.000Z'
    },
    'anderson@swappy.demo': {
      id: 'u_demo_2',
      email: 'anderson@swappy.demo',
      passwordHash: '', // Will be set to bcrypt('password123')
      age: 12,
      guardianName: 'Michael Anderson',
      guardianEmail: 'mike.anderson@example.com',
      
      // Profile data
      location: 'Bellevue Downtown',
      timeWindow: 'After school 3-7pm',
      travelMode: 'walking',
      maxMinutes: 15,
      indoorPreferred: true,
      wheelchairAccess: false,
      parkingNeeded: false,
      isUnder18: true,
      categoryInterests: ['sports cards', 'Funko Pops', 'Marvel figures', 'trading card games', 'art supplies'],
      
      // Trading stats
      username: 'anderson',
      avatar: '🎮',
      level: 5,
      xp: 820,
      xpToNextLevel: 1000,
      hasGuardian: true,
      createdAt: '2025-01-10T14:30:00.000Z'
    },
    'mike.anderson@example.com': {
      id: 'guardian_anderson',
      email: 'mike.anderson@example.com',
      passwordHash: '', // Will be set to bcrypt('guardian123')
      age: 42,
      guardianName: 'Self',
      guardianEmail: 'mike.anderson@example.com',
      isGuardian: true,
      childUserId: 'u_demo_2',
      childUsername: 'anderson',
      
      // Profile data
      username: 'Michael (Guardian)',
      avatar: '👨‍👩‍👧',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      hasGuardian: false,
      createdAt: '2025-01-10T14:30:00.000Z'
    }
  },
  byId: {}
};

// Initialize demo users with hashed passwords
async function initializeDemoUsers() {
  const hash = await bcrypt.hash('password123', 12);
  const guardianHash = await bcrypt.hash('guardian123', 12);
  
  DEMO_USERS.byEmail['jack@swappy.demo'].passwordHash = hash;
  DEMO_USERS.byEmail['anderson@swappy.demo'].passwordHash = hash;
  DEMO_USERS.byEmail['mike.anderson@example.com'].passwordHash = guardianHash;
  
  // Set up byId index
  DEMO_USERS.byId['u_demo_1'] = DEMO_USERS.byEmail['jack@swappy.demo'];
  DEMO_USERS.byId['u_demo_2'] = DEMO_USERS.byEmail['anderson@swappy.demo'];
  DEMO_USERS.byId['guardian_anderson'] = DEMO_USERS.byEmail['mike.anderson@example.com'];
  
  console.log('[DB] Demo users initialized:');
  console.log('   jack@swappy.demo / password123');
  console.log('   anderson@swappy.demo / password123');
  console.log('   mike.anderson@example.com / guardian123 (Guardian Account)');
}

// ensure files exist
function ensureFile(file, initialJson) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(initialJson, null, 2));
  }
}

// Initialize with demo users
(async () => {
  await initializeDemoUsers();
  ensureFile(usersFile, DEMO_USERS);
  ensureFile(resetsFile, { tokens: {} });
  ensureFile(inventoryFile, { items: [] });
})();

async function readJson(file) {
  const text = await fsp.readFile(file, 'utf8');
  return JSON.parse(text);
}

async function writeJson(file, data) {
  const tmp = file + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fsp.rename(tmp, file);
}

// ---- Users ----
async function createUser({ 
  email, 
  password, 
  age, 
  guardianName, 
  guardianEmail,
  location = '',
  timeWindow = '',
  travelMode = 'driving',
  maxMinutes = 20,
  indoorPreferred = false,
  wheelchairAccess = false,
  parkingNeeded = false,
  categoryInterests = []
}) {
  const db = await readJson(usersFile);
  const lower = String(email).trim().toLowerCase();
  if (db.byEmail[lower]) throw new Error('email_in_use');

  const id = 'u_' + Date.now();
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Generate kid-friendly username and avatar
  const username = 'Trader' + Math.floor(Math.random() * 10000);
  const avatars = ['🦖', '🎮', '🚀', '🎨', '⚽', '🎪', '🦄', '🎸', '🏀', '🎯'];
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];

  const user = {
    id,
    email: lower,
    passwordHash,
    age: Number(age),
    guardianName: guardianName?.trim() || '',
    guardianEmail: guardianEmail?.trim().toLowerCase() || '',
    
    // Profile data
    location: location?.trim() || '',
    timeWindow: timeWindow?.trim() || '',
    travelMode: travelMode || 'driving',
    maxMinutes: Number(maxMinutes) || 20,
    indoorPreferred: Boolean(indoorPreferred),
    wheelchairAccess: Boolean(wheelchairAccess),
    parkingNeeded: Boolean(parkingNeeded),
    isUnder18: Number(age) < 18,
    categoryInterests: Array.isArray(categoryInterests) ? categoryInterests : [],
    
    // Trading stats
    username,
    avatar,
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    hasGuardian: true,
    createdAt: new Date().toISOString()
  };

  db.byEmail[lower] = user;
  db.byId[id] = user;
  await writeJson(usersFile, db);

  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

async function findUserByEmail(email) {
  const db = await readJson(usersFile);
  const lower = String(email || '').trim().toLowerCase();
  const u = db.byEmail[lower] || null;
  return u;
}

async function findUserById(id) {
  const db = await readJson(usersFile);
  const u = db.byId[id] || null;
  if (!u) return null;
  const { passwordHash, ...publicUser } = u;
  return publicUser;
}

async function getAllUsers() {
  const db = await readJson(usersFile);
  // Return all users without passwords
  const users = {};
  for (const [id, user] of Object.entries(db.byId)) {
    const { passwordHash, ...publicUser } = user;
    users[id] = publicUser;
  }
  return users;
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password || '', user.passwordHash);
}

async function setUserPassword(email, newPassword) {
  const db = await readJson(usersFile);
  const lower = String(email || '').trim().toLowerCase();
  const u = db.byEmail[lower];
  if (!u) throw new Error('user_not_found');
  u.passwordHash = await bcrypt.hash(newPassword, 12);
  await writeJson(usersFile, db);
  return true;
}

async function updateUserProfile(id, updates) {
  const db = await readJson(usersFile);
  const u = db.byId[id];
  if (!u) throw new Error('user_not_found');
  
  // Allow updating these fields
  const allowed = [
    'location', 'timeWindow', 'travelMode', 'maxMinutes',
    'indoorPreferred', 'wheelchairAccess', 'parkingNeeded',
    'categoryInterests', 'username', 'avatar'
  ];
  
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      u[key] = updates[key];
    }
  }
  
  await writeJson(usersFile, db);
  const { passwordHash, ...publicUser } = u;
  return publicUser;
}

// ---- Reset tokens ----
async function saveResetToken(token, email, expiresAt) {
  const db = await readJson(resetsFile);
  db.tokens[token] = { email, expiresAt };
  await writeJson(resetsFile, db);
}

async function useResetToken(token) {
  const db = await readJson(resetsFile);
  const rec = db.tokens[token];
  if (!rec) return null;
  delete db.tokens[token];
  await writeJson(resetsFile, db);
  return rec;
}

// ---- Inventory ----
async function addInventoryItem(userId, item) {
  const db = await readJson(inventoryFile);
  const newItem = {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userId,
    ...item,
    createdAt: new Date().toISOString()
  };
  db.items.push(newItem);
  await writeJson(inventoryFile, db);
  return newItem;
}

async function getUserInventory(userId) {
  const db = await readJson(inventoryFile);
  return db.items.filter(item => item.userId === userId);
}

async function getInventoryItem(itemId) {
  const db = await readJson(inventoryFile);
  return db.items.find(item => item.id === itemId) || null;
}

async function updateInventoryItem(itemId, updates) {
  const db = await readJson(inventoryFile);
  const idx = db.items.findIndex(item => item.id === itemId);
  if (idx === -1) throw new Error('item_not_found');
  
  db.items[idx] = { ...db.items[idx], ...updates };
  await writeJson(inventoryFile, db);
  return db.items[idx];
}

async function deleteInventoryItem(itemId) {
  const db = await readJson(inventoryFile);
  const idx = db.items.findIndex(item => item.id === itemId);
  if (idx === -1) throw new Error('item_not_found');
  
  db.items.splice(idx, 1);
  await writeJson(inventoryFile, db);
  return true;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  verifyPassword,
  setUserPassword,
  updateUserProfile,
  saveResetToken,
  useResetToken,
  addInventoryItem,
  getUserInventory,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};

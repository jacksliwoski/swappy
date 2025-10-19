// src/db/filedb.js
// super simple JSON file "database": users.json, resets.json
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const dataDir = path.join(__dirname, '..', '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const resetsFile = path.join(dataDir, 'resets.json');

// ensure files exist
function ensureFile(file, initialJson) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(initialJson, null, 2));
  }
}
ensureFile(usersFile, { byEmail: {}, byId: {} });
ensureFile(resetsFile, { tokens: {} });

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
async function createUser({ email, password, age, guardianName, guardianEmail }) {
  const db = await readJson(usersFile);
  const lower = String(email).trim().toLowerCase();
  if (db.byEmail[lower]) throw new Error('email_in_use');

  const id = 'u_' + Date.now();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    id,
    email: lower,
    passwordHash,
    age: Number(age),
    guardianName: guardianName?.trim() || '',
    guardianEmail: guardianEmail?.trim().toLowerCase() || '',
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

module.exports = {
  createUser,
  findUserByEmail,
  verifyPassword,
  setUserPassword,
  saveResetToken,
  useResetToken
};

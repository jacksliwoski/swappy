// src/routes/auth.js
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const {
  createUser, findUserByEmail, verifyPassword,
  setUserPassword, saveResetToken, useResetToken
} = require('../db/filedb');
const { config } = require('../config');
const { signJwt } = require('../middleware/auth');

const router = express.Router();

// "File transport": nodemailer writes emails to data/outbox/*.eml
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true
});
function writeOutbox(mail) {
  const fname = `${Date.now()}_${mail.to.replace(/[^a-zA-Z0-9_.@-]/g, '_')}.eml`;
  const outPath = path.join(__dirname, '..', '..', 'data', 'outbox', fname);
  fs.writeFileSync(outPath, mail.message);
  return outPath;
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, age, guardianName, guardianEmail } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'email_password_required' });
    if (age == null || Number.isNaN(Number(age))) return res.status(400).json({ ok: false, error: 'age_required' });
    if (!guardianName || !guardianEmail) return res.status(400).json({ ok: false, error: 'guardian_required' });

    const user = await createUser({ email, password, age, guardianName, guardianEmail });

    // Guardian notice (written to outbox)
    const guardianMsg = {
      from: 'Swappy <no-reply@swappy.local>',
      to: guardianEmail,
      subject: 'Guardian notice: New account created',
      text: `Hi ${guardianName || 'Guardian'},\n\nAn account was created listing you as guardian for ${email}.\nAge: ${age}\n\n— Swappy`
    };
    const compiled = await transporter.sendMail(guardianMsg);
    const savedPath = writeOutbox(compiled);
    console.log(`[outbox] wrote guardian notice -> ${savedPath}`);

    const token = signJwt({ id: user.id, email: user.email });
    res.json({ ok: true, user, token });
  } catch (e) {
    const code = (e && e.message === 'email_in_use') ? 409 : 500;
    res.status(code).json({ ok: false, error: e.message || 'register_failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await findUserByEmail(email || '');
  if (!user) return res.status(401).json({ ok: false, error: 'invalid_credentials' });
  const ok = await verifyPassword(user, password || '');
  if (!ok) return res.status(401).json({ ok: false, error: 'invalid_credentials' });

  const token = signJwt({ id: user.id, email: user.email });
  const view = {
    id: user.id, email: user.email, age: user.age,
    guardianName: user.guardianName, guardianEmail: user.guardianEmail
  };
  res.json({ ok: true, user: view, token });
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body || {};
  const user = await findUserByEmail(email || '');
  // Always OK to avoid user enumeration
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + config.resetTokenExpiresMin * 60 * 1000;
  await saveResetToken(token, user.email, expiresAt);

  const link = `${config.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const emailMsg = {
    from: 'Swappy <no-reply@swappy.local>',
    to: user.email,
    subject: 'Reset your password',
    text: `Click to reset your password (expires in ${config.resetTokenExpiresMin} minutes): ${link}`,
    html: `Click to reset your password (expires in ${config.resetTokenExpiresMin} minutes): <a href="${link}">${link}</a>`
  };
  const compiled = await transporter.sendMail(emailMsg);
  const savedPath = writeOutbox(compiled);
  console.log(`[outbox] wrote password reset -> ${savedPath}`);

  res.json({ ok: true });
});

router.post('/reset', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ ok: false, error: 'token_and_newPassword_required' });

  const rec = await useResetToken(token);
  if (!rec) return res.status(400).json({ ok: false, error: 'invalid_or_used_token' });
  if (Date.now() > rec.expiresAt) return res.status(400).json({ ok: false, error: 'token_expired' });

  await setUserPassword(rec.email, newPassword);
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false });
  try {
    const payload = require('jsonwebtoken').verify(token, require('../config').config.jwtSecret);
    const { findUserById } = require('../db/filedb');
    const user = await findUserById(payload.id);
    if (!user) return res.status(401).json({ ok: false, error: 'user_not_found' });
    res.json({ ok: true, user });
  } catch {
    res.status(401).json({ ok: false });
  }
});

module.exports = router;

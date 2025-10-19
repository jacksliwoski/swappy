import axios from 'axios';
import https from 'https';
import fs from 'fs';
import { config } from './config.js';

function buildAgent() {
  if (config.mock) return null;
  const crt = fs.readFileSync(config.visaClientCrt);
  const key = fs.readFileSync(config.visaClientKey);
  const ca  = fs.readFileSync(config.visaRootCa);
  return new https.Agent({ cert: crt, key: key, ca: ca, keepAlive: true, rejectUnauthorized: true });
}

export const visa = axios.create({
  baseURL: config.visaBaseUrl,
  timeout: 15000,
  httpsAgent: buildAgent(),
  auth: (config.visaUsername && config.visaPassword) ? { username: config.visaUsername, password: config.visaPassword } : undefined,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

export const maskPan = (pan='') => (String(pan).length>=4?`**** **** **** ${String(pan)[-4:]}`: '****');

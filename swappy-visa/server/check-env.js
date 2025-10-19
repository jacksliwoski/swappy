require('dotenv').config({ path: process.env.HOME + '/swappy/server/.env' });
const fs = require('fs');
console.log({
  CRT_EXISTS: fs.existsSync(process.env.VISA_CLIENT_CRT),
  KEY_EXISTS: fs.existsSync(process.env.VISA_CLIENT_KEY),
  CRT_PATH: process.env.VISA_CLIENT_CRT,
  KEY_PATH: process.env.VISA_CLIENT_KEY,
  USER_SET: !!process.env.VISA_USERNAME,
  PASS_SET: !!process.env.VISA_PASSWORD,
  MOCK: process.env.MOCK,
  PORT: process.env.PORT,
});

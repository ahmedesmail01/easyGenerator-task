import { readFileSync } from 'node:fs';

// Credentials are mounted only into the services that need them.
const password = readFileSync('/run/secrets/mongo_app_password', 'utf8').trim();
if (!password) throw new Error('Missing MongoDB application password');
process.env.MONGODB_URI = `mongodb://easygenerator:${encodeURIComponent(password)}@mongo:27017/easygenerator?authSource=easygenerator`;
await import('./dist/main.js');

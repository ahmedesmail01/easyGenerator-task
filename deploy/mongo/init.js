const fs = require('fs');
const password = fs.readFileSync('/run/secrets/mongo_app_password', 'utf8').trim();
if (!password) throw new Error('MongoDB application password is empty');
db.getSiblingDB('easygenerator').createUser({
  user: 'easygenerator',
  pwd: password,
  roles: [{ role: 'readWrite', db: 'easygenerator' }],
});

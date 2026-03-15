const crypto = require('crypto');

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = { randomId };

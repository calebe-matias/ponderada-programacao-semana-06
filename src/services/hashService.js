const crypto = require('crypto');

class HashService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async generate(signedDocument) {
    const durationMs = this.overrides.durationMs ?? 12;
    const value = crypto.createHash('sha256').update(signedDocument.content).digest('hex');

    return {
      hashArtifact: {
        algorithm: 'SHA-256',
        value
      },
      trace: {
        protocol: this.config.protocol,
        version: this.config.version,
        durationMs,
        status: 'SUCCESS'
      }
    };
  }
}

module.exports = HashService;

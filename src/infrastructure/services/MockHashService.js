const crypto = require('crypto');

class MockHashService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async generate(payload) {
    const durationMs = this.overrides.durationMs ?? 12;
    const value = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      algorithm: 'SHA-256',
      value,
      protocol: this.config.protocol,
      version: this.config.version,
      durationMs,
      status: 'SUCCESS'
    };
  }
}

module.exports = MockHashService;

const TestamentRecord = require('../testamentRecord');
const { randomId } = require('../utils');

class MongoTestamentRepository {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
    this.items = [];
  }

  async save(payload) {
    const durationMs = this.overrides.durationMs ?? 90;
    const record = new TestamentRecord({
      testamentId: randomId('testament'),
      ...payload
    });
    this.items.push(record);

    return {
      record,
      trace: {
        protocol: this.config.protocol,
        version: this.config.version,
        durationMs,
        status: 'SUCCESS'
      }
    };
  }
}

module.exports = MongoTestamentRepository;

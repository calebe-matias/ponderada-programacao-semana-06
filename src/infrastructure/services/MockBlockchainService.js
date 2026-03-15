const { ExternalServiceError } = require('../../domain/errors/IntegrationError');

class MockBlockchainService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async anchor(hash) {
    if (this.overrides.forceError) {
      throw new ExternalServiceError('Falha ao ancorar hash na blockchain.', {
        provider: 'mock-blockchain',
        hash: hash.value
      });
    }

    const durationMs = this.overrides.durationMs ?? 2300;

    return {
      network: 'TestifyChain-Testnet',
      txHash: `0x${hash.value.slice(0, 64)}`,
      blockNumber: 1024,
      protocol: this.config.protocol,
      version: this.config.version,
      durationMs,
      status: 'SUCCESS'
    };
  }
}

module.exports = MockBlockchainService;

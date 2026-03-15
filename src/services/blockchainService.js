const { ExternalServiceError } = require('../errors');

class BlockchainService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async anchor(hashArtifact) {
    if (this.overrides.forceError) {
      throw new ExternalServiceError('Falha ao ancorar hash na blockchain.', {
        provider: 'mock-blockchain',
        hash: hashArtifact.value
      });
    }

    const durationMs = this.overrides.durationMs ?? 2300;

    return {
      receipt: {
        network: 'TestifyChain-Testnet',
        txHash: `0x${hashArtifact.value.slice(0, 64)}`,
        blockNumber: 1024
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

module.exports = BlockchainService;

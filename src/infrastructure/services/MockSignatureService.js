const { ExternalServiceError } = require('../../domain/errors/IntegrationError');

class MockSignatureService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async sign(document) {
    if (this.overrides.forceError) {
      throw new ExternalServiceError('Falha ao assinar digitalmente o documento.', {
        provider: 'mock-signature'
      });
    }

    const durationMs = this.overrides.durationMs ?? 800;

    return {
      signatureId: `sig_${Date.now()}`,
      signedDocument: `${document.content}\n\n[Assinado digitalmente]`,
      certificateSerial: 'ICPBR-TEST-001',
      protocol: this.config.protocol,
      version: this.config.version,
      durationMs,
      status: 'SUCCESS'
    };
  }
}

module.exports = MockSignatureService;

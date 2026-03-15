const { ExternalServiceError } = require('../errors');

class SignatureService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async sign(documentFile) {
    if (this.overrides.forceError) {
      throw new ExternalServiceError('Falha ao assinar digitalmente o documento.', {
        provider: 'mock-signature'
      });
    }

    const durationMs = this.overrides.durationMs ?? 800;

    return {
      signedDocument: {
        signatureId: `sig_${Date.now()}`,
        certificateSerial: 'ICPBR-TEST-001',
        content: `${documentFile.content}\n\n[Assinado digitalmente]`
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

module.exports = SignatureService;

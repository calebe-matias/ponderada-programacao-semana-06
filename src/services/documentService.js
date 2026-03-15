class DocumentService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async generate({ userId, transcript, consentVersion, witnessIds }) {
    const durationMs = this.overrides.durationMs ?? 450;
    const content = [
      'TESTAMENTO DIGITAL',
      `Titular: ${userId}`,
      `Texto transcrito: ${transcript.text}`,
      `Versao do consentimento: ${consentVersion}`,
      `Quantidade de testemunhas: ${witnessIds.length}`,
      `Gerado em: ${new Date().toISOString()}`
    ].join('\n');

    return {
      documentFile: {
        documentId: `doc_${Date.now()}`,
        format: 'PDF/A',
        content
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

module.exports = DocumentService;

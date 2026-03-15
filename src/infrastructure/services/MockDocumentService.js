class MockDocumentService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async generate({ userId, transcript }) {
    const durationMs = this.overrides.durationMs ?? 450;
    const content = [
      'TESTAMENTO DIGITAL',
      `Titular: ${userId}`,
      `Texto transcrito: ${transcript.text}`,
      `Gerado em: ${new Date().toISOString()}`
    ].join('\n');

    return {
      documentId: `doc_${Date.now()}`,
      format: 'PDF/A',
      content,
      protocol: this.config.protocol,
      version: this.config.version,
      durationMs,
      status: 'SUCCESS'
    };
  }
}

module.exports = MockDocumentService;

const { ExternalServiceError } = require('../../domain/errors/IntegrationError');

class MockTranscriptionService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async transcribe(videoRef) {
    if (this.overrides.forceError) {
      throw new ExternalServiceError('Falha no serviço de transcrição.', {
        cause: this.overrides.forceError,
        provider: 'mock-transcription'
      });
    }

    const durationMs = this.overrides.durationMs ?? 3000;

    if (durationMs > this.config.maxDurationMs) {
      throw new ExternalServiceError('Timeout na transcrição do vídeo.', {
        durationMs,
        maxDurationMs: this.config.maxDurationMs,
        provider: 'mock-transcription'
      });
    }

    return {
      transcriptId: `transcript_${Date.now()}`,
      text: `Eu, Renato, declaro neste vídeo a minha vontade digital com referência ao arquivo ${videoRef.objectKey}.`,
      language: 'pt-BR',
      confidence: 0.98,
      protocol: this.config.protocol,
      version: this.config.version,
      durationMs,
      status: 'SUCCESS'
    };
  }
}

module.exports = MockTranscriptionService;

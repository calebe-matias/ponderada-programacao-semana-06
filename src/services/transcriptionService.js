const { ExternalServiceError } = require('../errors');

class TranscriptionService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async transcribe(videoReference) {
    if (this.overrides.forceError) {
      throw new ExternalServiceError('Falha no servico de transcricao.', {
        cause: this.overrides.forceError,
        provider: 'mock-transcription'
      });
    }

    const durationMs = this.overrides.durationMs ?? 3000;

    if (durationMs > this.config.maxDurationMs) {
      throw new ExternalServiceError('Timeout na transcricao do video.', {
        durationMs,
        maxDurationMs: this.config.maxDurationMs,
        provider: 'mock-transcription'
      });
    }

    return {
      documentInput: {
        transcriptId: `transcript_${Date.now()}`,
        text: `Eu, Renato, declaro minha vontade digital com referencia ao arquivo ${videoReference.objectKey}.`,
        language: 'pt-BR',
        confidence: 0.98
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

module.exports = TranscriptionService;

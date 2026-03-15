const { ValidationError } = require('../../domain/errors/IntegrationError');
const { randomId } = require('./utils');

class MockGcsStorageService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async upload(file) {
    if (!file || !file.name || !file.mimeType || !file.sizeBytes) {
      throw new ValidationError('Arquivo de vídeo inválido para upload.', { file });
    }

    const durationMs = this.overrides.durationMs ?? 1200;

    return {
      bucket: 'testify-digital-wills',
      objectKey: `videos/${randomId('video')}-${file.name}`,
      url: `https://storage.googleapis.com/testify-digital-wills/${encodeURIComponent(file.name)}`,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      protocol: this.config.protocol,
      version: this.config.version,
      durationMs,
      status: 'SUCCESS'
    };
  }
}

module.exports = MockGcsStorageService;

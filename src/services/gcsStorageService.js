const { ValidationError } = require('../errors');
const { randomId } = require('../utils');

class GcsStorageService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async upload(file) {
    if (!file?.name || !file?.mimeType || !file?.sizeBytes) {
      throw new ValidationError('Arquivo de video invalido para upload.', { file });
    }

    const durationMs = this.overrides.durationMs ?? 1200;
    const objectKey = `videos/${randomId('video')}-${file.name}`;

    return {
      reference: {
        bucket: 'testify-digital-wills',
        objectKey,
        url: `https://storage.googleapis.com/testify-digital-wills/${encodeURIComponent(objectKey)}`,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes
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

module.exports = GcsStorageService;

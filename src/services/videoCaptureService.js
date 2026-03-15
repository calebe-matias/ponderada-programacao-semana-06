const { ValidationError } = require('../errors');
const { randomId } = require('../utils');

class VideoCaptureService {
  constructor(config, overrides = {}) {
    this.config = config;
    this.overrides = overrides;
  }

  async capture({ userId, videoFile, deviceInfo }) {
    if (!userId) {
      throw new ValidationError('Nao e possivel capturar video sem userId.');
    }

    if (!videoFile?.name || !videoFile?.mimeType || !videoFile?.sizeBytes) {
      throw new ValidationError('Arquivo de video invalido para captura.', { videoFile });
    }

    if (videoFile.mimeType !== 'video/mp4') {
      throw new ValidationError('Somente videos MP4 sao aceitos neste fluxo demonstrativo.', {
        mimeType: videoFile.mimeType
      });
    }

    const durationMs = this.overrides.durationMs ?? 1800;

    return {
      file: {
        captureId: randomId('capture'),
        capturedAt: new Date().toISOString(),
        name: videoFile.name,
        mimeType: videoFile.mimeType,
        sizeBytes: videoFile.sizeBytes,
        deviceInfo: deviceInfo || { platform: 'mobile', os: 'android', appVersion: '1.0.3' }
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

module.exports = VideoCaptureService;

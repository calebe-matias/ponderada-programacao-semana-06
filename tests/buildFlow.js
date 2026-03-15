const config = require('../src/config');
const CreateDigitalTestamentFlow = require('../src/createDigitalTestamentFlow');
const QualityGate = require('../src/qualityGate');
const VideoCaptureService = require('../src/services/videoCaptureService');
const GcsStorageService = require('../src/services/gcsStorageService');
const TranscriptionService = require('../src/services/transcriptionService');
const DocumentService = require('../src/services/documentService');
const SignatureService = require('../src/services/signatureService');
const HashService = require('../src/services/hashService');
const BlockchainService = require('../src/services/blockchainService');
const MongoTestamentRepository = require('../src/services/mongoTestamentRepository');

function buildFlow(overrides = {}) {
  const flow = new CreateDigitalTestamentFlow({
    config,
    videoCaptureService: new VideoCaptureService(config.services.videoCapture, overrides.videoCapture),
    storageService: new GcsStorageService(config.services.gcsUpload, overrides.gcsUpload),
    transcriptionService: new TranscriptionService(config.services.transcription, overrides.transcription),
    documentService: new DocumentService(config.services.documentGenerator, overrides.documentGenerator),
    signatureService: new SignatureService(config.services.digitalSignature, overrides.digitalSignature),
    hashService: new HashService(config.services.hashing, overrides.hashing),
    blockchainService: new BlockchainService(config.services.blockchain, overrides.blockchain),
    testamentRepository: new MongoTestamentRepository(config.services.mongoRepository, overrides.mongoRepository)
  });

  const qualityGate = new QualityGate(config);

  const input = {
    userId: 'user_renato_001',
    consentVersion: '1.2',
    videoFile: {
      name: 'testamento-video.mp4',
      mimeType: 'video/mp4',
      sizeBytes: 10485760
    },
    witnessIds: ['wit_1', 'wit_2'],
    deviceInfo: {
      platform: 'mobile',
      os: 'android',
      appVersion: '1.0.3'
    }
  };

  return { flow, qualityGate, input, config };
}

module.exports = buildFlow;

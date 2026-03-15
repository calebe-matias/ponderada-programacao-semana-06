const config = require('../../src/config/integration.config');
const CreateDigitalTestamentFlow = require('../../src/application/use-cases/CreateDigitalTestamentFlow');
const QualityGateService = require('../../src/application/services/QualityGateService');
const MockGcsStorageService = require('../../src/infrastructure/services/MockGcsStorageService');
const MockTranscriptionService = require('../../src/infrastructure/services/MockTranscriptionService');
const MockDocumentService = require('../../src/infrastructure/services/MockDocumentService');
const MockSignatureService = require('../../src/infrastructure/services/MockSignatureService');
const MockHashService = require('../../src/infrastructure/services/MockHashService');
const MockBlockchainService = require('../../src/infrastructure/services/MockBlockchainService');
const MockMongoTestamentRepository = require('../../src/infrastructure/repositories/MockMongoTestamentRepository');

function buildFlow(overrides = {}) {
  const flow = new CreateDigitalTestamentFlow({
    config,
    storageService: new MockGcsStorageService(config.services.gcsUpload, overrides.gcsUpload),
    transcriptionService: new MockTranscriptionService(config.services.transcription, overrides.transcription),
    documentService: new MockDocumentService(config.services.documentGenerator, overrides.documentGenerator),
    signatureService: new MockSignatureService(config.services.digitalSignature, overrides.digitalSignature),
    hashService: new MockHashService(config.services.hashing, overrides.hashing),
    blockchainService: new MockBlockchainService(config.services.blockchain, overrides.blockchain),
    testamentRepository: new MockMongoTestamentRepository(config.services.mongoRepository, overrides.mongoRepository)
  });

  const qualityGate = new QualityGateService(config);

  const input = {
    userId: 'user_renato_001',
    videoFile: {
      name: 'testamento-video.mp4',
      mimeType: 'video/mp4',
      sizeBytes: 10_485_760
    },
    witnessIds: ['wit_1', 'wit_2'],
    consentVersion: '1.2',
    deviceInfo: {
      platform: 'mobile',
      os: 'android',
      appVersion: '1.0.3'
    }
  };

  return { flow, qualityGate, input, config };
}

module.exports = buildFlow;

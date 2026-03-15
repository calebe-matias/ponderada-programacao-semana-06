const config = require('../../config/integration.config');
const CreateDigitalTestamentFlow = require('../../application/use-cases/CreateDigitalTestamentFlow');
const QualityGateService = require('../../application/services/QualityGateService');
const MockGcsStorageService = require('../../infrastructure/services/MockGcsStorageService');
const MockTranscriptionService = require('../../infrastructure/services/MockTranscriptionService');
const MockDocumentService = require('../../infrastructure/services/MockDocumentService');
const MockSignatureService = require('../../infrastructure/services/MockSignatureService');
const MockHashService = require('../../infrastructure/services/MockHashService');
const MockBlockchainService = require('../../infrastructure/services/MockBlockchainService');
const MockMongoTestamentRepository = require('../../infrastructure/repositories/MockMongoTestamentRepository');

async function main() {
  const flow = new CreateDigitalTestamentFlow({
    config,
    storageService: new MockGcsStorageService(config.services.gcsUpload),
    transcriptionService: new MockTranscriptionService(config.services.transcription),
    documentService: new MockDocumentService(config.services.documentGenerator),
    signatureService: new MockSignatureService(config.services.digitalSignature),
    hashService: new MockHashService(config.services.hashing),
    blockchainService: new MockBlockchainService(config.services.blockchain),
    testamentRepository: new MockMongoTestamentRepository(config.services.mongoRepository)
  });

  const qualityGate = new QualityGateService(config);

  try {
    const result = await flow.execute({
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
    });

    const quality = qualityGate.evaluate(result);

    console.log(JSON.stringify({
      summary: {
        testamentId: result.record.testamentId,
        userId: result.record.userId,
        txHash: result.record.blockchain.txHash,
        hash: result.record.hash.value,
        quality
      },
      trace: result.trace
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      message: error.message,
      code: error.code,
      trace: error.trace
    }, null, 2));
    process.exitCode = 1;
  }
}

main();

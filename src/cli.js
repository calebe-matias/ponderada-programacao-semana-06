const config = require('./config');
const CreateDigitalTestamentFlow = require('./createDigitalTestamentFlow');
const QualityGate = require('./qualityGate');
const VideoCaptureService = require('./services/videoCaptureService');
const GcsStorageService = require('./services/gcsStorageService');
const TranscriptionService = require('./services/transcriptionService');
const DocumentService = require('./services/documentService');
const SignatureService = require('./services/signatureService');
const HashService = require('./services/hashService');
const BlockchainService = require('./services/blockchainService');
const MongoTestamentRepository = require('./services/mongoTestamentRepository');

async function main() {
  const flow = new CreateDigitalTestamentFlow({
    config,
    videoCaptureService: new VideoCaptureService(config.services.videoCapture),
    storageService: new GcsStorageService(config.services.gcsUpload),
    transcriptionService: new TranscriptionService(config.services.transcription),
    documentService: new DocumentService(config.services.documentGenerator),
    signatureService: new SignatureService(config.services.digitalSignature),
    hashService: new HashService(config.services.hashing),
    blockchainService: new BlockchainService(config.services.blockchain),
    testamentRepository: new MongoTestamentRepository(config.services.mongoRepository)
  });

  const qualityGate = new QualityGate(config);

  try {
    const result = await flow.execute({
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
      details: error.details,
      trace: error.trace
    }, null, 2));
    process.exitCode = 1;
  }
}

main();

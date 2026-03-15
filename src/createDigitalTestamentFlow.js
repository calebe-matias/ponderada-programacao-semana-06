const IntegrationTrace = require('./integrationTrace');
const { ValidationError } = require('./errors');

class CreateDigitalTestamentFlow {
  constructor({
    config,
    videoCaptureService,
    storageService,
    transcriptionService,
    documentService,
    signatureService,
    hashService,
    blockchainService,
    testamentRepository
  }) {
    this.config = config;
    this.videoCaptureService = videoCaptureService;
    this.storageService = storageService;
    this.transcriptionService = transcriptionService;
    this.documentService = documentService;
    this.signatureService = signatureService;
    this.hashService = hashService;
    this.blockchainService = blockchainService;
    this.testamentRepository = testamentRepository;
  }

  validateInput(input) {
    if (!input?.userId) {
      throw new ValidationError('userId e obrigatorio.');
    }

    if (!input?.consentVersion) {
      throw new ValidationError('consentVersion e obrigatorio.');
    }

    if (!input?.videoFile?.name) {
      throw new ValidationError('videoFile.name e obrigatorio.');
    }
  }

  async execute(input) {
    const trace = new IntegrationTrace(this.config.flow.name, this.config.flow.version);

    try {
      this.validateInput(input);

      const capturedVideo = await this.videoCaptureService.capture({
        userId: input.userId,
        videoFile: input.videoFile,
        deviceInfo: input.deviceInfo
      });
      trace.addStep({ name: 'captureVideo', ...capturedVideo.trace });

      const storedVideo = await this.storageService.upload(capturedVideo.file);
      trace.addStep({ name: 'uploadVideo', ...storedVideo.trace });

      const transcript = await this.transcriptionService.transcribe(storedVideo.reference);
      trace.addStep({ name: 'transcribeVideo', ...transcript.trace });

      const document = await this.documentService.generate({
        userId: input.userId,
        transcript: transcript.documentInput,
        consentVersion: input.consentVersion,
        witnessIds: input.witnessIds || []
      });
      trace.addStep({ name: 'generateDocument', ...document.trace });

      const signature = await this.signatureService.sign(document.documentFile);
      trace.addStep({ name: 'signDocument', ...signature.trace });

      const hash = await this.hashService.generate(signature.signedDocument);
      trace.addStep({ name: 'generateHash', ...hash.trace });

      const blockchain = await this.blockchainService.anchor(hash.hashArtifact);
      trace.addStep({ name: 'anchorHashOnBlockchain', ...blockchain.trace });

      const saveResult = await this.testamentRepository.save({
        userId: input.userId,
        capturedVideo: capturedVideo.file,
        storedVideo: storedVideo.reference,
        transcript: transcript.documentInput,
        document: document.documentFile,
        signature: signature.signedDocument,
        hash: hash.hashArtifact,
        blockchain: blockchain.receipt,
        audit: {
          consentVersion: input.consentVersion,
          witnessCount: input.witnessIds?.length || 0,
          sourceDevice: input.deviceInfo || { platform: 'mobile', os: 'android', appVersion: '1.0.3' }
        }
      });
      trace.addStep({ name: 'saveMetadataOnMongo', ...saveResult.trace });
      trace.finish();

      return {
        record: saveResult.record,
        trace
      };
    } catch (error) {
      trace.addError(error);
      trace.finish();
      throw Object.assign(error, { trace });
    }
  }
}

module.exports = CreateDigitalTestamentFlow;

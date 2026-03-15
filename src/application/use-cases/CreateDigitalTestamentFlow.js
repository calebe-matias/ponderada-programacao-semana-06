const IntegrationTrace = require('../../infrastructure/observability/IntegrationTrace');
const { ValidationError } = require('../../domain/errors/IntegrationError');

class CreateDigitalTestamentFlow {
  constructor({
    config,
    storageService,
    transcriptionService,
    documentService,
    signatureService,
    hashService,
    blockchainService,
    testamentRepository
  }) {
    this.config = config;
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
      throw new ValidationError('userId é obrigatório.');
    }

    if (!input?.videoFile?.name) {
      throw new ValidationError('videoFile.name é obrigatório.');
    }

    if (input.videoFile.mimeType !== 'video/mp4') {
      throw new ValidationError('Somente vídeos MP4 são aceitos neste fluxo demonstrativo.', {
        mimeType: input.videoFile.mimeType
      });
    }
  }

  async execute(input) {
    const trace = new IntegrationTrace(this.config.flow.name, this.config.flow.version);

    try {
      this.validateInput(input);

      const uploadedVideo = await this.storageService.upload(input.videoFile);
      trace.addStep({ name: 'uploadVideo', ...uploadedVideo });

      const transcript = await this.transcriptionService.transcribe(uploadedVideo);
      trace.addStep({ name: 'transcribeVideo', ...transcript });

      const document = await this.documentService.generate({
        userId: input.userId,
        transcript,
        video: uploadedVideo
      });
      trace.addStep({ name: 'generateDocument', ...document });

      const signature = await this.signatureService.sign(document);
      trace.addStep({ name: 'signDocument', ...signature });

      const hash = await this.hashService.generate(signature.signedDocument);
      trace.addStep({ name: 'generateHash', ...hash });

      const blockchain = await this.blockchainService.anchor(hash);
      trace.addStep({ name: 'anchorHashOnBlockchain', ...blockchain });

      const saveResult = await this.testamentRepository.save({
        userId: input.userId,
        video: uploadedVideo,
        transcript,
        document,
        signature,
        hash,
        blockchain,
        audit: {
          witnessCount: input.witnessIds?.length || 0,
          consentVersion: input.consentVersion || '1.0',
          sourceDevice: input.deviceInfo || { platform: 'mobile', os: 'ios/android' }
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

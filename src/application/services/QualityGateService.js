const { QualityGateError } = require('../../domain/errors/IntegrationError');

class QualityGateService {
  constructor(config) {
    this.config = config;
  }

  assertStepWithinPolicy(step, policy, stepName) {
    for (const field of this.config.quality.requiredTraceFields) {
      if (step[field] === undefined || step[field] === null) {
        throw new QualityGateError(`Campo obrigatório ausente no trace do passo ${stepName}.`, {
          stepName,
          missingField: field
        });
      }
    }

    if (step.durationMs > policy.maxDurationMs) {
      throw new QualityGateError(`SLA excedido no passo ${stepName}.`, {
        stepName,
        durationMs: step.durationMs,
        maxDurationMs: policy.maxDurationMs
      });
    }

    if (step.protocol !== policy.protocol) {
      throw new QualityGateError(`Protocolo divergente no passo ${stepName}.`, {
        stepName,
        expected: policy.protocol,
        actual: step.protocol
      });
    }

    if (step.version !== policy.version) {
      throw new QualityGateError(`Versão divergente no passo ${stepName}.`, {
        stepName,
        expected: policy.version,
        actual: step.version
      });
    }

    if (step.status !== 'SUCCESS') {
      throw new QualityGateError(`Passo ${stepName} não finalizou com sucesso.`, {
        stepName,
        status: step.status
      });
    }
  }

  evaluate(result) {
    const trace = result.trace;
    const policies = this.config.services;

    const byName = Object.fromEntries(trace.steps.map((step) => [step.name, step]));

    this.assertStepWithinPolicy(byName.uploadVideo, policies.gcsUpload, 'uploadVideo');
    this.assertStepWithinPolicy(byName.transcribeVideo, policies.transcription, 'transcribeVideo');
    this.assertStepWithinPolicy(byName.generateDocument, policies.documentGenerator, 'generateDocument');
    this.assertStepWithinPolicy(byName.signDocument, policies.digitalSignature, 'signDocument');
    this.assertStepWithinPolicy(byName.generateHash, policies.hashing, 'generateHash');
    this.assertStepWithinPolicy(byName.anchorHashOnBlockchain, policies.blockchain, 'anchorHashOnBlockchain');
    this.assertStepWithinPolicy(byName.saveMetadataOnMongo, policies.mongoRepository, 'saveMetadataOnMongo');

    if (trace.totalDurationMs() > this.config.quality.maxEndToEndMs) {
      throw new QualityGateError('Fluxo ponta a ponta excedeu o tempo máximo.', {
        totalDurationMs: trace.totalDurationMs(),
        maxEndToEndMs: this.config.quality.maxEndToEndMs
      });
    }

    if (this.config.quality.requireSha256 && result.record.hash.algorithm !== 'SHA-256') {
      throw new QualityGateError('Algoritmo de hash inválido.', {
        expected: 'SHA-256',
        actual: result.record.hash.algorithm
      });
    }

    if (this.config.quality.requireBlockchainReceipt && !result.record.blockchain.txHash) {
      throw new QualityGateError('Recibo de blockchain ausente.', {
        blockchain: result.record.blockchain
      });
    }

    return {
      status: 'APPROVED',
      totalDurationMs: trace.totalDurationMs(),
      checkedAt: new Date().toISOString()
    };
  }
}

module.exports = QualityGateService;

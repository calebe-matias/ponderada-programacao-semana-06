const { QualityGateError } = require('./errors');

class QualityGate {
  constructor(config) {
    this.config = config;
  }

  assertStepExists(stepName, step) {
    if (!step) {
      throw new QualityGateError(`Passo obrigatorio ausente no trace: ${stepName}.`, {
        stepName
      });
    }
  }

  assertStepWithinPolicy(step, policy, stepName) {
    this.assertStepExists(stepName, step);

    for (const field of this.config.quality.requiredTraceFields) {
      if (step[field] === undefined || step[field] === null) {
        throw new QualityGateError(`Campo obrigatorio ausente no trace do passo ${stepName}.`, {
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
      throw new QualityGateError(`Versao divergente no passo ${stepName}.`, {
        stepName,
        expected: policy.version,
        actual: step.version
      });
    }

    if (step.status !== 'SUCCESS') {
      throw new QualityGateError(`Passo ${stepName} nao finalizou com sucesso.`, {
        stepName,
        status: step.status
      });
    }
  }

  evaluate(result) {
    const trace = result.trace;
    const byName = Object.fromEntries(trace.steps.map((step) => [step.name, step]));

    for (const expectedStep of this.config.flow.expectedSteps) {
      this.assertStepWithinPolicy(
        byName[expectedStep.name],
        this.config.services[expectedStep.policyKey],
        expectedStep.name
      );
    }

    const totalDurationMs = trace.totalDurationMs();

    if (totalDurationMs > this.config.quality.maxEndToEndMs) {
      throw new QualityGateError('Fluxo ponta a ponta excedeu o tempo maximo.', {
        totalDurationMs,
        maxEndToEndMs: this.config.quality.maxEndToEndMs
      });
    }

    if (trace.errors.length > 0) {
      throw new QualityGateError('Fluxo contem erros registrados no trace.', {
        errors: trace.errors
      });
    }

    if (this.config.quality.requireSha256 && result.record.hash.algorithm !== 'SHA-256') {
      throw new QualityGateError('Algoritmo de hash invalido.', {
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
      checkedAt: new Date().toISOString(),
      stepCount: trace.steps.length,
      totalDurationMs
    };
  }
}

module.exports = QualityGate;

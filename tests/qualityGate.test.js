const test = require('node:test');
const assert = require('node:assert/strict');
const buildFlow = require('./buildFlow');

test('deve validar tempos, protocolos, versoes e recibo de blockchain no controle de qualidade', async () => {
  const { flow, qualityGate, input, config } = buildFlow();
  const result = await flow.execute(input);
  const quality = qualityGate.evaluate(result);

  assert.equal(quality.status, 'APPROVED');
  assert.ok(quality.totalDurationMs <= config.quality.maxEndToEndMs);
  assert.equal(quality.stepCount, config.flow.expectedSteps.length);
});

test('deve reprovar quando houver divergencia de protocolo configurado', async () => {
  const { flow, qualityGate, input } = buildFlow();
  const result = await flow.execute(input);

  const uploadStep = result.trace.steps.find((step) => step.name === 'uploadVideo');
  uploadStep.protocol = 'FTP';

  assert.throws(
    () => qualityGate.evaluate(result),
    (error) => {
      assert.equal(error.code, 'QUALITY_GATE_ERROR');
      assert.match(error.message, /Protocolo divergente/);
      return true;
    }
  );
});

test('deve reprovar quando faltar versao em um passo do trace', async () => {
  const { flow, qualityGate, input } = buildFlow();
  const result = await flow.execute(input);

  const signatureStep = result.trace.steps.find((step) => step.name === 'signDocument');
  signatureStep.version = null;

  assert.throws(
    () => qualityGate.evaluate(result),
    (error) => {
      assert.equal(error.code, 'QUALITY_GATE_ERROR');
      assert.match(error.message, /Campo obrigatorio ausente/);
      return true;
    }
  );
});

test('deve reprovar quando um passo obrigatorio nao aparecer no trace', async () => {
  const { flow, qualityGate, input } = buildFlow();
  const result = await flow.execute(input);

  result.trace.steps = result.trace.steps.filter((step) => step.name !== 'captureVideo');

  assert.throws(
    () => qualityGate.evaluate(result),
    (error) => {
      assert.equal(error.code, 'QUALITY_GATE_ERROR');
      assert.match(error.message, /Passo obrigatorio ausente/);
      return true;
    }
  );
});

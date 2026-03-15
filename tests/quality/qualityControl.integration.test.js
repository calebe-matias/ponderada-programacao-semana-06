const test = require('node:test');
const assert = require('node:assert/strict');
const buildFlow = require('../helpers/buildFlow');

test('deve validar tempos, protocolos, versões e recibo de blockchain no controle de qualidade', async () => {
  const { flow, qualityGate, input, config } = buildFlow();
  const result = await flow.execute(input);
  const quality = qualityGate.evaluate(result);

  assert.equal(quality.status, 'APPROVED');
  assert.ok(quality.totalDurationMs <= config.quality.maxEndToEndMs);

  const stepNames = result.trace.steps.map((step) => step.name);
  assert.deepEqual(stepNames, [
    'uploadVideo',
    'transcribeVideo',
    'generateDocument',
    'signDocument',
    'generateHash',
    'anchorHashOnBlockchain',
    'saveMetadataOnMongo'
  ]);
});

test('deve reprovar quando houver divergência de protocolo configurado', async () => {
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

test('deve reprovar quando faltar versão em um passo do trace', async () => {
  const { flow, qualityGate, input } = buildFlow();
  const result = await flow.execute(input);

  const signatureStep = result.trace.steps.find((step) => step.name === 'signDocument');
  signatureStep.version = null;

  assert.throws(
    () => qualityGate.evaluate(result),
    (error) => {
      assert.equal(error.code, 'QUALITY_GATE_ERROR');
      assert.match(error.message, /Campo obrigatório ausente/);
      return true;
    }
  );
});

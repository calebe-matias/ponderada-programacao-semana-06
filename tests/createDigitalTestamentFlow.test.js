const test = require('node:test');
const assert = require('node:assert/strict');
const buildFlow = require('./buildFlow');

test('deve executar o fluxo completo de criacao de testamento digital com sucesso', async () => {
  const { flow, qualityGate, input } = buildFlow();

  const result = await flow.execute(input);
  const quality = qualityGate.evaluate(result);

  assert.ok(result.record.testamentId);
  assert.equal(result.record.userId, input.userId);
  assert.equal(result.record.hash.algorithm, 'SHA-256');
  assert.ok(result.record.blockchain.txHash.startsWith('0x'));
  assert.equal(result.trace.steps.length, 8);
  assert.deepEqual(
    result.trace.steps.map((step) => step.name),
    [
      'captureVideo',
      'uploadVideo',
      'transcribeVideo',
      'generateDocument',
      'signDocument',
      'generateHash',
      'anchorHashOnBlockchain',
      'saveMetadataOnMongo'
    ]
  );
  assert.equal(result.trace.errors.length, 0);
  assert.equal(quality.status, 'APPROVED');
});

test('deve interromper o fluxo quando a transcricao exceder o SLA', async () => {
  const { flow, input } = buildFlow({
    transcription: { durationMs: 999999 }
  });

  await assert.rejects(
    () => flow.execute(input),
    (error) => {
      assert.equal(error.code, 'EXTERNAL_SERVICE_ERROR');
      assert.match(error.message, /Timeout na transcricao/);
      assert.deepEqual(
        error.trace.steps.map((step) => step.name),
        ['captureVideo', 'uploadVideo']
      );
      assert.equal(error.trace.errors.length, 1);
      return true;
    }
  );
});

test('deve registrar falha padronizada quando a blockchain rejeitar a operacao', async () => {
  const { flow, input } = buildFlow({
    blockchain: { forceError: true }
  });

  await assert.rejects(
    () => flow.execute(input),
    (error) => {
      assert.equal(error.code, 'EXTERNAL_SERVICE_ERROR');
      assert.match(error.message, /Falha ao ancorar hash na blockchain/);
      assert.equal(error.trace.steps.at(-1).name, 'generateHash');
      assert.equal(error.trace.errors[0].code, 'EXTERNAL_SERVICE_ERROR');
      return true;
    }
  );
});

test('deve rejeitar arquivo de video com mime type diferente de MP4', async () => {
  const { flow, input } = buildFlow();
  input.videoFile.mimeType = 'video/webm';

  await assert.rejects(
    () => flow.execute(input),
    (error) => {
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.match(error.message, /Somente videos MP4/);
      assert.equal(error.trace.steps.length, 0);
      assert.equal(error.trace.errors.length, 1);
      return true;
    }
  );
});

const test = require('node:test');
const assert = require('node:assert/strict');
const buildFlow = require('../helpers/buildFlow');

/*
 Correspondência simplificada com o Gherkin:
 - Fluxo completo concluído com sucesso
 - Falha por timeout no serviço de transcrição
 - Falha ao ancorar o hash na blockchain
*/

test('deve executar o fluxo completo de criação de testamento digital com sucesso', async () => {
  const { flow, qualityGate, input } = buildFlow();

  const result = await flow.execute(input);
  const quality = qualityGate.evaluate(result);

  assert.ok(result.record.testamentId);
  assert.equal(result.record.userId, input.userId);
  assert.equal(result.record.hash.algorithm, 'SHA-256');
  assert.ok(result.record.blockchain.txHash.startsWith('0x'));
  assert.equal(result.trace.steps.length, 7);
  assert.equal(result.trace.errors.length, 0);
  assert.equal(quality.status, 'APPROVED');
});

test('deve interromper o fluxo quando a transcrição exceder o SLA', async () => {
  const { flow, input } = buildFlow({
    transcription: { durationMs: 999999 }
  });

  await assert.rejects(
    () => flow.execute(input),
    (error) => {
      assert.equal(error.code, 'EXTERNAL_SERVICE_ERROR');
      assert.match(error.message, /Timeout na transcrição/);
      assert.equal(error.trace.steps.length, 1);
      assert.equal(error.trace.errors.length, 1);
      return true;
    }
  );
});

test('deve registrar falha padronizada quando a blockchain rejeitar a operação', async () => {
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

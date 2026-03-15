# Arquitetura do Fluxo de Integração

## Camadas

1. **Interfaces**
   - `src/interfaces/cli/runFlow.js`
   - Ponto de entrada para demonstrar a execução do fluxo.

2. **Application**
   - `CreateDigitalTestamentFlow.js`
   - Orquestra os casos de uso e a ordem das integrações.
   - `QualityGateService.js`
   - Aferição de qualidade da integração.

3. **Domain**
   - `TestamentRecord.js`
   - `IntegrationError.js`
   - Regras centrais, entidades e exceções padronizadas.

4. **Infrastructure**
   - Serviços mockados para GCS, transcrição, assinatura, blockchain e MongoDB.
   - `IntegrationTrace.js` para rastreabilidade.

## Componentes externos simulados

- App mobile Testify
- Google Cloud Storage
- Serviço de transcrição
- Serviço de geração documental
- Serviço de assinatura digital
- Gateway de blockchain
- MongoDB

## Processo macro

1. Captura do vídeo no dispositivo móvel.
2. Upload seguro do vídeo.
3. Transcrição do conteúdo.
4. Geração do documento escrito.
5. Assinatura digital.
6. Geração de hash SHA-256.
7. Ancoragem do hash em blockchain.
8. Persistência de metadados e trilha de auditoria.

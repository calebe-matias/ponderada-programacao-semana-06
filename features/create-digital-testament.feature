Feature: Criação de testamento digital no App da Testify
  Como sistema de integração da Testify
  Quero orquestrar o fluxo de gravação, upload, transcrição, geração documental, assinatura, hash, blockchain e persistência
  Para garantir integridade, rastreabilidade e qualidade técnica do testamento digital

  Background:
    Given um vídeo MP4 válido foi gravado no aplicativo mobile
    And o usuário consentiu com a versão vigente do termo digital
    And os serviços externos estão disponíveis com protocolo e versão compatíveis

  Scenario: Fluxo completo concluído com sucesso
    When o vídeo é enviado ao Google Cloud Storage
    And o conteúdo é transcrito
    And um documento escrito é gerado
    And o documento é assinado digitalmente
    And um hash SHA-256 é criado
    And o hash é ancorado em blockchain
    And os metadados são persistidos no MongoDB
    Then o sistema deve retornar um identificador de testamento
    And o trace de integração deve conter tempos, protocolos, versões e status de cada etapa
    And o controle de qualidade deve aprovar o fluxo

  Scenario: Falha por timeout no serviço de transcrição
    When o tempo de resposta da transcrição excede o SLA configurado
    Then o fluxo deve ser interrompido com erro padronizado
    And o trace deve registrar a exceção e o ponto de falha

  Scenario: Falha ao ancorar o hash na blockchain
    When o gateway de blockchain rejeita a operação
    Then o fluxo deve responder com tratamento de exceção padronizado
    And nenhum registro final deve ser considerado aprovado pelo controle de qualidade

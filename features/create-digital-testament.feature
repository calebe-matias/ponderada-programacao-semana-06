Feature: Criacao de testamento digital no App da Testify
  Como sistema de integracao da Testify
  Quero orquestrar gravacao, upload, transcricao, geracao documental, assinatura, hash, blockchain e persistencia
  Para garantir integridade, rastreabilidade e qualidade tecnica do testamento digital

  Background:
    Given o usuario iniciou a criacao do testamento no aplicativo mobile
    And o usuario consentiu com a versao vigente do termo digital
    And os servicos externos estao disponiveis com protocolo e versao compativeis

  Scenario: Fluxo completo concluido com sucesso
    When o video e capturado no aplicativo
    And o video e enviado ao Google Cloud Storage
    And o conteudo e transcrito
    And um documento escrito e gerado
    And o documento e assinado digitalmente
    And um hash SHA-256 e criado
    And o hash e ancorado em blockchain
    And os metadados sao persistidos no MongoDB
    Then o sistema deve retornar um identificador de testamento
    And o trace de integracao deve conter tempos, protocolos, versoes e status de cada etapa
    And o controle de qualidade deve aprovar o fluxo

  Scenario: Falha por timeout no servico de transcricao
    When o tempo de resposta da transcricao excede o SLA configurado
    Then o fluxo deve ser interrompido com erro padronizado
    And o trace deve registrar a excecao e o ponto de falha

  Scenario: Falha ao ancorar o hash na blockchain
    When o gateway de blockchain rejeita a operacao
    Then o fluxo deve responder com tratamento de excecao padronizado
    And nenhum registro final deve ser considerado aprovado pelo controle de qualidade

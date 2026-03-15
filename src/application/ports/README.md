# Ports

Este diretório contém as abstrações de entrada/saída da camada de aplicação.
Neste exemplo acadêmico, os contratos são expressos por convenção e injeção de dependência.

Contratos esperados:
- storageService.upload(file)
- transcriptionService.transcribe(videoRef)
- documentService.generate(input)
- signatureService.sign(document)
- hashService.generate(payload)
- blockchainService.anchor(hash)
- testamentRepository.save(record)

module.exports = {
  flow: {
    name: 'create-digital-testament',
    version: '1.0.0',
    environment: 'academic-demo',
    expectedSteps: [
      { name: 'captureVideo', policyKey: 'videoCapture' },
      { name: 'uploadVideo', policyKey: 'gcsUpload' },
      { name: 'transcribeVideo', policyKey: 'transcription' },
      { name: 'generateDocument', policyKey: 'documentGenerator' },
      { name: 'signDocument', policyKey: 'digitalSignature' },
      { name: 'generateHash', policyKey: 'hashing' },
      { name: 'anchorHashOnBlockchain', policyKey: 'blockchain' },
      { name: 'saveMetadataOnMongo', policyKey: 'mongoRepository' }
    ]
  },
  quality: {
    requiredTraceFields: ['protocol', 'version', 'durationMs', 'status'],
    maxEndToEndMs: 120000,
    requireBlockchainReceipt: true,
    requireSha256: true
  },
  services: {
    videoCapture: {
      protocol: 'APP_INTERNAL_SECURE_STORAGE',
      version: 'testify-mobile@1.0.3',
      maxDurationMs: 4000
    },
    gcsUpload: {
      protocol: 'HTTPS/TLS 1.3',
      version: 'GCS JSON API v1',
      maxDurationMs: 15000
    },
    transcription: {
      protocol: 'HTTPS/TLS 1.3',
      version: 'Speech-to-Text API v2',
      maxDurationMs: 45000
    },
    documentGenerator: {
      protocol: 'INTERNAL_EVENT',
      version: 'document-service@1.0.0',
      maxDurationMs: 5000
    },
    digitalSignature: {
      protocol: 'HTTPS/TLS 1.3 + CMS/PKCS#7',
      version: 'signature-service@2.1.0',
      maxDurationMs: 10000
    },
    hashing: {
      protocol: 'INTERNAL_FUNCTION_CALL',
      version: 'sha256@1.0.0',
      maxDurationMs: 1000
    },
    blockchain: {
      protocol: 'JSON-RPC 2.0 over HTTPS',
      version: 'blockchain-gateway@1.3.0',
      maxDurationMs: 20000
    },
    mongoRepository: {
      protocol: 'MongoDB Wire Protocol over TLS',
      version: 'mongodb@8.0',
      maxDurationMs: 5000
    }
  }
};

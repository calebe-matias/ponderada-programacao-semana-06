class TestamentRecord {
  constructor({
    testamentId,
    userId,
    capturedVideo,
    storedVideo,
    transcript,
    document,
    signature,
    hash,
    blockchain,
    audit,
    createdAt
  }) {
    this.testamentId = testamentId;
    this.userId = userId;
    this.capturedVideo = capturedVideo;
    this.storedVideo = storedVideo;
    this.transcript = transcript;
    this.document = document;
    this.signature = signature;
    this.hash = hash;
    this.blockchain = blockchain;
    this.audit = audit;
    this.createdAt = createdAt ?? new Date().toISOString();
  }
}

module.exports = TestamentRecord;

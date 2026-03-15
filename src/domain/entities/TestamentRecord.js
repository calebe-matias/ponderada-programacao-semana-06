class TestamentRecord {
  constructor({
    testamentId,
    userId,
    video,
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
    this.video = video;
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

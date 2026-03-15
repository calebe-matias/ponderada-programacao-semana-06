class IntegrationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends IntegrationError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

class ExternalServiceError extends IntegrationError {
  constructor(message, details = {}) {
    super(message, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

class QualityGateError extends IntegrationError {
  constructor(message, details = {}) {
    super(message, 'QUALITY_GATE_ERROR', details);
  }
}

module.exports = {
  IntegrationError,
  ValidationError,
  ExternalServiceError,
  QualityGateError
};

class IntegrationTrace {
  constructor(flowName, flowVersion) {
    this.flowName = flowName;
    this.flowVersion = flowVersion;
    this.startedAt = new Date().toISOString();
    this.steps = [];
    this.errors = [];
    this.endedAt = null;
  }

  addStep(step) {
    this.steps.push({
      ...step,
      loggedAt: new Date().toISOString()
    });
  }

  addError(error) {
    this.errors.push({
      name: error.name,
      code: error.code || 'UNCLASSIFIED_ERROR',
      message: error.message,
      details: error.details || {},
      loggedAt: new Date().toISOString()
    });
  }

  finish() {
    this.endedAt = new Date().toISOString();
  }

  totalDurationMs() {
    return this.steps.reduce((total, step) => total + (step.durationMs || 0), 0);
  }
}

module.exports = IntegrationTrace;

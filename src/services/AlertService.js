const { NotFoundError, ValidationError } = require('../errors');

class AlertService {
  constructor(alertRepo) {
    this.alertRepo = alertRepo;
  }

  list({ status, deviceId } = {}) {
    if (status && !['active', 'resolved'].includes(status)) {
      throw new ValidationError('status filter must be "active" or "resolved"');
    }
    return this.alertRepo.findAll({ status, deviceId });
  }

  resolve(id) {
    const alert = this.alertRepo.findById(id);
    if (!alert) throw new NotFoundError(`Alert ${id} not found`);
    if (alert.status === 'resolved') {
      throw new ValidationError(`Alert ${id} is already resolved`);
    }
    return this.alertRepo.update(id, { status: 'resolved', resolvedAt: new Date().toISOString() });
  }
}

module.exports = { AlertService };

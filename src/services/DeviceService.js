const { createDevice } = require('../models/Device');
const { isValidDeviceType } = require('../config/deviceTypes');
const { NotFoundError, ValidationError } = require('../errors');

class DeviceService {
  /**
   * @param {import('../repositories/InMemoryDeviceRepository').InMemoryDeviceRepository} deviceRepo
   * @param {import('../repositories/InMemoryReadingRepository').InMemoryReadingRepository} readingRepo
   */
  constructor(deviceRepo, readingRepo) {
    this.deviceRepo = deviceRepo;
    this.readingRepo = readingRepo;
  }

  list() {
    return this.deviceRepo.findAll();
  }

  getById(id) {
    const device = this.deviceRepo.findById(id);
    if (!device) throw new NotFoundError(`Device ${id} not found`);
    return device;
  }

  create({ name, type, status, thresholdOverride }) {
    if (!name || !name.trim()) {
      throw new ValidationError('Device name is required');
    }
    if (!isValidDeviceType(type)) {
      throw new ValidationError(`Unknown device type "${type}"`);
    }
    if (status && !['active', 'inactive'].includes(status)) {
      throw new ValidationError('Status must be "active" or "inactive"');
    }
    if (thresholdOverride) {
      this._validateRange(thresholdOverride);
    }

    const device = createDevice({ name: name.trim(), type, status, thresholdOverride });
    return this.deviceRepo.create(device);
  }

  update(id, patch) {
    this.getById(id); // throws NotFoundError if missing

    if (patch.type && !isValidDeviceType(patch.type)) {
      throw new ValidationError(`Unknown device type "${patch.type}"`);
    }
    if (patch.status && !['active', 'inactive'].includes(patch.status)) {
      throw new ValidationError('Status must be "active" or "inactive"');
    }
    if (patch.thresholdOverride) {
      this._validateRange(patch.thresholdOverride);
    }
    if (patch.name !== undefined && !patch.name.trim()) {
      throw new ValidationError('Device name cannot be empty');
    }

    return this.deviceRepo.update(id, patch);
  }

  delete(id) {
    this.getById(id); // throws if missing
    // Cascade: a device's readings are meaningless once the device is gone.
    this.readingRepo.deleteByDevice(id);
    return this.deviceRepo.delete(id);
  }

  _validateRange({ min, max }) {
    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new ValidationError('thresholdOverride requires numeric min and max');
    }
    if (min >= max) {
      throw new ValidationError('thresholdOverride min must be less than max');
    }
  }
}

module.exports = { DeviceService };

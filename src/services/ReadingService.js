const { createReading } = require('../models/Reading');
const { createAlert } = require('../models/Alert');
const { getDefaultUnit } = require('../config/deviceTypes');
const { ValidationError } = require('../errors');

class ReadingService {
  /**
   * @param {import('../repositories/InMemoryReadingRepository').InMemoryReadingRepository} readingRepo
   * @param {import('../repositories/InMemoryAlertRepository').InMemoryAlertRepository} alertRepo
   * @param {import('./AnomalyDetectionService').AnomalyDetectionService} anomalyService
   * @param {import('./DeviceService').DeviceService} deviceService
   */
  constructor(readingRepo, alertRepo, anomalyService, deviceService) {
    this.readingRepo = readingRepo;
    this.alertRepo = alertRepo;
    this.anomalyService = anomalyService;
    this.deviceService = deviceService;
  }

  /**
   * Submits a new reading for a device, runs anomaly detection, and
   * creates an Alert if the reading is out of range.
   * Returns both the stored reading and the alert (if any) so callers
   * (API layer) can report both in one response.
   */
  submit(deviceId, { value, unit, timestamp }) {
    const device = this.deviceService.getById(deviceId); // throws NotFoundError if missing
    if (device.status !== 'active') {
      throw new ValidationError('Cannot submit readings for an inactive device');
    }
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ValidationError('Reading value must be a number');
    }
    if (timestamp && Number.isNaN(new Date(timestamp).getTime())) {
      throw new ValidationError('Reading timestamp is not a valid date');
    }

    const resolvedUnit = unit || getDefaultUnit(device.type) || '';
    const reading = createReading({ deviceId, value, unit: resolvedUnit, timestamp });
    this.readingRepo.create(reading);

    let alert = null;
    const evaluation = this.anomalyService.evaluate(device, reading);
    if (evaluation.triggered) {
      alert = createAlert({
        deviceId,
        readingId: reading.id,
        value: reading.value,
        timestamp: reading.timestamp,
        message: evaluation.message,
      });
      this.alertRepo.create(alert);
    }

    return { reading, alert };
  }

  /**
   * @param {string} deviceId
   * @param {{from?: string, to?: string, limit?: number}} filters
   */
  list(deviceId, filters) {
    this.deviceService.getById(deviceId); // 404s if device doesn't exist
    return this.readingRepo.findByDevice(deviceId, filters);
  }
}

module.exports = { ReadingService };

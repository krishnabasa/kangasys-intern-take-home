const { InMemoryDeviceRepository } = require('./repositories/InMemoryDeviceRepository');
const { InMemoryReadingRepository } = require('./repositories/InMemoryReadingRepository');
const { InMemoryAlertRepository } = require('./repositories/InMemoryAlertRepository');

const { AnomalyDetectionService } = require('./services/AnomalyDetectionService');
const { DeviceService } = require('./services/DeviceService');
const { ReadingService } = require('./services/ReadingService');
const { AlertService } = require('./services/AlertService');

/**
 * Builds a fresh, fully-wired set of repositories + services.
 * Used by both the real server and tests, so tests never share state
 * with each other or with the running app.
 */
function buildContainer() {
  const deviceRepo = new InMemoryDeviceRepository();
  const readingRepo = new InMemoryReadingRepository();
  const alertRepo = new InMemoryAlertRepository();

  const anomalyService = new AnomalyDetectionService();
  const deviceService = new DeviceService(deviceRepo, readingRepo);
  const readingService = new ReadingService(readingRepo, alertRepo, anomalyService, deviceService);
  const alertService = new AlertService(alertRepo);

  return {
    deviceRepo,
    readingRepo,
    alertRepo,
    anomalyService,
    deviceService,
    readingService,
    alertService,
  };
}

module.exports = { buildContainer };

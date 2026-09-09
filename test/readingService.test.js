const test = require('node:test');
const assert = require('node:assert/strict');

const { ReadingService } = require('../src/services/ReadingService');

function makeService({
  deviceStatus = 'active',
  anomalyTriggered = false,
} = {}) {
  const readings = [];
  const alerts = [];

  const readingRepo = {
    create(reading) {
      readings.push(reading);
      return reading;
    },

    findByDevice(deviceId) {
      return readings.filter((reading) => reading.deviceId === deviceId);
    },
  };

  const alertRepo = {
    create(alert) {
      alerts.push(alert);
      return alert;
    },
  };

  const deviceService = {
    getById(id) {
      return {
        id,
        name: 'Test Temperature Sensor',
        type: 'temperature-sensor',
        status: deviceStatus,
      };
    },
  };

  const anomalyService = {
    evaluate() {
      return anomalyTriggered
        ? {
            triggered: true,
            message: 'Reading exceeds the maximum threshold',
          }
        : {
            triggered: false,
          };
    },
  };

  return {
    service: new ReadingService(
      readingRepo,
      alertRepo,
      anomalyService,
      deviceService
    ),
    readings,
    alerts,
  };
}

test('stores a valid reading', () => {
  const { service, readings } = makeService();

  const result = service.submit('dev-test', {
    value: 25,
  });

  assert.equal(readings.length, 1);
  assert.equal(result.reading.value, 25);
  assert.equal(result.reading.deviceId, 'dev-test');
  assert.equal(result.reading.unit, '°C');
  assert.equal(result.alert, null);
});

test('rejects a non-numeric reading value', () => {
  const { service } = makeService();

  assert.throws(
    () =>
      service.submit('dev-test', {
        value: '25',
      }),
    /Reading value must be a number/
  );
});

test('rejects an invalid timestamp', () => {
  const { service } = makeService();

  assert.throws(
    () =>
      service.submit('dev-test', {
        value: 25,
        timestamp: 'not-a-date',
      }),
    /Reading timestamp is not a valid date/
  );
});

test('creates an alert when anomaly detection is triggered', () => {
  const { service, alerts } = makeService({
    anomalyTriggered: true,
  });

  const result = service.submit('dev-test', {
    value: 70,
  });

  assert.equal(alerts.length, 1);
  assert.ok(result.alert);
  assert.equal(result.alert.deviceId, 'dev-test');
  assert.match(
    result.alert.message,
    /exceeds the maximum threshold/
  );
});

test('does not create an alert for a normal reading', () => {
  const { service, alerts } = makeService({
    anomalyTriggered: false,
  });

  const result = service.submit('dev-test', {
    value: 25,
  });

  assert.equal(alerts.length, 0);
  assert.equal(result.alert, null);
  test('rejects readings for an inactive device', () => {
  const { service } = makeService({
    deviceStatus: 'inactive',
  });

  assert.throws(
    () =>
      service.submit('dev-test', {
        value: 25,
      }),
    /Cannot submit readings for an inactive device/
  );
});
});
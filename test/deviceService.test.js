const test = require('node:test');
const assert = require('node:assert/strict');

const { DeviceService } = require('../src/services/DeviceService');
const {
  InMemoryDeviceRepository,
} = require('../src/repositories/InMemoryDeviceRepository');
const {
  InMemoryReadingRepository,
} = require('../src/repositories/InMemoryReadingRepository');

function makeService() {
  const deviceRepo = new InMemoryDeviceRepository();
  const readingRepo = new InMemoryReadingRepository();

  return {
    service: new DeviceService(deviceRepo, readingRepo),
    deviceRepo,
    readingRepo,
  };
}

test('creates a valid device', () => {
  const { service } = makeService();

  const device = service.create({
    name: 'Test Temperature Sensor',
    type: 'temperature-sensor',
    status: 'active',
  });

  assert.equal(device.name, 'Test Temperature Sensor');
  assert.equal(device.type, 'temperature-sensor');
  assert.equal(device.status, 'active');
});

test('rejects an unknown device type', () => {
  const { service } = makeService();

  assert.throws(
    () =>
      service.create({
        name: 'Unknown Sensor',
        type: 'unknown-sensor',
        status: 'active',
      }),
    /Unknown device type/
  );
});

test('updates an existing device', () => {
  const { service } = makeService();

  const device = service.create({
    name: 'Original Name',
    type: 'temperature-sensor',
    status: 'active',
  });

  const updated = service.update(device.id, {
    name: 'Updated Name',
    status: 'inactive',
  });

  assert.equal(updated.name, 'Updated Name');
  assert.equal(updated.status, 'inactive');
});

test('deletes an existing device', () => {
  const { service } = makeService();

  const device = service.create({
    name: 'Delete Me',
    type: 'temperature-sensor',
    status: 'active',
  });

  service.delete(device.id);

  assert.throws(
    () => service.getById(device.id),
    /not found/
  );
});

test('rejects invalid threshold override', () => {
  const { service } = makeService();

  assert.throws(
    () =>
      service.create({
        name: 'Bad Threshold Device',
        type: 'temperature-sensor',
        status: 'active',
        thresholdOverride: {
          min: 50,
          max: 10,
        },
      }),
    /min must be less than max/
  );
});
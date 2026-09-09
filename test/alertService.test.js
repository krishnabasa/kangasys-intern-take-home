const test = require('node:test');
const assert = require('node:assert/strict');

const { AlertService } = require('../src/services/AlertService');

function createAlertRepo(alerts = []) {
  return {
    alerts,

    findAll({ status, deviceId } = {}) {
      return this.alerts.filter((alert) => {
        if (status && alert.status !== status) return false;
        if (deviceId && alert.deviceId !== deviceId) return false;
        return true;
      });
    },

    findById(id) {
      return this.alerts.find((alert) => alert.id === id);
    },

    update(id, patch) {
      const alert = this.findById(id);
      if (!alert) return null;

      Object.assign(alert, patch);
      return alert;
    },
  };
}

test('resolves an active alert', () => {
  const repo = createAlertRepo([
    {
      id: 'alert-1',
      deviceId: 'dev-test',
      status: 'active',
    },
  ]);

  const service = new AlertService(repo);

  const result = service.resolve('alert-1');

  assert.equal(result.status, 'resolved');
  assert.ok(result.resolvedAt);
});

test('rejects resolving an already resolved alert', () => {
  const repo = createAlertRepo([
    {
      id: 'alert-1',
      deviceId: 'dev-test',
      status: 'resolved',
    },
  ]);

  const service = new AlertService(repo);

  assert.throws(
    () => service.resolve('alert-1'),
    /already resolved/
  );
});

test('rejects resolving an alert that does not exist', () => {
  const repo = createAlertRepo([]);

  const service = new AlertService(repo);

  assert.throws(
    () => service.resolve('missing-alert'),
    /not found/
  );
});

test('rejects invalid alert status filter', () => {
  const repo = createAlertRepo([]);

  const service = new AlertService(repo);

  assert.throws(
    () => service.list({ status: 'invalid' }),
    /status filter must be/
  );
});
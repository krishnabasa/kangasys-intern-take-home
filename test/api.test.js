const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../api/index');

test('GET /api/devices returns the seeded devices', async () => {
  const response = await request(app)
    .get('/api/devices')
    .expect(200);

  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length > 0);
});

test('POST /api/devices creates a device', async () => {
  const response = await request(app)
    .post('/api/devices')
    .send({
      name: 'API Test Sensor',
      type: 'temperature-sensor',
      status: 'active',
    })
    .expect(201);

  assert.equal(response.body.name, 'API Test Sensor');
  assert.equal(response.body.type, 'temperature-sensor');
  assert.equal(response.body.status, 'active');
});

test('DELETE /api/devices/:id deletes a device', async () => {
  const created = await request(app)
    .post('/api/devices')
    .send({
      name: 'Delete API Sensor',
      type: 'temperature-sensor',
      status: 'active',
    })
    .expect(201);

  const id = created.body.id;

  await request(app)
    .delete(`/api/devices/${id}`)
    .expect(204);

  await request(app)
    .get(`/api/devices/${id}`)
    .expect(404);
});

test('POST reading for inactive device is rejected', async () => {
  const created = await request(app)
    .post('/api/devices')
    .send({
      name: 'Inactive API Sensor',
      type: 'temperature-sensor',
      status: 'inactive',
    })
    .expect(201);

  await request(app)
    .post(`/api/devices/${created.body.id}/readings`)
    .send({
      value: 25,
    })
    .expect(400);
});

test('out-of-range reading creates an alert', async () => {
  const created = await request(app)
    .post('/api/devices')
    .send({
      name: 'Alert API Sensor',
      type: 'temperature-sensor',
      status: 'active',
      thresholdOverride: {
        min: 10,
        max: 30,
      },
    })
    .expect(201);

  const response = await request(app)
    .post(`/api/devices/${created.body.id}/readings`)
    .send({
      value: 50,
    })
    .expect(201);

  assert.ok(response.body.alert);
  assert.equal(response.body.alert.deviceId, created.body.id);
});
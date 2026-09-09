const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RangeThresholdRule,
} = require('../src/services/rules/RangeThresholdRule');

const device = {
  name: 'Test Temperature Sensor',
  type: 'temperature-sensor',
};

function reading(value) {
  return {
    value,
    unit: '°C',
  };
}

const range = {
  min: 10,
  max: 50,
};

test('value inside range is normal', () => {
  const rule = new RangeThresholdRule();

  const result = rule.evaluate(
    device,
    reading(25),
    range
  );

  assert.equal(result.triggered, false);
});

test('value at minimum boundary is normal', () => {
  const rule = new RangeThresholdRule();

  const result = rule.evaluate(
    device,
    reading(10),
    range
  );

  assert.equal(result.triggered, false);
});

test('value at maximum boundary is normal', () => {
  const rule = new RangeThresholdRule();

  const result = rule.evaluate(
    device,
    reading(50),
    range
  );

  assert.equal(result.triggered, false);
});

test('value below minimum triggers anomaly', () => {
  const rule = new RangeThresholdRule();

  const result = rule.evaluate(
    device,
    reading(5),
    range
  );

  assert.equal(result.triggered, true);
  assert.match(result.message, /below the minimum threshold/);
});

test('value above maximum triggers anomaly', () => {
  const rule = new RangeThresholdRule();

  const result = rule.evaluate(
    device,
    reading(60),
    range
  );

  assert.equal(result.triggered, true);
  assert.match(result.message, /exceeds the maximum threshold/);
});
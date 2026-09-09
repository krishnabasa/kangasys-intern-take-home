/**
 * Device Type Registry
 * ---------------------
 * Single source of truth for the fixed set of device types the system
 * understands, plus the *default* "normal range" used for anomaly
 * detection when a device does not define its own override.
 *
 * Adding a new device type next week = add one entry here.
 * No other file needs to change for the new type to be creatable,
 * ingestible, and monitored.
 */

const DEVICE_TYPES = Object.freeze({
  'temperature-sensor': {
    label: 'Temperature Sensor',
    unit: '°C',
    normalRange: { min: -10, max: 50 },
  },
  'pressure-gauge': {
    label: 'Pressure Gauge',
    unit: 'psi',
    normalRange: { min: 0, max: 150 },
  },
  'humidity-sensor': {
    label: 'Humidity Sensor',
    unit: '%',
    normalRange: { min: 10, max: 80 },
  },
  'vibration-sensor': {
    label: 'Vibration Sensor',
    unit: 'mm/s',
    normalRange: { min: 0, max: 12 },
  },
    'contact-sensor': {
    label: 'Contact Sensor',
    unit: 'state',
    normalRange: { min: 0, max: 1 },
  },
});

function isValidDeviceType(type) {
  return Object.prototype.hasOwnProperty.call(DEVICE_TYPES, type);
}

function getDefaultRange(type) {
  return DEVICE_TYPES[type] ? DEVICE_TYPES[type].normalRange : null;
}

function getDefaultUnit(type) {
  return DEVICE_TYPES[type] ? DEVICE_TYPES[type].unit : null;
}

function listDeviceTypes() {
  return Object.entries(DEVICE_TYPES).map(([type, cfg]) => ({ type, ...cfg }));
}

module.exports = {
  DEVICE_TYPES,
  isValidDeviceType,
  getDefaultRange,
  getDefaultUnit,
  listDeviceTypes,
};

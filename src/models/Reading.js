const { v4: uuid } = require('uuid');

/**
 * @typedef {Object} Reading
 * @property {string} id
 * @property {string} deviceId
 * @property {number} value
 * @property {string} unit
 * @property {string} timestamp - ISO timestamp (defaults to receipt time if not supplied)
 */

function createReading({ deviceId, value, unit, timestamp }) {
  return {
    id: uuid(),
    deviceId,
    value,
    unit,
    timestamp: timestamp || new Date().toISOString(),
  };
}

module.exports = { createReading };

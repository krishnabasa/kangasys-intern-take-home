const { v4: uuid } = require('uuid');

/**
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} name
 * @property {string} type            - one of DEVICE_TYPES keys
 * @property {'active'|'inactive'} status
 * @property {{min:number,max:number}|null} thresholdOverride - optional per-device override of the type's normal range
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

function createDevice({ name, type, status = 'active', thresholdOverride = null }) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name,
    type,
    status,
    thresholdOverride,
    createdAt: now,
    updatedAt: now,
  };
}

module.exports = { createDevice };

const { v4: uuid } = require('uuid');

/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {string} deviceId
 * @property {string} readingId
 * @property {number} value
 * @property {string} timestamp     - when the triggering reading occurred
 * @property {string} message
 * @property {'active'|'resolved'} status
 * @property {string|null} resolvedAt
 */

function createAlert({ deviceId, readingId, value, timestamp, message }) {
  return {
    id: uuid(),
    deviceId,
    readingId,
    value,
    timestamp,
    message,
    status: 'active',
    resolvedAt: null,
  };
}

module.exports = { createAlert };

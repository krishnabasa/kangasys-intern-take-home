class InMemoryReadingRepository {
  constructor() {
    /** @type {Map<string, import('../models/Reading').Reading>} */
    this._store = new Map();
  }

  create(reading) {
    this._store.set(reading.id, reading);
    return reading;
  }

  findById(id) {
    return this._store.get(id) || null;
  }

  /**
   * @param {string} deviceId
   * @param {{from?: string, to?: string, limit?: number}} filters
   */
  findByDevice(deviceId, filters = {}) {
    const { from, to, limit } = filters;
    let results = Array.from(this._store.values()).filter((r) => r.deviceId === deviceId);

    if (from) {
      const fromTime = new Date(from).getTime();
      results = results.filter((r) => new Date(r.timestamp).getTime() >= fromTime);
    }
    if (to) {
      const toTime = new Date(to).getTime();
      results = results.filter((r) => new Date(r.timestamp).getTime() <= toTime);
    }

    // newest first - most useful default for a "recent readings" view
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (limit) {
      results = results.slice(0, limit);
    }
    return results;
  }

  deleteByDevice(deviceId) {
    for (const [id, reading] of this._store.entries()) {
      if (reading.deviceId === deviceId) this._store.delete(id);
    }
  }

  clear() {
    this._store.clear();
  }
}

module.exports = { InMemoryReadingRepository };

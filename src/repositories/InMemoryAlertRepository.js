class InMemoryAlertRepository {
  constructor() {
    /** @type {Map<string, import('../models/Alert').Alert>} */
    this._store = new Map();
  }

  create(alert) {
    this._store.set(alert.id, alert);
    return alert;
  }

  findById(id) {
    return this._store.get(id) || null;
  }

  findAll({ status, deviceId } = {}) {
    let results = Array.from(this._store.values());
    if (status) results = results.filter((a) => a.status === status);
    if (deviceId) results = results.filter((a) => a.deviceId === deviceId);
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return results;
  }

  update(id, patch) {
    const existing = this._store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, id: existing.id };
    this._store.set(id, updated);
    return updated;
  }

  clear() {
    this._store.clear();
  }
}

module.exports = { InMemoryAlertRepository };

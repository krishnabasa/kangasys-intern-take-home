/**
 * DeviceRepository interface (informal, JS has no interfaces):
 *   findAll() -> Device[]
 *   findById(id) -> Device|null
 *   create(device) -> Device
 *   update(id, patch) -> Device|null
 *   delete(id) -> boolean
 *
 * Swapping this for a Postgres/Mongo-backed repository later means
 * implementing the same five methods - services never touch storage
 * directly, so nothing above this layer has to change.
 */
class InMemoryDeviceRepository {
  constructor() {
    /** @type {Map<string, import('../models/Device').Device>} */
    this._store = new Map();
  }

  findAll() {
    return Array.from(this._store.values());
  }

  findById(id) {
    return this._store.get(id) || null;
  }

  create(device) {
    this._store.set(device.id, device);
    return device;
  }

  update(id, patch) {
    const existing = this._store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, id: existing.id, updatedAt: new Date().toISOString() };
    this._store.set(id, updated);
    return updated;
  }

  delete(id) {
    return this._store.delete(id);
  }

  clear() {
    this._store.clear();
  }
}

module.exports = { InMemoryDeviceRepository };

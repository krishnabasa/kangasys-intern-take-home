const fs = require('fs');
const path = require('path');

/**
 * Loads sample-data/devices.json and sample-data/readings.json (if present)
 * and pushes them through the real services - so seeded data goes through
 * exactly the same validation and anomaly-detection path as any API call.
 * This also means the sample data intentionally produces a couple of
 * alerts on boot, so the UI isn't empty on first load.
 */
function seed({ deviceService, readingService }) {
  const dataDir = path.join(__dirname, '..', 'sample-data');
  const devicesPath = path.join(dataDir, 'devices.json');
  const readingsPath = path.join(dataDir, 'readings.json');

  if (!fs.existsSync(devicesPath)) return;

  const devicesInput = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'));
  const idMap = new Map(); // sample-data's human-readable id -> generated uuid

  for (const d of devicesInput) {
    const created = deviceService.create({
      name: d.name,
      type: d.type,
      status: d.status,
      thresholdOverride: d.thresholdOverride || null,
    });
    idMap.set(d.id, created.id);
  }

  if (fs.existsSync(readingsPath)) {
    const readingsInput = JSON.parse(fs.readFileSync(readingsPath, 'utf-8'));
    for (const r of readingsInput) {
      const realDeviceId = idMap.get(r.deviceId);
      if (!realDeviceId) continue; // skip readings for unknown seed devices
      readingService.submit(realDeviceId, {
        value: r.value,
        unit: r.unit,
        timestamp: r.timestamp,
      });
    }
  }
}

module.exports = { seed };

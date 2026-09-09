const express = require('express');
const cors = require('cors');

const { buildDeviceRouter } = require('../src/routes/devices');
const { buildAlertRouter } = require('../src/routes/alerts');
const { buildDeviceTypeRouter } = require('../src/routes/deviceTypes');
const { errorHandler } = require('../src/middleware/errorHandler');
const { buildContainer } = require('../src/container');
const { seed } = require('../src/seed');

/**
 * IMPORTANT - read before relying on this in production:
 *
 * Vercel serverless functions are stateless between invocations. This
 * module-level `container` (and the in-memory data inside it) survives
 * ONLY for as long as this particular lambda instance stays warm - which
 * Vercel does not guarantee. Under light/demo traffic you'll often see
 * it behave like a normal stateful app for a while (add a device, it's
 * still there on your next request), but:
 *   - a cold start after inactivity resets everything back to seed data
 *   - concurrent traffic can be served by multiple lambda instances that
 *     don't share this memory, so two people hitting the site at once
 *     may see different states
 *
 * This is fine for demoing the API/UI. It is NOT a substitute for real
 * persistence. See README-DEPLOY.md for what swapping in a real DB
 * (e.g. Vercel Postgres, Vercel KV) would take - the repository layer
 * in src/repositories/ is already shaped for that swap.
 */
const container = buildContainer();
seed(container);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/devices', buildDeviceRouter(container));
app.use('/api/alerts', buildAlertRouter(container));
app.use('/api/device-types', buildDeviceTypeRouter());

// Lets you force a clean slate without waiting for a cold start, e.g. after
// a demo session leaves the mock data messy. Clears the *repositories*
// in place (rather than rebuilding the container) so the routers above -
// which already closed over these repo instances - keep working correctly.
app.post('/api/_reset', (req, res) => {
  container.deviceRepo.clear();
  container.readingRepo.clear();
  container.alertRepo.clear();
  seed(container);
  res.json({ status: 'reset' });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;

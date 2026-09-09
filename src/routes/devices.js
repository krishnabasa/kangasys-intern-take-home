const express = require('express');

function buildDeviceRouter({ deviceService, readingService }) {
  const router = express.Router();

  // GET /api/devices
  router.get('/', (req, res) => {
    res.json(deviceService.list());
  });

  // POST /api/devices
  router.post('/', (req, res) => {
    const device = deviceService.create(req.body);
    res.status(201).json(device);
  });

  // GET /api/devices/:id
  router.get('/:id', (req, res) => {
    res.json(deviceService.getById(req.params.id));
  });

  // PUT /api/devices/:id
  router.put('/:id', (req, res) => {
    res.json(deviceService.update(req.params.id, req.body));
  });

  // DELETE /api/devices/:id
  router.delete('/:id', (req, res) => {
    deviceService.delete(req.params.id);
    res.status(204).send();
  });

  // POST /api/devices/:id/readings  - submit a new reading
  router.post('/:id/readings', (req, res) => {
    const { value, unit, timestamp } = req.body;
    const result = readingService.submit(req.params.id, { value, unit, timestamp });
    res.status(201).json(result);
  });

  // GET /api/devices/:id/readings?from=&to=&limit=  - fetch readings
  router.get('/:id/readings', (req, res) => {
    const { from, to, limit } = req.query;
    const readings = readingService.list(req.params.id, {
      from,
      to,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(readings);
  });

  return router;
}

module.exports = { buildDeviceRouter };

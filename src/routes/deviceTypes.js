const express = require('express');
const { listDeviceTypes } = require('../config/deviceTypes');

function buildDeviceTypeRouter() {
  const router = express.Router();

  // GET /api/device-types
  router.get('/', (req, res) => {
    res.json(listDeviceTypes());
  });

  return router;
}

module.exports = { buildDeviceTypeRouter };

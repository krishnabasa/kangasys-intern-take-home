const express = require('express');

function buildAlertRouter({ alertService }) {
  const router = express.Router();

  // GET /api/alerts?status=active|resolved&deviceId=
  router.get('/', (req, res) => {
    const { status, deviceId } = req.query;
    res.json(alertService.list({ status, deviceId }));
  });

  // PATCH /api/alerts/:id/resolve
  router.patch('/:id/resolve', (req, res) => {
    res.json(alertService.resolve(req.params.id));
  });

  return router;
}

module.exports = { buildAlertRouter };

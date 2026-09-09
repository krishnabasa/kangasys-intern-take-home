const express = require('express');
const path = require('path');
const app = require('./api/index');

const PORT = process.env.PORT || 4000;

// Serve the frontend files when running locally.
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`KangaSys device monitoring server running on http://localhost:${PORT}`);
});
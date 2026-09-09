/* KangaSys Device Monitoring - frontend
 * Vanilla JS on purpose: the assignment explicitly says polish/framework
 * choice isn't being evaluated, and a single fetch-driven file is the
 * fastest way to prove the API works without adding a build step.
 */

const API = '/api';

const state = {
  deviceTypes: [],
  devices: [],
  selectedDeviceId: null,
  alertFilter: 'active',
};

// ---------- tiny fetch helper ----------
async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error((body && body.error) || `Request failed (${res.status})`);
  }
  return body;
}

function toast(message, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = isError ? 'error show' : 'show';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.className = ''), 3200);
}

// ---------- tabs ----------
document.querySelectorAll('.tab[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => setActiveView(btn.dataset.view));
});

function setActiveView(view) {
  document.querySelectorAll('.tab[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('section.view').forEach((s) => s.classList.toggle('active', s.id === `view-${view}`));
  if (view === 'readings') renderReadingsView();
  if (view === 'alerts') renderAlertsView();
}

// ---------- health check ----------
async function checkHealth() {
  const dot = document.getElementById('apiDot');
  const label = document.getElementById('apiStatusLabel');
  try {
    await api('/health');
    dot.classList.remove('down');
    label.textContent = 'API connected';
  } catch {
    dot.classList.add('down');
    label.textContent = 'API unreachable';
  }
}

// ---------- device types ----------
async function loadDeviceTypes() {
  state.deviceTypes = await api('/device-types');
  const select = document.getElementById('deviceType');
  select.innerHTML = state.deviceTypes
    .map((t) => `<option value="${t.type}">${t.label} (${t.normalRange.min}–${t.normalRange.max}${t.unit})</option>`)
    .join('');
}

function typeMeta(type) {
  return state.deviceTypes.find((t) => t.type === type);
}

// ---------- devices ----------
async function loadDevices() {
  state.devices = await api('/devices');
  renderDeviceGrid();
  renderReadingsDeviceSelect();
  document.getElementById('deviceCount').textContent = state.devices.length;
}

function renderDeviceGrid() {
  const grid = document.getElementById('deviceGrid');
  if (state.devices.length === 0) {
    grid.innerHTML = `<div class="empty-state">No devices yet — add one above to get started.</div>`;
    return;
  }
  grid.innerHTML = state.devices
    .map((d) => {
      const meta = typeMeta(d.type);
      const range = d.thresholdOverride || (meta ? meta.normalRange : null);
      const rangeLabel = range ? `Normal range: ${range.min}–${range.max}${meta ? meta.unit : ''}` : '';
      const overrideNote = d.thresholdOverride ? ' (custom)' : '';
      return `
        <div class="device-card" data-id="${d.id}">
          <div class="device-card-top">
            <div>
              <p class="device-name">${escapeHtml(d.name)}</p>
              <span class="device-type">${meta ? meta.label : d.type}</span>
            </div>
            <span class="pill status-${d.status}">${d.status}</span>
          </div>
          <div class="device-range">${rangeLabel}${overrideNote}</div>
          <div class="device-actions">
            <button class="btn btn-secondary btn-view" data-id="${d.id}" style="padding:9px 14px; font-size:12px;">View readings</button>
            <button class="btn btn-danger btn-delete" data-id="${d.id}">Delete</button>
          </div>
        </div>`;
    })
    .join('');

  grid.querySelectorAll('.btn-view').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedDeviceId = btn.dataset.id;
      setActiveView('readings');
    })
  );
  grid.querySelectorAll('.btn-delete').forEach((btn) =>
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Delete this device and all its readings?')) return;
      try {
        await api(`/devices/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Device deleted');
        await loadDevices();
      } catch (err) {
        toast(err.message, true);
      }
    })
  );
}

document.getElementById('deviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('deviceName').value;
  const type = document.getElementById('deviceType').value;
  const status = document.getElementById('deviceStatus').value;
  try {
    await api('/devices', { method: 'POST', body: JSON.stringify({ name, type, status }) });
    e.target.reset();
    toast('Device added');
    await loadDevices();
  } catch (err) {
    toast(err.message, true);
  }
});

// ---------- readings ----------
function renderReadingsDeviceSelect() {
  const select = document.getElementById('readingsDeviceSelect');
  select.innerHTML = state.devices.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
  if (!state.selectedDeviceId && state.devices.length) {
    state.selectedDeviceId = state.devices[0].id;
  }
  if (state.selectedDeviceId) select.value = state.selectedDeviceId;
}

document.getElementById('readingsDeviceSelect').addEventListener('change', (e) => {
  state.selectedDeviceId = e.target.value;
  renderReadingsView();
});

async function renderReadingsView() {
  if (!state.selectedDeviceId) {
    if (state.devices.length) {
      state.selectedDeviceId = state.devices[0].id;
    } else {
      return;
    }
  }
  document.getElementById('readingsDeviceSelect').value = state.selectedDeviceId;

  const device = state.devices.find((d) => d.id === state.selectedDeviceId);
  if (!device) return;
  const meta = typeMeta(device.type);
  const range = device.thresholdOverride || (meta ? meta.normalRange : null);
  document.getElementById('readingsRangeLabel').textContent = range
    ? `NORMAL RANGE: ${range.min}–${range.max}${meta ? meta.unit : ''}`
    : 'NORMAL RANGE: n/a';

  const readings = await api(`/devices/${state.selectedDeviceId}/readings?limit=50`);
  const chronological = [...readings].reverse(); // API returns newest-first; chart reads left-to-right

  renderChart(chronological, range);
  renderReadingsTable(readings, range);
}

function renderChart(readings, range) {
  const svg = document.getElementById('chartSvg');
  if (readings.length === 0) {
    svg.innerHTML = `<text x="350" y="110" text-anchor="middle" class="chart-empty" fill="#22222299" font-size="13">No readings yet</text>`;
    return;
  }

  const W = 700, H = 220, PAD = 24;
  const values = readings.map((r) => r.value);
  const lo = Math.min(...values, range ? range.min : Infinity);
  const hi = Math.max(...values, range ? range.max : -Infinity);
  const span = hi - lo || 1;

  const x = (i) => PAD + (i / Math.max(readings.length - 1, 1)) * (W - PAD * 2);
  const y = (v) => H - PAD - ((v - lo) / span) * (H - PAD * 2);

  let svgParts = [];

  // normal-range band
  if (range) {
    const yTop = y(range.max);
    const yBot = y(range.min);
    svgParts.push(`<rect class="chart-band" x="${PAD}" y="${yTop}" width="${W - PAD * 2}" height="${Math.max(yBot - yTop, 1)}" rx="4"></rect>`);
  }

  // axis line
  svgParts.push(`<line class="chart-axis" x1="${PAD}" y1="${H - PAD}" x2="${W - PAD}" y2="${H - PAD}"></line>`);

  // line path
  const points = readings.map((r, i) => `${x(i)},${y(r.value)}`).join(' ');
  svgParts.push(`<polyline class="chart-line" points="${points}"></polyline>`);

  // points
  readings.forEach((r, i) => {
    const anomalous = range && (r.value < range.min || r.value > range.max);
    svgParts.push(`<circle class="chart-point ${anomalous ? 'anomalous' : ''}" cx="${x(i)}" cy="${y(r.value)}" r="4"></circle>`);
  });

  svg.innerHTML = svgParts.join('\n');
}

function renderReadingsTable(readings, range) {
  const body = document.getElementById('readingsTableBody');
  document.getElementById('readingsEmpty').style.display = readings.length ? 'none' : 'block';
  body.innerHTML = readings
    .map((r) => {
      const anomalous = range && (r.value < range.min || r.value > range.max);
      return `<tr>
        <td>${new Date(r.timestamp).toLocaleString()}</td>
        <td class="${anomalous ? 'value-anomalous' : ''}">${r.value}</td>
        <td>${r.unit}</td>
        <td>${anomalous ? '<span class="pill alert-active">out of range</span>' : '<span class="pill status-active">normal</span>'}</td>
      </tr>`;
    })
    .join('');
}

document.getElementById('readingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.selectedDeviceId) {
    toast('Add a device first', true);
    return;
  }
  const valueInput = document.getElementById('readingValue');
  const value = Number(valueInput.value);
  try {
    const result = await api(`/devices/${state.selectedDeviceId}/readings`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
    valueInput.value = '';
    if (result.alert) {
      toast(`Alert triggered: ${result.alert.message}`, true);
    } else {
      toast('Reading recorded — within normal range');
    }
    await renderReadingsView();
    await refreshAlertCount();
  } catch (err) {
    toast(err.message, true);
  }
});

// ---------- alerts ----------
document.querySelectorAll('.tab[data-alert-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab[data-alert-filter]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.alertFilter = btn.dataset.alertFilter;
    renderAlertsView();
  });
});

async function renderAlertsView() {
  const qs = state.alertFilter ? `?status=${state.alertFilter}` : '';
  const alerts = await api(`/alerts${qs}`);
  await refreshAlertCount();
  const list = document.getElementById('alertsList');
  document.getElementById('alertsEmpty').style.display = alerts.length ? 'none' : 'block';

  list.innerHTML = alerts
    .map((a) => {
      const device = state.devices.find((d) => d.id === a.deviceId);
      return `<div class="alert-row is-${a.status}">
        <div>
          <p class="alert-message">${escapeHtml(a.message)}</p>
          <span class="alert-meta">${device ? escapeHtml(device.name) : 'Unknown device'} · ${new Date(a.timestamp).toLocaleString()}</span>
        </div>
        ${a.status === 'active' ? `<button class="btn btn-secondary btn-resolve" data-id="${a.id}" style="padding:9px 14px; font-size:12px; white-space:nowrap;">Mark resolved</button>` : `<span class="pill alert-resolved">resolved</span>`}
      </div>`;
    })
    .join('');

  list.querySelectorAll('.btn-resolve').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await api(`/alerts/${btn.dataset.id}/resolve`, { method: 'PATCH' });
        toast('Alert resolved');
        await renderAlertsView();
        await refreshAlertCount();
      } catch (err) {
        toast(err.message, true);
      }
    })
  );
}

async function refreshAlertCount() {
  const active = await api('/alerts?status=active');
  document.getElementById('alertCount').textContent = active.length;
}

// ---------- utils ----------
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- boot ----------
(async function init() {
  await checkHealth();
  await loadDeviceTypes();
  await loadDevices();
  await refreshAlertCount();

  // Keep the active alert badge updated while simulator readings arrive.
  setInterval(refreshAlertCount, 5000);
})();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

const DEVICE_TYPES = {
  'temperature-sensor': {
    unit: '°C',
    min: -10,
    max: 50,
  },
  'pressure-gauge': {
    unit: 'psi',
    min: 0,
    max: 150,
  },
  'humidity-sensor': {
    unit: '%',
    min: 10,
    max: 80,
  },
  'vibration-sensor': {
    unit: 'mm/s',
    min: 0,
    max: 12,
  },
  'contact-sensor': {
    unit: 'state',
    min: 0,
    max: 1,
  },
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function getRange(device) {
  if (device.thresholdOverride) {
    return device.thresholdOverride;
  }

  const config = DEVICE_TYPES[device.type];
  return config ? { min: config.min, max: config.max } : null;
}

function generateReading(device) {
  const config = DEVICE_TYPES[device.type];
  const range = getRange(device);

  if (!config || !range) {
    return null;
  }

  const shouldCreateAnomaly = Math.random() < 0.1;

  let value;

  if (shouldCreateAnomaly) {
    const rangeSize = range.max - range.min || 1;

    if (Math.random() < 0.5) {
      value = range.min - randomBetween(rangeSize * 0.1, rangeSize * 0.3);
    } else {
      value = range.max + randomBetween(rangeSize * 0.1, rangeSize * 0.3);
    }
  } else {
    value = randomBetween(range.min, range.max);
  }

  if (device.type === 'contact-sensor') {
    value = Math.random() < 0.5 ? 0 : 1;
  }

  return {
    value: round(value),
    unit: config.unit,
    timestamp: new Date().toISOString(),
    simulatedAnomaly: shouldCreateAnomaly,
  };
}

async function runSimulationCycle() {
  try {
    const response = await fetch(`${BASE_URL}/api/devices`);

    if (!response.ok) {
      throw new Error(`Unable to fetch devices: ${response.status}`);
    }

    const devices = await response.json();

    const activeDevices = devices.filter(
      (device) => device.status === 'active'
    );

    if (activeDevices.length === 0) {
      console.log('No active devices found.');
      return;
    }

    for (const device of activeDevices) {
      const generated = generateReading(device);

      if (!generated) {
        console.log(`Skipping unsupported device: ${device.name}`);
        continue;
      }

      const readingResponse = await fetch(
        `${BASE_URL}/api/devices/${device.id}/readings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: generated.value,
            unit: generated.unit,
            timestamp: generated.timestamp,
          }),
        }
      );

      const result = await readingResponse.json();

      if (!readingResponse.ok) {
        console.error(`Failed reading for ${device.name}:`, result);
        continue;
      }

      const status = result.alert ? 'ANOMALY' : 'NORMAL';

      console.log(
        `[${new Date().toLocaleTimeString()}] ${device.name} -> ` +
          `${generated.value} ${generated.unit} [${status}]`
      );
    }
  } catch (error) {
    console.error(`Simulator error: ${error.message}`);
  }
}

console.log('KangaSys reading simulator started');
console.log('Sending readings approximately every 10 seconds...');
console.log(`API: ${BASE_URL}`);
console.log('');

runSimulationCycle();

setInterval(runSimulationCycle, 10000);
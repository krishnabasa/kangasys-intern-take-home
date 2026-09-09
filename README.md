<img src="./assets/kangasys-logo.png" alt="KangaSys logo" width="220" />

# KangaSys Device Monitoring Service

A small full-stack device monitoring application built for the KangaSys Software Engineering Intern take-home assignment.

The application manages physical devices, accepts sensor readings, detects readings outside configured normal ranges, creates alerts, and provides a simple dashboard for monitoring devices and resolving alerts.

## Features

### Device Management

- Create, list, view, update, and delete devices
- Mark devices as active or inactive
- Support multiple device types and units
- Configure normal operating ranges
- Extend supported device types from a central device type registry

### Reading Management

- Submit timestamped numeric readings for devices
- Automatically use the default unit for each device type
- Reject invalid reading values and timestamps
- Reject readings submitted to inactive devices
- Query recent readings for a device
- Filter readings using `from`, `to`, and `limit`

### Reading Simulator

A simulator is included to imitate readings arriving from physical devices.

The simulator:

- Fetches active devices from the API
- Generates readings approximately every 10 seconds
- Produces mostly normal readings
- Occasionally generates out-of-range readings
- Sends readings through the same HTTP API used by the application
- Skips inactive devices

This keeps the simulator separate from the core application and makes it behave more like an external device data source.

### Anomaly Detection

Every submitted reading is evaluated against the device's effective normal range.

- Values inside the range are considered normal
- Minimum and maximum boundary values are considered normal
- Values below the minimum or above the maximum generate an alert
- Alerts store the device, triggering reading, timestamp, value, and message
- Device-specific threshold overrides are supported

The anomaly detection logic is separated from reading ingestion so additional alert rules can be added without rewriting the reading service.

### Alerts

- List alerts
- Filter alerts by status or device
- View active alerts in the dashboard
- Resolve active alerts
- Prevent an already resolved alert from being resolved again
- Live alert count refreshes while simulator readings are arriving

### Dashboard

The frontend provides views for:

- Device list and status
- Adding and deleting devices
- Recent device readings
- Reading visualization
- Active alerts
- Resolving alerts

## Tech Stack

- Node.js
- Express.js
- JavaScript
- HTML
- CSS
- Node.js built-in test runner
- Supertest for API integration testing

## Project Structure

```text
.
├── api/
│   └── index.js
├── assets/
├── sample-data/
├── scripts/
│   └── simulator.js
├── src/
│   ├── config/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   └── services/
├── test/
│   ├── alertService.test.js
│   ├── anomalyDetection.test.js
│   ├── api.test.js
│   ├── deviceService.test.js
│   └── readingService.test.js
├── app.js
├── index.html
├── server.js
├── styles.css
├── package.json
└── README.md
```

## Running the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Start the application

```bash
npm start
```

The application will be available at:

```text
http://localhost:4000
```

### 3. Start the reading simulator

Keep the application running and open a second terminal:

```bash
npm run simulator
```

The simulator will begin sending readings for active devices approximately every 10 seconds.

Use `Ctrl + C` to stop the simulator.

## Running Tests

Run:

```bash
npm test
```

Current test suite:

```text
25 tests
25 passed
0 failed
```

The tests cover core behavior including:

- Normal and anomalous readings
- Minimum and maximum threshold boundaries
- Device creation, update, and deletion
- Invalid device types and threshold ranges
- Reading validation
- Inactive-device reading rejection
- Alert creation
- Alert resolution and validation
- HTTP API device operations
- API-level anomaly/alert behavior

## API Overview

### Devices

```text
GET    /api/devices
POST   /api/devices
GET    /api/devices/:id
PUT    /api/devices/:id
DELETE /api/devices/:id
```

### Readings

```text
POST /api/devices/:id/readings
GET  /api/devices/:id/readings?from=&to=&limit=
```

### Alerts

The application exposes endpoints for listing/filtering alerts and resolving active alerts.

## Design Decisions

### Separation of Concerns

The application separates routes, services, repositories, models, configuration, and anomaly rules.

Routes handle HTTP concerns, services contain business logic, repositories handle data access, and anomaly detection is kept separate from reading ingestion.

### Extensible Device Types

Supported device types and their default units/ranges are defined in a central registry. Adding another supported device type does not require changing the core reading or anomaly-detection workflow.

### Extensible Alert Rules

Anomaly evaluation is separated into its own service/rule structure. This allows additional anomaly rules to be introduced later without placing all detection logic inside the HTTP routes.

### Simulator as an External Client

The reading simulator communicates with the application through HTTP instead of directly modifying repositories. This more closely represents how external sensors or ingestion services would interact with the system.

## Trade-offs and Production Considerations

The current implementation uses in-memory repositories to keep the take-home project small and easy to run.

For a production system handling large volumes of sensor data, I would consider:

- A persistent database such as PostgreSQL or a suitable time-series datastore
- Authentication and authorization
- Message queues or streaming infrastructure for high-volume ingestion
- Horizontal scaling
- Structured logging and monitoring
- Stronger API validation and rate limiting
- Retry/error-handling strategies for ingestion
- More extensive integration and load testing

The in-memory implementation means application data is reset when the server process restarts.

## AI-Assisted Development

AI tools were used as a development assistant during the assignment for tasks such as reviewing implementation ideas, debugging, identifying missing requirements, and improving test coverage.

The generated suggestions were checked against the actual project structure and behavior before being incorporated. For example, test assumptions were corrected after checking the real anomaly-rule interface, and the final functionality was verified by running the application, simulator, and automated tests.

## Assignment Reference

The original assignment requirements are available in:

```text
Problem_Statement.md
```
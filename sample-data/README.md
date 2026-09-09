# Sample Data

This is a small, illustrative snapshot of what device data looks like on a live server — enough to get a feel for the shape of the data, not a spec to copy literally. Use it as a reference when designing your own tables/schema; you are free to model this differently if you have a better idea.

- **`devices.json`** — a handful of devices, each with a type and a `normalRange` (the "safe" band for its readings). Note `dev-004` has `status: "inactive"` and no `normalRange` — inactive devices don't need one.
- **`readings.json`** — a handful of readings per device over time.

**Note on cadence:** these sample readings are spaced 15 minutes apart purely so the file stays short and readable. On a real site, each sensor reports roughly **once every 10 seconds** — that's the volume your simulator should generate and your service should handle. Don't take the 15-minute spacing here as the real thing.

## Spot the anomalies

Look closely at `dev-001` (Chiller Room Temp Sensor, normal range 2–8°C): the first three readings are fine, then it jumps to `11.6` and `12.0` — that's a chiller failing, and it's the kind of thing that should raise an alert.

`dev-002` (Boiler Pressure Gauge, normal range 1.5–6 bar) has a single dip to `0.6` sandwiched between normal readings — a brief anomaly, not a sustained trend. Worth thinking about: should a single out-of-range reading alert the same way as a sustained one? That's your call to make and justify.

`dev-003` stays within range the whole time — nothing should fire for it.

const { getDefaultRange } = require('../config/deviceTypes');
const { RangeThresholdRule } = require('./rules/RangeThresholdRule');

/**
 * AnomalyDetectionService
 * ------------------------
 * Decides whether a new reading is anomalous for its device, and if so,
 * builds the alert payload. It does NOT persist anything itself - it is
 * a pure decision-making unit, which is exactly why it's the easiest
 * thing in the whole system to unit test (see tests/anomalyDetection.test.js).
 *
 * "Effective range" resolution order:
 *   1. device.thresholdOverride, if the device defines one
 *   2. the device type's default normalRange
 *   3. null (no rule can fire - e.g. an unknown type slipped through)
 */
class AnomalyDetectionService {
  constructor(rules = [new RangeThresholdRule()]) {
    this.rules = rules;
  }

  getEffectiveRange(device) {
    if (device.thresholdOverride) return device.thresholdOverride;
    return getDefaultRange(device.type);
  }

  /**
   * @returns {{triggered: boolean, message?: string}}
   */
  evaluate(device, reading) {
    const effectiveRange = this.getEffectiveRange(device);

    for (const rule of this.rules) {
      const result = rule.evaluate(device, reading, effectiveRange);
      if (result.triggered) {
        return result;
      }
    }
    return { triggered: false };
  }
}

module.exports = { AnomalyDetectionService };

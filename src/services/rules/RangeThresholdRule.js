/**
 * RangeThresholdRule
 * -------------------
 * The only rule implemented for this assignment: flag a reading if it
 * falls outside a [min, max] normal range.
 *
 * This is deliberately written against a small "Rule" shape:
 *   { evaluate(device, reading, effectiveRange) -> { triggered: boolean, message?: string } }
 *
 * so that AnomalyDetectionService can run a *list* of rules per reading
 * without knowing anything about what each rule checks. Adding a new
 * kind of alert next week (e.g. "3 consecutive readings trending up",
 * "device silent for 10 minutes", "value changed by more than X since
 * last reading") means writing one more file with this same shape and
 * registering it - AnomalyDetectionService and everything above it is
 * untouched. That's Open/Closed in practice, not just a README claim.
 */
class RangeThresholdRule {
  get name() {
    return 'range-threshold';
  }

  evaluate(device, reading, effectiveRange) {
    if (!effectiveRange) {
      return { triggered: false };
    }
    const { min, max } = effectiveRange;

    if (reading.value < min) {
      return {
        triggered: true,
        message: `Reading ${reading.value}${reading.unit} is below the minimum threshold of ${min}${reading.unit} for ${device.name} (${device.type}).`,
      };
    }
    if (reading.value > max) {
      return {
        triggered: true,
        message: `Reading ${reading.value}${reading.unit} exceeds the maximum threshold of ${max}${reading.unit} for ${device.name} (${device.type}).`,
      };
    }
    return { triggered: false };
  }
}

module.exports = { RangeThresholdRule };

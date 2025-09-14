function clampDouble(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function yFromLstar(lstar: number): number {
  const ke = 8.0;
  if (lstar > ke) {
    const cube = (lstar + 16.0) / 116.0;
    return cube * cube * cube * 100.0;
  }
  return (lstar / 903.2962962962963) * 100.0; // 24389/27 ≈ 903.296
}

function lstarFromY(y: number): number {
  const e = 216.0 / 24389.0; // ≈ 0.008856
  const k = 24389.0 / 27.0;  // ≈ 903.296
  const yr = y / 100.0;

  if (yr > e) {
    return 116.0 * Math.cbrt(yr) - 16.0;
  } else {
    return k * yr;
  }
}

class Contrast {
  /**
   * Returns a contrast ratio, which ranges from 1 to 21.
   */
  static ratioOfTones(toneA: number, toneB: number): number {
    toneA = clampDouble(0.0, 100.0, toneA);
    toneB = clampDouble(0.0, 100.0, toneB);
    return this._ratioOfYs(
      yFromLstar(toneA),
      yFromLstar(toneB)
    );
  }

  private static _ratioOfYs(y1: number, y2: number): number {
    const lighter = y1 > y2 ? y1 : y2;
    const darker = lighter === y2 ? y1 : y2;
    return (lighter + 5.0) / (darker + 5.0);
  }

  /**
   * Returns a tone >= [tone] that ensures [ratio].
   * Returns -1 if [ratio] cannot be achieved with [tone].
   */
  static lighter(tone: number, ratio: number): number {
    if (tone < 0.0 || tone > 100.0) return -1.0;

    const darkY = yFromLstar(tone);
    const lightY = ratio * (darkY + 5.0) - 5.0;
    const realContrast = this._ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) return -1;

    const returnValue = lstarFromY(lightY) + 0.4;
    if (returnValue < 0 || returnValue > 100) return -1;
    return returnValue;
  }

  /**
   * Returns a tone <= [tone] that ensures [ratio].
   * Returns -1 if [ratio] cannot be achieved with [tone].
   */
  static darker(tone: number, ratio: number): number {
    if (tone < 0.0 || tone > 100.0) return -1.0;

    const lightY = yFromLstar(tone);
    const darkY = (lightY + 5.0) / ratio - 5.0;
    const realContrast = this._ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) return -1;

    const returnValue = lstarFromY(darkY) - 0.4;
    if (returnValue < 0 || returnValue > 100) return -1;
    return returnValue;
  }

  /**
   * Returns a tone >= [tone] that ensures [ratio].
   * Returns 100 if [ratio] cannot be achieved with [tone].
   */
  static lighterUnsafe(tone: number, ratio: number): number {
    const lighterSafe = this.lighter(tone, ratio);
    return lighterSafe < 0.0 ? 100.0 : lighterSafe;
  }

  /**
   * Returns a tone <= [tone] that ensures [ratio].
   * Returns 0 if [ratio] cannot be achieved with [tone].
   */
  static darkerUnsafe(tone: number, ratio: number): number {
    const darkerSafe = this.darker(tone, ratio);
    return darkerSafe < 0.0 ? 0.0 : darkerSafe;
  }
}

export default Contrast;
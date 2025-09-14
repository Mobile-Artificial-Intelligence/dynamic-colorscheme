import { ColorUtils, MathUtils } from "./utilities";

class Contrast {
  /**
   * Returns a contrast ratio, which ranges from 1 to 21.
   */
  static ratioOfTones(toneA: number, toneB: number): number {
    toneA = MathUtils.clampDouble(0.0, 100.0, toneA);
    toneB = MathUtils.clampDouble(0.0, 100.0, toneB);
    return this._ratioOfYs(
      ColorUtils.yFromLstar(toneA),
      ColorUtils.yFromLstar(toneB)
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

    const darkY = ColorUtils.yFromLstar(tone);
    const lightY = ratio * (darkY + 5.0) - 5.0;
    const realContrast = this._ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) return -1;

    const returnValue = ColorUtils.lstarFromY(lightY) + 0.4;
    if (returnValue < 0 || returnValue > 100) return -1;
    return returnValue;
  }

  /**
   * Returns a tone <= [tone] that ensures [ratio].
   * Returns -1 if [ratio] cannot be achieved with [tone].
   */
  static darker(tone: number, ratio: number): number {
    if (tone < 0.0 || tone > 100.0) return -1.0;

    const lightY = ColorUtils.yFromLstar(tone);
    const darkY = (lightY + 5.0) / ratio - 5.0;
    const realContrast = this._ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) return -1;

    const returnValue = ColorUtils.lstarFromY(darkY) - 0.4;
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
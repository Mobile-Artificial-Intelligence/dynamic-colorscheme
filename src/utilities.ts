export function sanitizeDegreesDouble(degrees: number): number {
  degrees = degrees % 360.0;
  if (degrees < 0) {
    degrees = degrees + 360.0;
  }
  return degrees;
}

export class MathUtils {
  /** The signum function. */
  static signum(num: number): number {
    if (num < 0) return -1;
    if (num === 0) return 0;
    return 1;
  }

  /** The linear interpolation function. */
  static lerp(start: number, stop: number, amount: number): number {
    return (1.0 - amount) * start + amount * stop;
  }

  /** Clamps an integer between two integers. */
  static clampInt(min: number, max: number, input: number): number {
    return Math.min(Math.max(input, min), max);
  }

  /** Clamps a number between two floating-point numbers. */
  static clampDouble(min: number, max: number, input: number): number {
    return Math.min(Math.max(input, min), max);
  }

  /** Sanitizes a degree measure as an integer. */
  static sanitizeDegreesInt(degrees: number): number {
    degrees = degrees % 360;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  /** Sanitizes a degree measure as a floating-point number. */
  static sanitizeDegreesDouble(degrees: number): number {
    degrees = degrees % 360.0;
    if (degrees < 0) degrees += 360.0;
    return degrees;
  }

  /** Sign of direction change needed to travel from one angle to another. */
  static rotationDirection(from: number, to: number): number {
    const increasingDifference = this.sanitizeDegreesDouble(to - from);
    return increasingDifference <= 180.0 ? 1.0 : -1.0;
  }

  /** Distance of two points on a circle, represented using degrees. */
  static differenceDegrees(a: number, b: number): number {
    return 180.0 - Math.abs(Math.abs(a - b) - 180.0);
  }

  /** Multiplies a 1x3 row vector with a 3x3 matrix. */
  static matrixMultiply(row: number[], matrix: number[][]): number[] {
    const a = row[0]! * matrix[0]![0]! + row[1]! * matrix[0]![1]! + row[2]! * matrix[0]![2]!;
    const b = row[0]! * matrix[1]![0]! + row[1]! * matrix[1]![1]! + row[2]! * matrix[1]![2]!;
    const c = row[0]! * matrix[2]![0]! + row[1]! * matrix[2]![1]! + row[2]! * matrix[2]![2]!;
    return [a, b, c];
  }
}

export class ColorUtils {
  private static readonly _srgbToXyz: number[][] = [
    [0.41233895, 0.35762064, 0.18051042],
    [0.2126, 0.7152, 0.0722],
    [0.01932141, 0.11916382, 0.95034478],
  ];

  private static readonly _xyzToSrgb: number[][] = [
    [3.2413774792388685, -1.5376652402851851, -0.49885366846268053],
    [-0.9691452513005321, 1.8758853451067872, 0.04156585616912061],
    [0.05562093689691305, -0.20395524564742123, 1.0571799111220335],
  ];

  private static readonly _whitePointD65: number[] = [95.047, 100.0, 108.883];

  static argbFromRgb(red: number, green: number, blue: number): number {
    return (255 << 24) | ((red & 255) << 16) | ((green & 255) << 8) | (blue & 255);
  }

  static argbFromLinrgb(linrgb: number[]): number {
    const r = this.delinearized(linrgb[0]!);
    const g = this.delinearized(linrgb[1]!);
    const b = this.delinearized(linrgb[2]!);
    return this.argbFromRgb(r, g, b);
  }

  static alphaFromArgb(argb: number): number {
    return (argb >> 24) & 255;
  }
  static redFromArgb(argb: number): number {
    return (argb >> 16) & 255;
  }
  static greenFromArgb(argb: number): number {
    return (argb >> 8) & 255;
  }
  static blueFromArgb(argb: number): number {
    return argb & 255;
  }

  static isOpaque(argb: number): boolean {
    return this.alphaFromArgb(argb) >= 255;
  }

  static argbFromXyz(x: number, y: number, z: number): number {
    const m = this._xyzToSrgb;
    const linearR = m[0]![0]! * x + m[0]![1]! * y + m[0]![2]! * z;
    const linearG = m[1]![0]! * x + m[1]![1]! * y + m[1]![2]! * z;
    const linearB = m[2]![0]! * x + m[2]![1]! * y + m[2]![2]! * z;
    const r = this.delinearized(linearR);
    const g = this.delinearized(linearG);
    const b = this.delinearized(linearB);
    return this.argbFromRgb(r, g, b);
  }

  static xyzFromArgb(argb: number): number[] {
    const r = this.linearized(this.redFromArgb(argb));
    const g = this.linearized(this.greenFromArgb(argb));
    const b = this.linearized(this.blueFromArgb(argb));
    return MathUtils.matrixMultiply([r, g, b], this._srgbToXyz);
  }

  static argbFromLab(l: number, a: number, b: number): number {
    const wp = this._whitePointD65;
    const fy = (l + 16.0) / 116.0;
    const fx = a / 500.0 + fy;
    const fz = fy - b / 200.0;
    const x = this._labInvf(fx) * wp[0]!;
    const y = this._labInvf(fy) * wp[1]!;
    const z = this._labInvf(fz) * wp[2]!;
    return this.argbFromXyz(x, y, z);
  }

  static labFromArgb(argb: number): number[] {
    const linearR = this.linearized(this.redFromArgb(argb));
    const linearG = this.linearized(this.greenFromArgb(argb));
    const linearB = this.linearized(this.blueFromArgb(argb));
    const m = this._srgbToXyz;
    const x = m[0]![0]! * linearR + m[0]![1]! * linearG + m[0]![2]! * linearB;
    const y = m[1]![0]! * linearR + m[1]![1]! * linearG + m[1]![2]! * linearB;
    const z = m[2]![0]! * linearR + m[2]![1]! * linearG + m[2]![2]! * linearB;
    const wp = this._whitePointD65;
    const fx = this._labF(x / wp[0]!);
    const fy = this._labF(y / wp[1]!);
    const fz = this._labF(z / wp[2]!);
    const l = 116.0 * fy - 16;
    const a = 500.0 * (fx - fy);
    const b = 200.0 * (fy - fz);
    return [l, a, b];
  }

  static argbFromLstar(lstar: number): number {
    const y = this.yFromLstar(lstar);
    const component = this.delinearized(y);
    return this.argbFromRgb(component, component, component);
  }

  static lstarFromArgb(argb: number): number {
    const y = this.xyzFromArgb(argb)[1];
    return 116.0 * this._labF(y! / 100.0) - 16.0;
  }

  static yFromLstar(lstar: number): number {
    return 100.0 * this._labInvf((lstar + 16.0) / 116.0);
  }

  static lstarFromY(y: number): number {
    return this._labF(y / 100.0) * 116.0 - 16.0;
  }

  static linearized(rgbComponent: number): number {
    const normalized = rgbComponent / 255.0;
    if (normalized <= 0.040449936) {
      return (normalized / 12.92) * 100.0;
    }
    return ((normalized + 0.055) / 1.055) ** 2.4 * 100.0;
  }

  static delinearized(rgbComponent: number): number {
    const normalized = rgbComponent / 100.0;
    let v: number;
    if (normalized <= 0.0031308) {
      v = normalized * 12.92;
    } else {
      v = 1.055 * normalized ** (1.0 / 2.4) - 0.055;
    }
    return MathUtils.clampInt(0, 255, Math.round(v * 255.0));
  }

  static whitePointD65(): number[] {
    return this._whitePointD65;
  }

  private static _labF(t: number): number {
    const e = 216.0 / 24389.0;
    const kappa = 24389.0 / 27.0;
    if (t > e) return t ** (1.0 / 3.0);
    return (kappa * t + 16) / 116;
  }

  private static _labInvf(ft: number): number {
    const e = 216.0 / 24389.0;
    const kappa = 24389.0 / 27.0;
    const ft3 = ft * ft * ft;
    if (ft3 > e) return ft3;
    return (116 * ft - 16) / kappa;
  }
}

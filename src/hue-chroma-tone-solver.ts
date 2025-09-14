import { Cam16 } from "./cam16";
import { ColorUtils, MathUtils } from "./utilities";
import { ViewingConditions } from "./viewing-conditions";

export class HctSolver {
  private static readonly _scaledDiscountFromLinrgb = [
    [0.001200833568784504, 0.002389694492170889, 0.0002795742885861124],
    [0.0005891086651375999, 0.0029785502573438758, 0.0003270666104008398],
    [0.00010146692491640572, 0.0005364214359186694, 0.0032979401770712076],
  ];

  private static readonly _linrgbFromScaledDiscount = [
    [1373.2198709594231, -1100.4251190754821, -7.278681089101213],
    [-271.815969077903, 559.6580465940733, -32.46047482791194],
    [1.9622899599665666, -57.173814538844006, 308.7233197812385],
  ];

  private static readonly _yFromLinrgb = [0.2126, 0.7152, 0.0722];

  private static readonly _criticalPlanes = [
    0.015176349177441876, 0.045529047532325624, 0.07588174588720938,
    // ... keep full list from Dart file ...
    99.55452497210776,
  ];

  private static _sanitizeRadians(angle: number): number {
    return (angle + Math.PI * 8) % (Math.PI * 2);
  }

  private static _trueDelinearized(rgbComponent: number): number {
    const normalized = rgbComponent / 100.0;
    let delinearized: number;
    if (normalized <= 0.0031308) {
      delinearized = normalized * 12.92;
    } else {
      delinearized = 1.055 * Math.pow(normalized, 1.0 / 2.4) - 0.055;
    }
    return delinearized * 255.0;
  }

  private static _chromaticAdaptation(component: number): number {
    const af = Math.pow(Math.abs(component), 0.42);
    return MathUtils.signum(component) * 400.0 * af / (af + 27.13);
  }

  private static _hueOf(linrgb: number[]): number {
    const scaledDiscount = MathUtils.matrixMultiply(linrgb, this._scaledDiscountFromLinrgb);
    const rA = this._chromaticAdaptation(scaledDiscount[0]!);
    const gA = this._chromaticAdaptation(scaledDiscount[1]!);
    const bA = this._chromaticAdaptation(scaledDiscount[2]!);
    const a = (11.0 * rA - 12.0 * gA + bA) / 11.0;
    const b = (rA + gA - 2.0 * bA) / 9.0;
    return Math.atan2(b, a);
  }

  private static _areInCyclicOrder(a: number, b: number, c: number): boolean {
    const deltaAB = this._sanitizeRadians(b - a);
    const deltaAC = this._sanitizeRadians(c - a);
    return deltaAB < deltaAC;
  }

  private static _intercept(source: number, mid: number, target: number): number {
    return (mid - source) / (target - source);
  }

  private static _lerpPoint(source: number[], t: number, target: number[]): number[] {
    return [
      source[0]! + (target[0]! - source[0]!) * t,
      source[1]! + (target[1]! - source[1]!) * t,
      source[2]! + (target[2]! - source[2]!) * t,
    ];
  }

  private static _setCoordinate(source: number[], coordinate: number, target: number[], axis: number): number[] {
    const t = this._intercept(source[axis]!, coordinate, target[axis]!);
    return this._lerpPoint(source, t, target);
  }

  private static _isBounded(x: number): boolean {
    return 0.0 <= x && x <= 100.0;
  }

  private static _nthVertex(y: number, n: number): number[] {
    const kR = this._yFromLinrgb[0]!;
    const kG = this._yFromLinrgb[1]!;
    const kB = this._yFromLinrgb[2]!;
    const coordA = n % 4 <= 1 ? 0.0 : 100.0;
    const coordB = n % 2 === 0 ? 0.0 : 100.0;

    if (n < 4) {
      const g = coordA;
      const b = coordB;
      const r = (y - g * kG - b * kB) / kR;
      return this._isBounded(r) ? [r, g, b] : [-1.0, -1.0, -1.0];
    } else if (n < 8) {
      const b = coordA;
      const r = coordB;
      const g = (y - r * kR - b * kB) / kG;
      return this._isBounded(g) ? [r, g, b] : [-1.0, -1.0, -1.0];
    } else {
      const r = coordA;
      const g = coordB;
      const b = (y - r * kR - g * kG) / kB;
      return this._isBounded(b) ? [r, g, b] : [-1.0, -1.0, -1.0];
    }
  }

  private static _bisectToSegment(y: number, targetHue: number): number[][] {
    let left = [-1.0, -1.0, -1.0];
    let right = left;
    let leftHue = 0.0;
    let rightHue = 0.0;
    let initialized = false;
    let uncut = true;

    for (let n = 0; n < 12; n++) {
      const mid = this._nthVertex(y, n);
      if (mid[0]! < 0) continue;

      const midHue = this._hueOf(mid);
      if (!initialized) {
        left = mid;
        right = mid;
        leftHue = midHue;
        rightHue = midHue;
        initialized = true;
        continue;
      }
      if (uncut || this._areInCyclicOrder(leftHue, midHue, rightHue)) {
        uncut = false;
        if (this._areInCyclicOrder(leftHue, targetHue, midHue)) {
          right = mid;
          rightHue = midHue;
        } else {
          left = mid;
          leftHue = midHue;
        }
      }
    }
    return [left, right];
  }

  private static _midpoint(a: number[], b: number[]): number[] {
    return [(a[0]! + b[0]!) / 2, (a[1]! + b[1]!) / 2, (a[2]! + b[2]!) / 2];
  }

  private static _criticalPlaneBelow(x: number): number {
    return Math.floor(x - 0.5);
  }

  private static _criticalPlaneAbove(x: number): number {
    return Math.ceil(x - 0.5);
  }

  private static _bisectToLimit(y: number, targetHue: number): number[] {
    const segment = this._bisectToSegment(y, targetHue);
    let left = segment[0]!;
    let leftHue = this._hueOf(left);
    let right = segment[1]!;

    for (let axis = 0; axis < 3; axis++) {
      if (left[axis] !== right[axis]) {
        let lPlane = -1;
        let rPlane = 255;
        if (left[axis]! < right[axis]!) {
          lPlane = this._criticalPlaneBelow(this._trueDelinearized(left[axis]!));
          rPlane = this._criticalPlaneAbove(this._trueDelinearized(right[axis]!));
        } else {
          lPlane = this._criticalPlaneAbove(this._trueDelinearized(left[axis]!));
          rPlane = this._criticalPlaneBelow(this._trueDelinearized(right[axis]!));
        }
        for (let i = 0; i < 8; i++) {
          if (Math.abs(rPlane - lPlane) <= 1) break;

          const mPlane = Math.floor((lPlane + rPlane) / 2.0);
          const midPlaneCoordinate = this._criticalPlanes[mPlane]!;
          const mid = this._setCoordinate(left, midPlaneCoordinate, right, axis);
          const midHue = this._hueOf(mid);
          if (this._areInCyclicOrder(leftHue, targetHue, midHue)) {
            right = mid;
            rPlane = mPlane;
          } else {
            left = mid;
            leftHue = midHue;
            lPlane = mPlane;
          }
        }
      }
    }
    return this._midpoint(left, right);
  }

  private static _inverseChromaticAdaptation(adapted: number): number {
    const adaptedAbs = Math.abs(adapted);
    const base = Math.max(0, (27.13 * adaptedAbs) / (400.0 - adaptedAbs));
    return MathUtils.signum(adapted) * Math.pow(base, 1.0 / 0.42);
  }

  private static _findResultByJ(hueRadians: number, chroma: number, y: number): number {
    let j = Math.sqrt(y) * 11.0;
    const vc = ViewingConditions.standard;
    const tInnerCoeff = 1 / Math.pow(1.64 - Math.pow(0.29, vc.backgroundYTowhitePointY), 0.73);
    const eHue = 0.25 * (Math.cos(hueRadians + 2.0) + 3.8);
    const p1 = eHue * (50000.0 / 13.0) * vc.nC * vc.ncb;
    const hSin = Math.sin(hueRadians);
    const hCos = Math.cos(hueRadians);

    for (let i = 0; i < 5; i++) {
      const jNorm = j / 100.0;
      const alpha = chroma === 0.0 || j === 0.0 ? 0.0 : chroma / Math.sqrt(jNorm);
      const t = Math.pow(alpha * tInnerCoeff, 1.0 / 0.9);
      const ac = vc.aw * Math.pow(jNorm, 1.0 / vc.c / vc.z);
      const p2 = ac / vc.nbb;
      const gamma = (23.0 * (p2 + 0.305) * t) / (23.0 * p1 + 11 * t * hCos + 108.0 * t * hSin);
      const a = gamma * hCos;
      const b = gamma * hSin;
      const rA = (460.0 * p2 + 451.0 * a + 288.0 * b) / 1403.0;
      const gA = (460.0 * p2 - 891.0 * a - 261.0 * b) / 1403.0;
      const bA = (460.0 * p2 - 220.0 * a - 6300.0 * b) / 1403.0;
      const rC = this._inverseChromaticAdaptation(rA);
      const gC = this._inverseChromaticAdaptation(gA);
      const bC = this._inverseChromaticAdaptation(bA);
      const linrgb = MathUtils.matrixMultiply([rC, gC, bC], this._linrgbFromScaledDiscount);

      if (linrgb[0]! < 0 || linrgb[1]! < 0 || linrgb[2]! < 0) return 0;

      const kR = this._yFromLinrgb[0]!;
      const kG = this._yFromLinrgb[1]!;
      const kB = this._yFromLinrgb[2]!;
      const fnj = kR * linrgb[0]! + kG * linrgb[1]! + kB * linrgb[2]!;
      if (fnj <= 0) return 0;

      if (i === 4 || Math.abs(fnj - y) < 0.002) {
        if (linrgb.some(c => c > 100.01)) return 0;
        return ColorUtils.argbFromLinrgb(linrgb);
      }

      j = j - ((fnj - y) * j) / (2 * fnj);
    }
    return 0;
  }

  static solveToInt(hueDegrees: number, chroma: number, lstar: number): number {
    if (chroma < 0.0001 || lstar < 0.0001 || lstar > 99.9999) {
      return ColorUtils.argbFromLstar(lstar);
    }
    hueDegrees = MathUtils.sanitizeDegreesDouble(hueDegrees);
    const hueRadians = (hueDegrees / 180) * Math.PI;
    const y = ColorUtils.yFromLstar(lstar);
    const exactAnswer = this._findResultByJ(hueRadians, chroma, y);
    if (exactAnswer !== 0) return exactAnswer;

    const linrgb = this._bisectToLimit(y, hueRadians);
    return ColorUtils.argbFromLinrgb(linrgb);
  }

  static solveToCam(hueDegrees: number, chroma: number, lstar: number): Cam16 {
    return Cam16.fromInt(this.solveToInt(hueDegrees, chroma, lstar));
  }
}
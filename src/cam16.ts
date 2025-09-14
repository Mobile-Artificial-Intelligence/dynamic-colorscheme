import { ColorUtils, MathUtils } from "./utilities";
import { ViewingConditions } from "./viewing-conditions";

export class Cam16 {
  readonly hue: number;
  readonly chroma: number;
  readonly j: number;
  readonly q: number;
  readonly m: number;
  readonly s: number;
  readonly jstar: number;
  readonly astar: number;
  readonly bstar: number;

  constructor(
    hue: number,
    chroma: number,
    j: number,
    q: number,
    m: number,
    s: number,
    jstar: number,
    astar: number,
    bstar: number
  ) {
    this.hue = hue;
    this.chroma = chroma;
    this.j = j;
    this.q = q;
    this.m = m;
    this.s = s;
    this.jstar = jstar;
    this.astar = astar;
    this.bstar = bstar;
  }

  /** Distance between two colors in CAM16-UCS */
  distance(other: Cam16): number {
    const dJ = this.jstar - other.jstar;
    const dA = this.astar - other.astar;
    const dB = this.bstar - other.bstar;
    const dEPrime = Math.sqrt(dJ * dJ + dA * dA + dB * dB);
    return 1.41 * Math.pow(dEPrime, 0.63);
  }

  /** Convert ARGB to CAM16, using default sRGB viewing conditions */
  static fromInt(argb: number): Cam16 {
    return this.fromIntInViewingConditions(argb, ViewingConditions.sRgb);
  }

  /** Convert ARGB to CAM16 in the given viewing conditions */
  static fromIntInViewingConditions(argb: number, vc: ViewingConditions): Cam16 {
    const [x, y, z] = ColorUtils.xyzFromArgb(argb);
    return this.fromXyzInViewingConditions(x!, y!, z!, vc);
  }

  /** Convert XYZ to CAM16 in the given viewing conditions */
  static fromXyzInViewingConditions(
    x: number,
    y: number,
    z: number,
    vc: ViewingConditions
  ): Cam16 {
    // XYZ → cone responses
    const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
    const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
    const bC = -0.002079 * x + 0.048952 * y + 0.953127 * z;

    // Discount illuminant
    const rD = vc.rgbD[0]! * rC;
    const gD = vc.rgbD[1]! * gC;
    const bD = vc.rgbD[2]! * bC;

    // Chromatic adaptation
    const rAF = Math.pow((vc.fl * Math.abs(rD)) / 100.0, 0.42);
    const gAF = Math.pow((vc.fl * Math.abs(gD)) / 100.0, 0.42);
    const bAF = Math.pow((vc.fl * Math.abs(bD)) / 100.0, 0.42);
    const rA = MathUtils.signum(rD) * (400.0 * rAF) / (rAF + 27.13);
    const gA = MathUtils.signum(gD) * (400.0 * gAF) / (gAF + 27.13);
    const bA = MathUtils.signum(bD) * (400.0 * bAF) / (bAF + 27.13);

    // Opponent axes
    const a = (11.0 * rA - 12.0 * gA + bA) / 11.0;
    const b = (rA + gA - 2.0 * bA) / 9.0;

    // Auxiliary
    const u = (20.0 * rA + 20.0 * gA + 21.0 * bA) / 20.0;
    const p2 = (40.0 * rA + 20.0 * gA + bA) / 20.0;

    // Hue
    let hue = (Math.atan2(b, a) * 180.0) / Math.PI;
    if (hue < 0) hue += 360.0;
    else if (hue >= 360) hue -= 360.0;
    const hueRadians = (hue * Math.PI) / 180.0;

    // Achromatic response
    const ac = p2 * vc.nbb;

    // Lightness & brightness
    const J = 100.0 * Math.pow(ac / vc.aw, vc.c * vc.z);
    const Q =
      ((4.0 / vc.c) * Math.sqrt(J / 100.0) * (vc.aw + 4.0) * vc.fLRoot);

    // Chroma, colorfulness, saturation
    const huePrime = hue < 20.14 ? hue + 360 : hue;
    const eHue = 0.25 * (Math.cos((huePrime * Math.PI) / 180.0 + 2.0) + 3.8);
    const p1 = ((50000.0 / 13.0) * eHue * vc.nC * vc.ncb);
    const t = (p1 * Math.sqrt(a * a + b * b)) / (u + 0.305);
    const alpha =
      Math.pow(t, 0.9) *
      Math.pow(1.64 - Math.pow(0.29, vc.backgroundYTowhitePointY), 0.73);
    const C = alpha * Math.sqrt(J / 100.0);
    const M = C * vc.fLRoot;
    const s =
      50.0 * Math.sqrt((alpha * vc.c) / (vc.aw + 4.0));

    // CAM16-UCS
    const jstar = (1.0 + 100.0 * 0.007) * J / (1.0 + 0.007 * J);
    const mstar = Math.log(1.0 + 0.0228 * M) / 0.0228;
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);

    return new Cam16(hue, C, J, Q, M, s, jstar, astar, bstar);
  }

  /** Construct from J, C, h (default viewing conditions) */
  static fromJch(j: number, c: number, h: number): Cam16 {
    return this.fromJchInViewingConditions(j, c, h, ViewingConditions.sRgb);
  }

  /** Construct from J, C, h in custom viewing conditions */
  static fromJchInViewingConditions(
    J: number,
    C: number,
    h: number,
    vc: ViewingConditions
  ): Cam16 {
    const Q = (4.0 / vc.c) * Math.sqrt(J / 100.0) * (vc.aw + 4.0) * vc.fLRoot;
    const M = C * vc.fLRoot;
    const alpha = C / Math.sqrt(J / 100.0);
    const s = 50.0 * Math.sqrt((alpha * vc.c) / (vc.aw + 4.0));
    const hueRadians = (h * Math.PI) / 180.0;
    const jstar = (1.0 + 100.0 * 0.007) * J / (1.0 + 0.007 * J);
    const mstar = Math.log(1.0 + 0.0228 * M) / 0.0228;
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);

    return new Cam16(h, C, J, Q, M, s, jstar, astar, bstar);
  }

  /** Construct from UCS (default viewing conditions) */
  static fromUcs(jstar: number, astar: number, bstar: number): Cam16 {
    return this.fromUcsInViewingConditions(jstar, astar, bstar, ViewingConditions.standard);
  }

  /** Construct from UCS in custom viewing conditions */
  static fromUcsInViewingConditions(
    jstar: number,
    astar: number,
    bstar: number,
    vc: ViewingConditions
  ): Cam16 {
    const m = Math.sqrt(astar * astar + bstar * bstar);
    const M = (Math.exp(m * 0.0228) - 1.0) / 0.0228;
    const C = M / vc.fLRoot;
    let h = (Math.atan2(bstar, astar) * 180.0) / Math.PI;
    if (h < 0) h += 360.0;
    const J = jstar / (1 - (jstar - 100) * 0.007);
    return this.fromJchInViewingConditions(J, C, h, vc);
  }

  /** ARGB representation under default sRGB conditions */
  toInt(): number {
    return this.viewed(ViewingConditions.sRgb);
  }

  private _viewedArray: number[] = [0, 0, 0];

  /** ARGB representation under specified viewing conditions */
  viewed(vc: ViewingConditions): number {
    const xyz = this.xyzInViewingConditions(vc, this._viewedArray);
    return ColorUtils.argbFromXyz(xyz[0]!, xyz[1]!, xyz[2]!);
  }

  /** Convert to XYZ under given viewing conditions */
  xyzInViewingConditions(vc: ViewingConditions, array?: number[]): number[] {
    const alpha = this.chroma === 0.0 || this.j === 0.0
      ? 0.0
      : this.chroma / Math.sqrt(this.j / 100.0);

    const t = Math.pow(
      alpha /
        Math.pow(1.64 - Math.pow(0.29, vc.backgroundYTowhitePointY), 0.73),
      1.0 / 0.9
    );
    const hRad = (this.hue * Math.PI) / 180.0;

    const eHue = 0.25 * (Math.cos(hRad + 2.0) + 3.8);
    const ac = vc.aw * Math.pow(this.j / 100.0, 1.0 / vc.c / vc.z);
    const p1 = eHue * (50000.0 / 13.0) * vc.nC * vc.ncb;
    const p2 = ac / vc.nbb;

    const hSin = Math.sin(hRad);
    const hCos = Math.cos(hRad);

    const gamma = (23.0 * (p2 + 0.305) * t) / (23.0 * p1 + 11 * t * hCos + 108.0 * t * hSin);
    const a = gamma * hCos;
    const b = gamma * hSin;

    const rA = (460.0 * p2 + 451.0 * a + 288.0 * b) / 1403.0;
    const gA = (460.0 * p2 - 891.0 * a - 261.0 * b) / 1403.0;
    const bA = (460.0 * p2 - 220.0 * a - 6300.0 * b) / 1403.0;

    const rCBase = Math.max(0, (27.13 * Math.abs(rA)) / (400.0 - Math.abs(rA)));
    const rC = MathUtils.signum(rA) * (100.0 / vc.fl) * Math.pow(rCBase, 1.0 / 0.42);
    const gCBase = Math.max(0, (27.13 * Math.abs(gA)) / (400.0 - Math.abs(gA)));
    const gC = MathUtils.signum(gA) * (100.0 / vc.fl) * Math.pow(gCBase, 1.0 / 0.42);
    const bCBase = Math.max(0, (27.13 * Math.abs(bA)) / (400.0 - Math.abs(bA)));
    const bC = MathUtils.signum(bA) * (100.0 / vc.fl) * Math.pow(bCBase, 1.0 / 0.42);

    const rF = rC / vc.rgbD[0]!;
    const gF = gC / vc.rgbD[1]!;
    const bF = bC / vc.rgbD[2]!;

    const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
    const y = 0.38752654 * rF + 0.62144744 * gF - 0.00897398 * bF;
    const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;

    if (array) {
      array[0] = x;
      array[1] = y;
      array[2] = z;
      return array;
    }
    return [x, y, z];
  }
}

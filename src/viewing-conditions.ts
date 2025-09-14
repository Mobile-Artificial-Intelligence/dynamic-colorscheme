import { ColorUtils, MathUtils } from "./utilities";

export class ViewingConditions {
  static readonly sRgb = ViewingConditions.make();
  static readonly standard = ViewingConditions.sRgb;

  readonly whitePoint: number[];
  readonly adaptingLuminance: number;
  readonly backgroundLstar: number;
  readonly surround: number;
  readonly discountingIlluminant: boolean;

  readonly backgroundYTowhitePointY: number;
  readonly aw: number;
  readonly nbb: number;
  readonly ncb: number;
  readonly c: number;
  readonly nC: number;
  readonly drgbInverse: number[];
  readonly rgbD: number[];
  readonly fl: number;
  readonly fLRoot: number;
  readonly z: number;

  private constructor(init: {
    whitePoint: number[];
    adaptingLuminance: number;
    backgroundLstar: number;
    surround: number;
    discountingIlluminant: boolean;
    backgroundYTowhitePointY: number;
    aw: number;
    nbb: number;
    ncb: number;
    c: number;
    nC: number;
    drgbInverse: number[];
    rgbD: number[];
    fl: number;
    fLRoot: number;
    z: number;
  }) {
    this.whitePoint = init.whitePoint;
    this.adaptingLuminance = init.adaptingLuminance;
    this.backgroundLstar = init.backgroundLstar;
    this.surround = init.surround;
    this.discountingIlluminant = init.discountingIlluminant;
    this.backgroundYTowhitePointY = init.backgroundYTowhitePointY;
    this.aw = init.aw;
    this.nbb = init.nbb;
    this.ncb = init.ncb;
    this.c = init.c;
    this.nC = init.nC;
    this.drgbInverse = init.drgbInverse;
    this.rgbD = init.rgbD;
    this.fl = init.fl;
    this.fLRoot = init.fLRoot;
    this.z = init.z;
  }

  /**
   * Convenience constructor for ViewingConditions.
   *
   * @param whitePoint coordinates of white in XYZ color space
   * @param adaptingLuminance light strength, in lux
   * @param backgroundLstar average luminance of 10 degrees around color
   * @param surround brightness of the entire environment
   * @param discountingIlluminant whether eyes have adjusted to lighting
   */
  static make(opts?: {
    whitePoint?: number[];
    adaptingLuminance?: number;
    backgroundLstar?: number;
    surround?: number;
    discountingIlluminant?: boolean;
  }): ViewingConditions {
    const {
      whitePoint = ColorUtils.whitePointD65(),
      adaptingLuminance: inputAdaptingLuminance = -1.0,
      backgroundLstar: inputBackgroundLstar = 50.0,
      surround: inputSurround = 2.0,
      discountingIlluminant = false,
    } = opts || {};

    let adaptingLuminance =
      inputAdaptingLuminance > 0.0
        ? inputAdaptingLuminance
        : (200.0 / Math.PI) * (ColorUtils.yFromLstar(50.0) / 100.0);

    // Avoid black background (non-physical, causes infinities)
    let backgroundLstar = Math.max(0.1, inputBackgroundLstar);

    // Transform test illuminant white in XYZ to 'cone'/'rgb' responses
    const rW = whitePoint[0]! * 0.401288 + whitePoint[1]! * 0.650173 + whitePoint[2]! * -0.051461;
    const gW = whitePoint[0]! * -0.250268 + whitePoint[1]! * 1.204414 + whitePoint[2]! * 0.045854;
    const bW = whitePoint[0]! * -0.002079 + whitePoint[1]! * 0.048952 + whitePoint[2]! * 0.953127;

    // Scale input surround, domain (0,2) → CAM16 surround domain (0.8,1.0)
    if (!(inputSurround >= 0.0 && inputSurround <= 2.0)) {
      throw new Error("Surround must be between 0.0 and 2.0");
    }
    const f = 0.8 + inputSurround / 10.0;

    // Exponential non-linearity
    const c =
      f >= 0.9
        ? MathUtils.lerp(0.59, 0.69, (f - 0.9) * 10.0)
        : MathUtils.lerp(0.525, 0.59, (f - 0.8) * 10.0);

    // Degree of adaptation to illuminant
    let d = discountingIlluminant
      ? 1.0
      : f * (1.0 - (1.0 / 3.6) * Math.exp((-adaptingLuminance - 42.0) / 92.0));
    if (d > 1.0) d = 1.0;
    else if (d < 0.0) d = 0.0;

    const nC = f;

    // Cone responses to the whitePoint, adjusted for discounting
    const rgbD = [
      d * (100.0 / rW) + 1.0 - d,
      d * (100.0 / gW) + 1.0 - d,
      d * (100.0 / bW) + 1.0 - d,
    ];

    const k = 1.0 / (5.0 * adaptingLuminance + 1.0);
    const k4 = k * k * k * k;
    const k4F = 1.0 - k4;

    // Luminance-level adaptation factor
    const fl =
      k4 * adaptingLuminance +
      0.1 * k4F * k4F * Math.pow(5.0 * adaptingLuminance, 1.0 / 3.0);

    // Ratio of background relative luminance to white relative luminance
    const n = ColorUtils.yFromLstar(backgroundLstar) / whitePoint[1]!;

    // Base exponential nonlinearity
    const z = 1.48 + Math.sqrt(n);

    // Luminance-level induction factors
    const nbb = 0.725 / Math.pow(n, 0.2);
    const ncb = nbb;

    // Discounted cone responses → perceptual nonlinearities
    const rgbAFactors = [
      Math.pow((fl * rgbD[0]! * rW) / 100.0, 0.42),
      Math.pow((fl * rgbD[1]! * gW) / 100.0, 0.42),
      Math.pow((fl * rgbD[2]! * bW) / 100.0, 0.42),
    ];
    const rgbA = [
      (400.0 * rgbAFactors[0]!) / (rgbAFactors[0]! + 27.13),
      (400.0 * rgbAFactors[1]!) / (rgbAFactors[1]! + 27.13),
      (400.0 * rgbAFactors[2]!) / (rgbAFactors[2]! + 27.13),
    ];

    const aw = ((40.0 * rgbA[0]! + 20.0 * rgbA[1]! + rgbA[2]!) / 20.0) * nbb;

    return new ViewingConditions({
      whitePoint,
      adaptingLuminance,
      backgroundLstar,
      surround: inputSurround,
      discountingIlluminant,
      backgroundYTowhitePointY: n,
      aw,
      nbb,
      ncb,
      c,
      nC,
      drgbInverse: [0.0, 0.0, 0.0], // placeholder like Dart
      rgbD,
      fl,
      fLRoot: Math.pow(fl, 0.25),
      z,
    });
  }
}
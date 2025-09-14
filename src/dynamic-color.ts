import Contrast from "./contrast";
import ContrastCurve from "./contrast-curve";
import DynamicScheme from "./dynamic-scheme";
import HueChromaTone from "./hue-chroma-tone";
import TonalPalette from "./tonal-palette";
import ToneDeltaPair from "./tone-delta-pair";

class DynamicColor {
  name: string;
  palette: (scheme: DynamicScheme) => TonalPalette;
  tone: (scheme: DynamicScheme) => number;
  isBackground: boolean;
  background: ((scheme: DynamicScheme) => DynamicColor) | undefined;
  secondaryBackground: ((scheme: DynamicScheme) => DynamicColor) | undefined;
  contrastCurve: ContrastCurve | undefined;
  toneDeltaPair: ((scheme: DynamicScheme) => ToneDeltaPair) | undefined;

  private hctCache: Map<DynamicScheme, HueChromaTone> = new Map();

  constructor(
    name: string,
    palette: (scheme: DynamicScheme) => TonalPalette,
    tone: (scheme: DynamicScheme) => number,
    isBackground: boolean = false,
    background?: (scheme: DynamicScheme) => DynamicColor,
    secondaryBackground?: (scheme: DynamicScheme) => DynamicColor,
    contrastCurve?: ContrastCurve,
    toneDeltaPair?: (scheme: DynamicScheme) => ToneDeltaPair
  ) {
    this.name = name;
    this.palette = palette;
    this.tone = tone;
    this.isBackground = isBackground;
    this.background = background;
    this.secondaryBackground = secondaryBackground;
    this.contrastCurve = contrastCurve;
    this.toneDeltaPair = toneDeltaPair;
  }

  static fromPalette(opts: {
    name?: string;
    palette: (scheme: DynamicScheme) => TonalPalette;
    tone: (scheme: DynamicScheme) => number;
    isBackground?: boolean;
    background?: (scheme: DynamicScheme) => DynamicColor;
    secondaryBackground?: (scheme: DynamicScheme) => DynamicColor;
    contrastCurve?: ContrastCurve;
    toneDeltaPair?: (scheme: DynamicScheme) => ToneDeltaPair;
  }): DynamicColor {
    return new DynamicColor(
      opts.name ?? "",
      opts.palette,
      opts.tone,
      opts.isBackground ?? false,
      opts.background,
      opts.secondaryBackground,
      opts.contrastCurve,
      opts.toneDeltaPair
    );
  }

  getArgb(scheme: DynamicScheme): number {
    return this.getHct(scheme).tone; // ⚠️ You’ll likely want `.toInt()` if you implement it in HueChromaTone
  }

  getHct(scheme: DynamicScheme): HueChromaTone {
    if (this.hctCache.has(scheme)) {
      return this.hctCache.get(scheme)!;
    }

    const tone = this.getTone(scheme);
    const hct = this.palette(scheme).getHct(tone);

    if (this.hctCache.size > 4) {
      this.hctCache.clear();
    }
    this.hctCache.set(scheme, hct);

    return hct;
  }

  getTone(scheme: DynamicScheme): number {
    const decreasingContrast = (scheme as any).contrastLevel < 0; // you’ll need to add `contrastLevel` + `isDark` to DynamicScheme

    // TODO: implement the full Dart logic here (toneDeltaPair handling, dual backgrounds, awkward zone fix, etc.)
    // For now, simplest case:
    let answer = this.tone(scheme);

    if (!this.background || !this.contrastCurve) {
      return answer;
    }

    const bgTone = this.background(scheme).getTone(scheme);
    const desiredRatio = this.contrastCurve.get((scheme as any).contrastLevel);

    // If not enough contrast, adjust foreground tone
    if (Contrast.ratioOfTones(bgTone, answer) < desiredRatio) {
      answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
    }

    if (decreasingContrast) {
      answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
    }

    return answer;
  }

  static foregroundTone(bgTone: number, ratio: number): number {
    const lighterTone = Contrast.lighterUnsafe(bgTone, ratio);
    const darkerTone = Contrast.darkerUnsafe(bgTone, ratio);
    const lighterRatio = Contrast.ratioOfTones(lighterTone, bgTone);
    const darkerRatio = Contrast.ratioOfTones(darkerTone, bgTone);
    const preferLighter = DynamicColor.tonePrefersLightForeground(bgTone);

    if (preferLighter) {
      const negligibleDifference =
        Math.abs(lighterRatio - darkerRatio) < 0.1 &&
        lighterRatio < ratio &&
        darkerRatio < ratio;
      return lighterRatio >= ratio ||
        lighterRatio >= darkerRatio ||
        negligibleDifference
        ? lighterTone
        : darkerTone;
    } else {
      return darkerRatio >= ratio || darkerRatio >= lighterRatio
        ? darkerTone
        : lighterTone;
    }
  }

  static enableLightForeground(tone: number): number {
    if (DynamicColor.tonePrefersLightForeground(tone) &&
        !DynamicColor.toneAllowsLightForeground(tone)) {
      return 49.0;
    }
    return tone;
  }

  static tonePrefersLightForeground(tone: number): boolean {
    return Math.round(tone) < 60;
  }

  static toneAllowsLightForeground(tone: number): boolean {
    return Math.round(tone) <= 49;
  }
}

export default DynamicColor;
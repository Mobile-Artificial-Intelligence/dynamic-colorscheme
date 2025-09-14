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
    return this.getHct(scheme).toInt();
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
    const decreasingContrast = scheme.contrastLevel < 0;
  
    // Case 1: dual foreground, pair of colors with delta constraint
    if (this.toneDeltaPair) {
      const pair = this.toneDeltaPair(scheme);
      const roleA = pair.roleA;
      const roleB = pair.roleB;
      const delta = pair.delta;
      const polarity = pair.polarity;
      const stayTogether = pair.stayTogether;
  
      const bg = this.background!(scheme);
      const bgTone = bg.getTone(scheme);
  
      const aIsNearer =
        polarity === "nearer" ||
        (polarity === "lighter" && !scheme.isDark) ||
        (polarity === "darker" && scheme.isDark);
      const nearer = aIsNearer ? roleA : roleB;
      const farther = aIsNearer ? roleB : roleA;
      const amNearer = this.name === nearer.name;
      const expansionDir = scheme.isDark ? 1 : -1;
  
      // 1st round: solve to min, each
      const nContrast = nearer.contrastCurve!.get(scheme.contrastLevel);
      const fContrast = farther.contrastCurve!.get(scheme.contrastLevel);
  
      // Initial + adjusted tones
      const nInitialTone = nearer.tone(scheme);
      let nTone =
        Contrast.ratioOfTones(bgTone, nInitialTone) >= nContrast
          ? nInitialTone
          : DynamicColor.foregroundTone(bgTone, nContrast);
  
      const fInitialTone = farther.tone(scheme);
      let fTone =
        Contrast.ratioOfTones(bgTone, fInitialTone) >= fContrast
          ? fInitialTone
          : DynamicColor.foregroundTone(bgTone, fContrast);
  
      if (decreasingContrast) {
        nTone = DynamicColor.foregroundTone(bgTone, nContrast);
        fTone = DynamicColor.foregroundTone(bgTone, fContrast);
      }
  
      if ((fTone - nTone) * expansionDir < delta) {
        // expand farther
        fTone = Math.max(0, Math.min(100, nTone + delta * expansionDir));
        if ((fTone - nTone) * expansionDir < delta) {
          // contract nearer
          nTone = Math.max(0, Math.min(100, fTone - delta * expansionDir));
        }
      }
  
      // Avoid awkward 50–59 zone
      if (50 <= nTone && nTone < 60) {
        if (expansionDir > 0) {
          nTone = 60;
          fTone = Math.max(fTone, nTone + delta * expansionDir);
        } else {
          nTone = 49;
          fTone = Math.min(fTone, nTone + delta * expansionDir);
        }
      } else if (50 <= fTone && fTone < 60) {
        if (stayTogether) {
          if (expansionDir > 0) {
            nTone = 60;
            fTone = Math.max(fTone, nTone + delta * expansionDir);
          } else {
            nTone = 49;
            fTone = Math.min(fTone, nTone + delta * expansionDir);
          }
        } else {
          fTone = expansionDir > 0 ? 60 : 49;
        }
      }
  
      return amNearer ? nTone : fTone;
    }
  
    // Case 2: no pair — solve for itself
    let answer = this.tone(scheme);
    if (!this.background) {
      return answer;
    }
  
    const bgTone = this.background(scheme).getTone(scheme);
    const desiredRatio = this.contrastCurve!.get(scheme.contrastLevel);
  
    if (Contrast.ratioOfTones(bgTone, answer) < desiredRatio) {
      answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
    }
  
    if (decreasingContrast) {
      answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
    }
  
    if (this.isBackground && 50 <= answer && answer < 60) {
      answer =
        Contrast.ratioOfTones(49, bgTone) >= desiredRatio ? 49 : 60;
    }
  
    // Case 3: adjust for dual backgrounds
    if (this.secondaryBackground) {
      const bgTone1 = this.background(scheme).getTone(scheme);
      const bgTone2 = this.secondaryBackground(scheme).getTone(scheme);
  
      const upper = Math.max(bgTone1, bgTone2);
      const lower = Math.min(bgTone1, bgTone2);
  
      if (
        Contrast.ratioOfTones(upper, answer) >= desiredRatio &&
        Contrast.ratioOfTones(lower, answer) >= desiredRatio
      ) {
        return answer;
      }
  
      const lightOption = Contrast.lighter(upper, desiredRatio);
      const darkOption = Contrast.darker(lower, desiredRatio);
  
      const availables: number[] = [];
      if (lightOption !== -1) availables.push(lightOption);
      if (darkOption !== -1) availables.push(darkOption);
  
      const prefersLight =
        DynamicColor.tonePrefersLightForeground(bgTone1) ||
        DynamicColor.tonePrefersLightForeground(bgTone2);
  
      if (prefersLight) {
        return lightOption < 0 ? 100 : lightOption;
      }
      if (availables.length === 1) {
        return availables[0]!;
      }
      return darkOption < 0 ? 0 : darkOption;
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
import HueChromaTone from "./hue-chroma-tone";
import TonalPalette from "./tonal-palette";
import DynamicColor from "./dynamic-color";
import DynamicColors from "./dynamic-colors";
import { sanitizeDegreesDouble } from "./utilities";

export type Variant =
  | "monochrome"
  | "neutral"
  | "tonal-spot"
  | "vibrant"
  | "expressive"
  | "content"
  | "fidelity"
  | "rainbow"
  | "fruit-salad";

class DynamicScheme {
  sourceColorArgb: number;
  sourceColorHct: HueChromaTone;

  variant: Variant;
  isDark: boolean;
  contrastLevel: number;

  primaryPalette: TonalPalette;
  secondaryPalette: TonalPalette;
  tertiaryPalette: TonalPalette;
  neutralPalette: TonalPalette;
  neutralVariantPalette: TonalPalette;
  errorPalette: TonalPalette;

  constructor(
    sourceColorArgb: number,
    variant: Variant,
    isDark: boolean,
    primary: TonalPalette,
    secondary: TonalPalette,
    tertiary: TonalPalette,
    neutral: TonalPalette,
    neutralVariant: TonalPalette,
    contrastLevel: number = 0.0
  ) {
    this.sourceColorArgb = sourceColorArgb;
    this.sourceColorHct = HueChromaTone.fromInt(sourceColorArgb);

    this.variant = variant;
    this.isDark = isDark;
    this.contrastLevel = contrastLevel;

    this.primaryPalette = primary;
    this.secondaryPalette = secondary;
    this.tertiaryPalette = tertiary;
    this.neutralPalette = neutral;
    this.neutralVariantPalette = neutralVariant;
    this.errorPalette = TonalPalette.of(25.0, 84.0); // fixed palette
  }

  /** Utility: rotate hue based on source + given thresholds */
  static getRotatedHue(
    sourceColor: HueChromaTone,
    hues: number[],
    rotations: number[]
  ): number {
    const sourceHue = sourceColor.hue;
    if (hues.length !== rotations.length) {
      throw new Error("hues and rotations must be same length");
    }

    if (rotations.length === 1) {
      return sanitizeDegreesDouble(sourceColor.hue + rotations[0]!);
    }

    const size = hues.length;
    for (let i = 0; i <= size - 2; i++) {
      const thisHue = hues[i];
      const nextHue = hues[i + 1];
      if (thisHue! < sourceHue && sourceHue < nextHue!) {
        return sanitizeDegreesDouble(sourceHue + rotations[i]!);
      }
    }

    // fallback
    return sourceHue;
  }

  /** Get HCT of a dynamic color within this scheme */
  getHct(dynamicColor: DynamicColor): HueChromaTone {
    return dynamicColor.getHct(this);
  }

  /** Get ARGB int of a dynamic color within this scheme */
  getArgb(dynamicColor: DynamicColor): number {
    return dynamicColor.getArgb(this);
  }

  // === Getters (match Dart exactly) ===
  get primaryPaletteKeyColor() {
    return this.getArgb(DynamicColors.primaryPaletteKeyColor);
  }
  get secondaryPaletteKeyColor() {
    return this.getArgb(DynamicColors.secondaryPaletteKeyColor);
  }
  get tertiaryPaletteKeyColor() {
    return this.getArgb(DynamicColors.tertiaryPaletteKeyColor);
  }
  get neutralPaletteKeyColor() {
    return this.getArgb(DynamicColors.neutralPaletteKeyColor);
  }
  get neutralVariantPaletteKeyColor() {
    return this.getArgb(DynamicColors.neutralVariantPaletteKeyColor);
  }

  get background() {
    return this.getArgb(DynamicColors.background);
  }
  get onBackground() {
    return this.getArgb(DynamicColors.onBackground);
  }
  get surface() {
    return this.getArgb(DynamicColors.surface);
  }
  get surfaceDim() {
    return this.getArgb(DynamicColors.surfaceDim);
  }
  get surfaceBright() {
    return this.getArgb(DynamicColors.surfaceBright);
  }
  get surfaceContainerLowest() {
    return this.getArgb(DynamicColors.surfaceContainerLowest);
  }
  get surfaceContainerLow() {
    return this.getArgb(DynamicColors.surfaceContainerLow);
  }
  get surfaceContainer() {
    return this.getArgb(DynamicColors.surfaceContainer);
  }
  get surfaceContainerHigh() {
    return this.getArgb(DynamicColors.surfaceContainerHigh);
  }
  get surfaceContainerHighest() {
    return this.getArgb(DynamicColors.surfaceContainerHighest);
  }
  get onSurface() {
    return this.getArgb(DynamicColors.onSurface);
  }
  get surfaceVariant() {
    return this.getArgb(DynamicColors.surfaceVariant);
  }
  get onSurfaceVariant() {
    return this.getArgb(DynamicColors.onSurfaceVariant);
  }
  get inverseSurface() {
    return this.getArgb(DynamicColors.inverseSurface);
  }
  get inverseOnSurface() {
    return this.getArgb(DynamicColors.inverseOnSurface);
  }
  get outline() {
    return this.getArgb(DynamicColors.outline);
  }
  get outlineVariant() {
    return this.getArgb(DynamicColors.outlineVariant);
  }
  get shadow() {
    return this.getArgb(DynamicColors.shadow);
  }
  get scrim() {
    return this.getArgb(DynamicColors.scrim);
  }
  get surfaceTint() {
    return this.getArgb(DynamicColors.surfaceTint);
  }

  get primary() {
    return this.getArgb(DynamicColors.primary);
  }
  get onPrimary() {
    return this.getArgb(DynamicColors.onPrimary);
  }
  get primaryContainer() {
    return this.getArgb(DynamicColors.primaryContainer);
  }
  get onPrimaryContainer() {
    return this.getArgb(DynamicColors.onPrimaryContainer);
  }
  get inversePrimary() {
    return this.getArgb(DynamicColors.inversePrimary);
  }

  get secondary() {
    return this.getArgb(DynamicColors.secondary);
  }
  get onSecondary() {
    return this.getArgb(DynamicColors.onSecondary);
  }
  get secondaryContainer() {
    return this.getArgb(DynamicColors.secondaryContainer);
  }
  get onSecondaryContainer() {
    return this.getArgb(DynamicColors.onSecondaryContainer);
  }

  get tertiary() {
    return this.getArgb(DynamicColors.tertiary);
  }
  get onTertiary() {
    return this.getArgb(DynamicColors.onTertiary);
  }
  get tertiaryContainer() {
    return this.getArgb(DynamicColors.tertiaryContainer);
  }
  get onTertiaryContainer() {
    return this.getArgb(DynamicColors.onTertiaryContainer);
  }

  get error() {
    return this.getArgb(DynamicColors.error);
  }
  get onError() {
    return this.getArgb(DynamicColors.onError);
  }
  get errorContainer() {
    return this.getArgb(DynamicColors.errorContainer);
  }
  get onErrorContainer() {
    return this.getArgb(DynamicColors.onErrorContainer);
  }

  get primaryFixed() {
    return this.getArgb(DynamicColors.primaryFixed);
  }
  get primaryFixedDim() {
    return this.getArgb(DynamicColors.primaryFixedDim);
  }
  get onPrimaryFixed() {
    return this.getArgb(DynamicColors.onPrimaryFixed);
  }
  get onPrimaryFixedVariant() {
    return this.getArgb(DynamicColors.onPrimaryFixedVariant);
  }

  get secondaryFixed() {
    return this.getArgb(DynamicColors.secondaryFixed);
  }
  get secondaryFixedDim() {
    return this.getArgb(DynamicColors.secondaryFixedDim);
  }
  get onSecondaryFixed() {
    return this.getArgb(DynamicColors.onSecondaryFixed);
  }
  get onSecondaryFixedVariant() {
    return this.getArgb(DynamicColors.onSecondaryFixedVariant);
  }

  get tertiaryFixed() {
    return this.getArgb(DynamicColors.tertiaryFixed);
  }
  get tertiaryFixedDim() {
    return this.getArgb(DynamicColors.tertiaryFixedDim);
  }
  get onTertiaryFixed() {
    return this.getArgb(DynamicColors.onTertiaryFixed);
  }
  get onTertiaryFixedVariant() {
    return this.getArgb(DynamicColors.onTertiaryFixedVariant);
  }
}

export default DynamicScheme;

import HueChromaTone from "./hue-chroma-tone";
import TonalPalette from "./tonal-palette";

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
    this.errorPalette = TonalPalette.of(25.0, 84.0); // matches Dart
  }
}

export default DynamicScheme;

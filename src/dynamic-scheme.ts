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
  variant: Variant;
  isDark: boolean;
  contrastLevel: number; // -1.0 → 1.0
  primaryPalette: TonalPalette;
  secondaryPalette: TonalPalette;
  tertiaryPalette: TonalPalette;
  neutralPalette: TonalPalette;
  neutralVariantPalette: TonalPalette;
  errorPalette: TonalPalette;

  constructor(
    variant: Variant,
    isDark: boolean,
    primary: TonalPalette,
    secondary: TonalPalette,
    tertiary: TonalPalette,
    neutral: TonalPalette,
    neutralVariant: TonalPalette,
    error: TonalPalette,
    contrastLevel: number = 0.0 // default: standard
  ) {
    this.variant = variant;
    this.isDark = isDark;
    this.primaryPalette = primary;
    this.secondaryPalette = secondary;
    this.tertiaryPalette = tertiary;
    this.neutralPalette = neutral;
    this.neutralVariantPalette = neutralVariant;
    this.errorPalette = error;
    this.contrastLevel = contrastLevel;
  }
}

export default DynamicScheme;

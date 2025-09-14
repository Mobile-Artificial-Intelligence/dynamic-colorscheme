import TonalPalette from "./tonal-palette";

type Variant = "monochrome" | "neutral" | "tonal-spot" | "vibrant" | "expressive" | "content" | "fidelity" | "rainbow" | "fruit-salad";

class DynamicScheme {
  variant: Variant;
  isDark: boolean;
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
    error: TonalPalette
  ) {
    this.variant = variant;
    this.isDark = isDark;
    this.primaryPalette = primary;
    this.secondaryPalette = secondary;
    this.tertiaryPalette = tertiary;
    this.neutralPalette = neutral;
    this.neutralVariantPalette = neutralVariant;
    this.errorPalette = error;
  }
}

export default DynamicScheme;
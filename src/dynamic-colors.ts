import ContrastCurve from "./contrast-curve";
import DynamicColor from "./dynamic-color";
import DynamicScheme from "./dynamic-scheme";

function isFidelity(s: DynamicScheme): boolean {
  return s.variant === "fidelity" || s.variant === "content";
}

function isMonochrome(s: DynamicScheme): boolean {
  return s.variant === "monochrome";
}

class DynamicColors {
  static contentAccentToneDelta = 15.0;
  static highestSurface(s: DynamicScheme): DynamicColor {
    return s.isDark ? DynamicColors.surfaceBright : DynamicColors.surfaceDim;
  }

  static primaryPaletteKeyColor = DynamicColor.fromPalette({
    name: 'primary_palette_key_color',
    palette: (s) => s.primaryPalette,
    tone: (s) => s.primaryPalette.keyColor.tone,
  });

  static secondaryPaletteKeyColor = DynamicColor.fromPalette({
    name: 'secondary_palette_key_color',
    palette: (s) => s.secondaryPalette,
    tone: (s) => s.secondaryPalette.keyColor.tone,
  });

  static tertiaryPaletteKeyColor = DynamicColor.fromPalette({
    name: 'tertiary_palette_key_color',
    palette: (s) => s.tertiaryPalette,
    tone: (s) => s.tertiaryPalette.keyColor.tone,
  });

  static neutralPaletteKeyColor = DynamicColor.fromPalette({
    name: 'neutral_palette_key_color',
    palette: (s) => s.neutralPalette,
    tone: (s) => s.neutralPalette.keyColor.tone,
  });

  static neutralVariantPaletteKeyColor = DynamicColor.fromPalette({
    name: 'neutral_variant_palette_key_color',
    palette: (s) => s.neutralVariantPalette,
    tone: (s) => s.neutralVariantPalette.keyColor.tone,
  });

  static background = DynamicColor.fromPalette({
    name: 'background',
    palette: (s) => s.neutralPalette,
    tone: (s) => s.isDark ? 6 : 98,
    isBackground: true,
  });

  static onBackground = DynamicColor.fromPalette({
    name: 'on_background',
    palette: (s) => s.neutralPalette,
    tone: (s) => s.isDark ? 90 : 10,
    background: (s) => DynamicColors.background,
    contrastCurve: new ContrastCurve(3, 3, 4.5, 7),
  });

  static surface = DynamicColor.fromPalette({
    name: "surface",
    palette: (s) => s.neutralPalette,
    tone: (s) => (s.isDark ? 6 : 98),
    isBackground: true,
  });

  static surfaceDim = DynamicColor.fromPalette({
    name: "surface_dim",
    palette: (s) => s.neutralPalette,
    tone: (s) =>
      s.isDark ? 6 : new ContrastCurve(87, 87, 80, 75).get(s.contrastLevel),
    isBackground: true,
  });

  static surfaceBright = DynamicColor.fromPalette({
    name: "surface_bright",
    palette: (s) => s.neutralPalette,
    tone: (s) =>
      s.isDark ? new ContrastCurve(24, 24, 29, 34).get(s.contrastLevel) : 98,
    isBackground: true,
  });

  static surfaceContainerLowest = DynamicColor.fromPalette({
    name: "surface_container_lowest",
    palette: (s) => s.neutralPalette,
    tone: (s) => (s.isDark ? new ContrastCurve(4, 4, 2, 0).get(s.contrastLevel) : 100),
    isBackground: true,
  });

  static surfaceContainerLow = DynamicColor.fromPalette({
    name: "surface_container_low",
    palette: (s) => s.neutralPalette,
    tone: (s) =>
      s.isDark
        ? new ContrastCurve(10, 10, 11, 12).get(s.contrastLevel)
        : new ContrastCurve(96, 96, 96, 95).get(s.contrastLevel),
    isBackground: true,
  });

  static surfaceContainer = DynamicColor.fromPalette({
    name: "surface_container",
    palette: (s) => s.neutralPalette,
    tone: (s) =>
      s.isDark
        ? new ContrastCurve(12, 12, 16, 20).get(s.contrastLevel)
        : new ContrastCurve(94, 94, 92, 90).get(s.contrastLevel),
    isBackground: true,
  });

  static surfaceContainerHigh = DynamicColor.fromPalette({
    name: "surface_container_high",
    palette: (s) => s.neutralPalette,
    tone: (s) =>
      s.isDark
        ? new ContrastCurve(17, 17, 21, 25).get(s.contrastLevel)
        : new ContrastCurve(92, 92, 88, 85).get(s.contrastLevel),
    isBackground: true,
  });

  static surfaceContainerHighest = DynamicColor.fromPalette({
    name: "surface_container_highest",
    palette: (s) => s.neutralPalette,
    tone: (s) =>
      s.isDark
        ? new ContrastCurve(22, 22, 26, 30).get(s.contrastLevel)
        : new ContrastCurve(90, 90, 84, 80).get(s.contrastLevel),
    isBackground: true,
  });

  static onSurface = DynamicColor.fromPalette({
    name: "on_surface",
    palette: (s) => s.neutralPalette,
    tone: (s) => (s.isDark ? 90 : 10),
    background: (s) => DynamicColors.highestSurface(s),
    contrastCurve: new ContrastCurve(4.5, 7, 11, 21),
  });

  static surfaceVariant = DynamicColor.fromPalette({
    name: "surface_variant",
    palette: (s) => s.neutralVariantPalette,
    tone: (s) => (s.isDark ? 30 : 90),
    isBackground: true,
  });

  static onSurfaceVariant = DynamicColor.fromPalette({
    name: "on_surface_variant",
    palette: (s) => s.neutralVariantPalette,
    tone: (s) => (s.isDark ? 80 : 30),
    background: (s) => DynamicColors.highestSurface(s),
    contrastCurve: new ContrastCurve(3, 4.5, 7, 11),
  });

  static inverseSurface = DynamicColor.fromPalette({
    name: "inverse_surface",
    palette: (s) => s.neutralPalette,
    tone: (s) => (s.isDark ? 90 : 20),
  });

  static inverseOnSurface = DynamicColor.fromPalette({
    name: "inverse_on_surface",
    palette: (s) => s.neutralPalette,
    tone: (s) => (s.isDark ? 20 : 95),
    background: (s) => DynamicColors.inverseSurface,
    contrastCurve: new ContrastCurve(4.5, 7, 11, 21),
  });
}

export default DynamicColors;
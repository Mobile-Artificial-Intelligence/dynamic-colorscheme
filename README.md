# dynamic-colorscheme

A lightweight TypeScript/JavaScript package for generating **Material Design 3 dynamic color schemes**.
Built on top of [Material Color Utilities](https://github.com/material-foundation/material-color-utilities), it allows you to create consistent, accessible, and theme-aware color palettes from a single seed color.

## ✨ Features

* 🎨 Generate full Material Design color schemes (`light` or `dark`) from a seed color.
* ♿ Contrast-aware and accessible by default.
* 🔄 Includes dynamic roles: primary, secondary, tertiary, error, surface, background, outline, etc.
* 🔧 Supports contrast level adjustment (`-1.0` → low, `0.0` → normal, `1.0` → high).
* 📦 Simple TypeScript API with type definitions.

## 📦 Installation

```bash
npm install dynamic-colorscheme
```

or with Yarn:

```bash
yarn add dynamic-colorscheme
```

## 🚀 Usage

```ts
import { createColorScheme, Brightness, ColorScheme } from "dynamic-colorscheme";

// Generate a light scheme from a blue seed color
const lightScheme: ColorScheme = createColorScheme("#3a3a3a", "light");

// Generate a dark scheme with higher contrast
const darkScheme: ColorScheme = createColorScheme("#3a3a3a", "dark", 0.5);

console.log(lightScheme.primary); // e.g. "#6750A4"
console.log(darkScheme.surface);  // e.g. "#121212"
```

## 🎨 API

### `createColorScheme(seedColor: string, brightness?: Brightness, contrastLevel?: number): ColorScheme`

#### Parameters

* **`seedColor`**: `string` — Hex color string (`#RRGGBB`) used as the seed.
* **`brightness`**: `"light"` | `"dark"` — Defaults to `"light"`.
* **`contrastLevel`**: `number` — Contrast adjustment (`-1.0` → low, `0.0` → default, `1.0` → high). Defaults to `0.0`.

#### Returns

A fully populated `ColorScheme` object:

```ts
interface ColorScheme {
  brightness: "light" | "dark";

  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  onPrimaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixedVariant: string;

  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixedVariant: string;

  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixedVariant: string;

  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  surface: string;
  onSurface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;

  inverseSurface: string;
  inversePrimary: string;

  surfaceTint: string;
}
```

## 🛠 Example: Apply to a UI

```ts
import { createColorScheme } from "dynamic-colorscheme";

// Pick a brand color
const scheme = createColorScheme("#ff5722", "light");

document.body.style.backgroundColor = scheme.surface;
document.body.style.color = scheme.onSurface;

const button = document.createElement("button");
button.style.backgroundColor = scheme.primary;
button.style.color = scheme.onPrimary;
button.innerText = "Click Me";
document.body.appendChild(button);
```

## 📚 Related

* [Material Design 3](https://m3.material.io/)
* [Material Color Utilities](https://github.com/material-foundation/material-color-utilities)

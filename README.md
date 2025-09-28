# Baseline Vanguard 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![Tech](https://img.shields.io/badge/tech-ESLint%20%7C%20Stylelint%20%7C%20Svelte-orange.svg)

### ✨ [Try the Live Interactive Playground!](https://baseline-vanguard-playground-nvkf.vercel.app) ✨

An intelligent ESLint and Stylelint tool that helps developers adopt modern web features by automatically providing fixes and performance suggestions based on [Web Platform Baseline](https://web.dev/blog/baseline) data.


![Demo GIF of Baseline Vanguard](demo.gif)

## The Problem

Modern web development moves fast. It's hard to know when a new CSS or JavaScript feature is **safe to use** in production. This leads to time-consuming checks on sites like MDN or CanIUse, or worse, avoiding powerful modern features altogether.

## The Solution: A Proactive Co-pilot

Baseline Vanguard is more than just a checker; it's a **proactive co-pilot for modernization**. It integrates directly into your workflow to:

1.  **Identify** code that isn't universally supported according to Baseline.
2.  **Automatically fix** it by applying safe fallbacks or progressive enhancement.
3.  **Suggest** performance improvements where modern native APIs can replace heavy libraries.

## What Vanguard Can Fix Right Now

This project provides a robust proof-of-concept with several high-impact rules:

#### JavaScript (via ESLint)
*   **`Array.prototype.at()`**: Automatically replaces `.at(index)` with a robust, index-safe fallback that works in all browsers.
*   **`Object.prototype.hasOwnProperty()`**: Modernizes your code by replacing this unsafe pattern with the safer, recommended `Object.hasOwn()`.
*   **Performance Suggestion (`moment.js`)**: A unique rule that detects the import of the heavy `moment.js` library and suggests using the native `Intl` API, helping you reduce your app's bundle size.

#### CSS (via Stylelint)
*   **`:has()` selector**: Automatically wraps any rule using the `:has()` selector in a `@supports (selector(:has(*)))` block, ensuring progressive enhancement.
*   **`@container` queries**: Automatically wraps any `@container` at-rule in a `@supports (container-type: inline-size)` block, allowing you to use modern layout techniques safely.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/SwapnilSonawane894/baseline-vanguard.git
cd baseline-vanguard

# Install dependencies
pnpm install
```

## Running the Demo Locally

```bash
# Run the linters and auto-fixers on the demo files
pnpm demo:fix:js
pnpm demo:fix:css

# Run the interactive web playground locally
pnpm playground:dev
```

## Easy Configuration

Our plugins come with a recommended configuration to get you started instantly with zero setup.

**ESLint Setup (.eslintrc.js):**

```javascript
module.exports = {
  // ... your other config
  extends: [
    "eslint:recommended",
    "plugin:@baseline-vanguard/baseline/recommended"
  ]
};
```

**Stylelint Setup (.stylelintrc.js):**

```javascript
module.exports = {
  // ... your other config
  plugins: ["@baseline-vanguard/stylelint-plugin-baseline"],
  rules: {
    "baseline/detect-unsupported-css-features": true
  }
};
```

## Install Dependencies
pnpm install
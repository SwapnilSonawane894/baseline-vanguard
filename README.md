# Baseline Vanguard 🛡️

### ✨ [Live Interactive Playground](URL_TO_YOUR_LIVE_PLAYGROUND_HERE) ✨

An intelligent ESLint and Stylelint tool that helps developers adopt modern web features by automatically providing fixes and performance suggestions based on [Web Platform Baseline](https://web.dev/blog/baseline) data.

![Demo GIF](URL_TO_YOUR_DEMO_GIF_HERE)

## The Problem

Modern web development moves fast. It can be difficult to know when a new CSS or JavaScript feature is safe to use in production. This often leads to time-consuming checks on sites like MDN or CanIUse, or worse, avoiding modern features altogether.

## The Solution

Baseline Vanguard integrates directly into your workflow to solve this problem. It uses Baseline compatibility data to:

1.  **Identify** code that isn't universally supported.
2.  **Automatically fix** it by applying safe fallbacks or progressive enhancement.
3.  **Suggest** performance improvements where modern native APIs can replace heavy libraries.

## Core Features

-   **Intelligent Fixes for JavaScript:** Detects non-Baseline JS features (like `Array.prototype.at()`) and modernizes unsafe patterns (like `obj.hasOwnProperty()`) with a single `--fix` command.
-   **Automated Progressive Enhancement for CSS:** Automatically wraps non-Baseline CSS features (like the `:has()` selector and `@container` queries) in `@supports` blocks.
-   **Performance-Aware Suggestions:** A unique ESLint rule identifies heavy libraries (like `moment.js`) and suggests using native, Baseline-supported APIs (`Intl`) to help reduce bundle size.
-   **Configurable & Testable:** The core rules are configurable and proven with unit tests to ensure reliability.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME_HERE/baseline-vanguard.git
cd baseline-vanguard

# Install dependencies
pnpm install
```

## Running the Demo Locally

```bash
# Run the linters and auto-fixers on the demo files
pnpm demo:fix:js
pnpm demo:fix:css

# Run the interactive web playground
pnpm playground:dev
```

## Configuration

Our plugins come with a `recommended` configuration to get you started instantly.

**ESLint Setup (`.eslintrc.js`):**
```javascript
module.exports = {
  // ... your other config
  extends: [
    "eslint:recommended",
    "plugin:@baseline-vanguard/baseline/recommended"
  ]
};
```

**Stylelint Setup (`.stylelintrc.js`):**

```javascript
module.exports = {
  // ... your other config
  plugins: ["@baseline-vanguard/stylelint-plugin-baseline"],
  rules: {
    "baseline/detect-unsupported-css-features": true
  }
};
```

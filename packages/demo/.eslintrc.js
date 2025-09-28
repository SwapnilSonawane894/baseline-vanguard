module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "script"
  },
  "plugins": [
    "@baseline-vanguard/baseline"
  ],
  "rules": {
    "@baseline-vanguard/baseline/detect-unsupported-js-features": "error",
    "@baseline-vanguard/baseline/no-heavy-alternatives": "warn"
  }
};

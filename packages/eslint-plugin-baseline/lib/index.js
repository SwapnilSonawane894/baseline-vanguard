const detectUnsupportedJsFeatures = require('./rules/detect-unsupported-js-features');
const noHeavyAlternatives = require('./rules/no-heavy-alternatives');

module.exports = {
  rules: {
    'detect-unsupported-js-features': detectUnsupportedJsFeatures,
    'no-heavy-alternatives': noHeavyAlternatives
  },
  configs: {
    recommended: {
      plugins: ['@baseline-vanguard/baseline'],
      rules: {
        // Now we pass the configuration object
        '@baseline-vanguard/baseline/detect-unsupported-js-features': ['error', { supportLevel: 'high' }],
        '@baseline-vanguard/baseline/no-heavy-alternatives': 'warn',
      },
    },
  },
};
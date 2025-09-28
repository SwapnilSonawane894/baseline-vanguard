import detectUnsupportedJsFeatures from './rules/detect-unsupported-js-features.js';
import noHeavyAlternatives from './rules/no-heavy-alternatives.js';

const rules = {
  'detect-unsupported-js-features': detectUnsupportedJsFeatures,
  'no-heavy-alternatives': noHeavyAlternatives,
};

const configs = {
  recommended: {
    plugins: ['@baseline-vanguard/baseline'],
    rules: {
      '@baseline-vanguard/baseline/detect-unsupported-js-features': ['error', { supportLevel: 'high' }],
      '@baseline-vanguard/baseline/no-heavy-alternatives': 'warn',
    },
  },
};

export default { rules, configs };
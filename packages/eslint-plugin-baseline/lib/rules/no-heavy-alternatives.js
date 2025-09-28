/**
 * @fileoverview Rule to suggest replacing heavy third-party libraries with native, Baseline-supported APIs.
 * @author Your Name
 */
const webFeatures = require('web-features');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Suggests replacing heavy third-party libraries with native, Baseline-supported APIs to improve performance.",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
        preferNative: "The native 'Intl' API is Baseline-supported and can often replace 'moment.js', potentially reducing final bundle size."
    }
  },
  create: function(context) {
    return {
      // Rule: Suggests native 'Intl' API as a lighter alternative to 'moment.js'
      // when 'Intl' is considered Baseline.
      ImportDeclaration(node) {
        if (node.source.value === 'moment') {
          const featureId = 'javascript.builtins.Intl';
          const featureData = webFeatures[featureId];

          if (featureData && featureData.status.baseline === 'high') {
            context.report({
              node: node.source,
              messageId: 'preferNative'
            });
          }
        }
      }
    };
  }
};
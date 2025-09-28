import * as webFeatures from 'web-features';

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Suggests replacing heavy third-party libraries with native, Baseline APIs to improve performance.",
      recommended: true,
    },
    fixable: null,
    schema: [],
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
              message: "'moment.js' is a large library. The native 'Intl' API is now Baseline and can handle date/time formatting with zero impact on your bundle size. Consider refactoring."
            });
          }
        }
      }
    };
  }
};
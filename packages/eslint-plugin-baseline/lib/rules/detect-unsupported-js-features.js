'use strict';
const webFeatures = require('web-features');

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Detects JavaScript features that are not yet Baseline and suggests modern, safe alternatives.",
      recommended: true,
    },
    fixable: "code",
    // We define a schema so users can configure the rule.
    // This allows them to choose between 'high' (stable) and 'low' (newly available) baseline support.
    schema: [
      {
        type: "object",
        properties: {
          supportLevel: {
            enum: ["high", "low"],
            default: "high"
          }
        },
        additionalProperties: false
      }
    ],
  },
  create: function(context) {
    // Read the user's configured support level, defaulting to 'high' for maximum compatibility.
    const options = context.options[0] || {};
    const supportLevel = options.supportLevel || 'high';
    const sourceCode = context.getSourceCode();

    return {
      // We visit every `CallExpression` node in the AST (e.g., `myArray.at(-1)` or `obj.hasOwnProperty('key')`)
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return;
        const propertyName = node.callee.property.name;

        // --- Rule Logic for `Array.prototype.at()` ---
        if (propertyName === 'at') {
          const featureId = 'javascript.builtins.Array.at';
          const featureData = webFeatures[featureId];

          if (featureData && featureData.status.baseline !== supportLevel) {
            context.report({
              node: node.callee.property,
              message: `'Array.prototype.at()' does not meet the configured Baseline support level of '${supportLevel}'.`,
              fix(fixer) {
                // To create a robust fix, we get the full text of the object (`user.posts`)
                // and the argument (`-1`) directly from the source code.
                const objectText = sourceCode.getText(node.callee.object);
                const argumentText = sourceCode.getText(node.arguments[0]);

                if (!node.arguments[0] || node.arguments.length > 1) return null;

                // This ternary logic correctly handles both positive and negative indices.
                return fixer.replaceText(node, `${objectText}[(${argumentText} < 0) ? ${objectText}.length + (${argumentText}) : ${argumentText}]`);
              }
            });
          }
        }
        
        // --- Rule Logic for `hasOwnProperty` ---
        if (propertyName === 'hasOwnProperty') {
            // This is a modernization rule, so we always suggest the safer `Object.hasOwn`.
            context.report({
                node: node.callee.property,
                message: "'hasOwnProperty' can be unsafe. Use the auto-fix to refactor to the modern 'Object.hasOwn()'.",
                fix(fixer) {
                    const objectText = sourceCode.getText(node.callee.object);
                    const argumentText = sourceCode.getText(node.arguments[0]);
                    if (!node.arguments[0] || node.arguments.length > 1) return null;
                    return fixer.replaceText(node, `Object.hasOwn(${objectText}, ${argumentText})`);
                }
            });
        }
      }
    };
  }
};
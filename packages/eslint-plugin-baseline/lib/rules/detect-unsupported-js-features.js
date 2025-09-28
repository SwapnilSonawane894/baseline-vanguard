'use strict';
import * as webFeatures from 'web-features';

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Detects JavaScript features that are not yet Baseline and suggests modern, safe alternatives.",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },
  create: function (context) {
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
          context.report({
            node: node.callee.property,
            message: `'.at()' is not supported in all environments. Use the auto-fix for a robust bracket notation fallback.`,
            fix(fixer) {
              const objectText = sourceCode.getText(node.callee.object);
              const argumentText = sourceCode.getText(node.arguments[0]);
              if (!node.arguments[0] || node.arguments.length > 1) return null;
              return fixer.replaceText(node, `${objectText}[(${argumentText} < 0) ? ${objectText}.length + (${argumentText}) : ${argumentText}]`);
            }
          });
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
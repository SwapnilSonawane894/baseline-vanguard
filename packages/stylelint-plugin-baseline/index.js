/**
 * @fileoverview Stylelint rule to detect non-Baseline CSS features and wrap them in @supports for progressive enhancement.
 * @author Your Name
 */
const stylelint = require('stylelint');
const webFeatures = require('web-features');
const selectorParser = require('postcss-selector-parser');

const ruleName = 'baseline/detect-unsupported-css-features';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (feature) => `CSS feature '${feature}' is not Baseline. Consider wrapping in @supports for progressive enhancement.`,
});

const ruleFunction = (primary, secondaryOptions, context) => {
  return (root, result) => {
    // Handle rules with unsupported pseudo-classes like :has()
    root.walkRules(rule => {
      // Ignore rules already inside a @supports block to prevent double-wrapping.
      if (rule.parent.type === 'atrule' && rule.parent.name === 'supports') {
        return;
      }
      if (!rule.selector.includes(':has(')) {
        return;
      }
      
      const selectorProcessor = selectorParser(selectors => {
        selectors.walkPseudos(pseudo => {
          if (pseudo.value === ':has') {
            const featureData = webFeatures['css.selectors.has'];
            if (featureData && featureData.status.baseline !== 'high') {
              if (context.fix) {
                const newAtRule = stylelint.atRule({ name: 'supports', params: `(selector(${pseudo.value}*))` });
                // Replace the original rule with the new @supports block,
                // and move the original rule inside it.
                rule.replaceWith(newAtRule);
                newAtRule.append(rule);
              } else {
                stylelint.utils.report({ message: messages.expected(':has() selector'), node: rule, result, ruleName });
              }
            }
          }
        });
      });
      // A try-catch block handles potentially invalid selectors gracefully.
      try {
        selectorProcessor.processSync(rule.selector);
      } catch (e) { /* Ignore selector parsing errors */ }
    });

    // Handle unsupported at-rules like @container
    root.walkAtRules('container', atRule => {
      if (atRule.parent.type === 'atrule' && atRule.parent.name === 'supports') {
        return;
        }
      
      const featureData = webFeatures['css.at-rules.container'];
      if (featureData && featureData.status.baseline !== 'high') {
        if (context.fix) {
          const newSupportsRule = stylelint.atRule({ name: 'supports', params: '(container-type: inline-size)' });
          atRule.replaceWith(newSupportsRule);
          newSupportsRule.append(atRule);
        } else {
          stylelint.utils.report({ message: messages.expected('@container queries'), node: atRule, result, ruleName });
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
module.exports = stylelint.createPlugin(ruleName, ruleFunction);
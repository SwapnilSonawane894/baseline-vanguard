const stylelint = require('stylelint');
const webFeatures = require('web-features');
const selectorParser = require('postcss-selector-parser');
const postcss = require('postcss');

const ruleName = 'baseline/detect-unsupported-css-features';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (feature) => `CSS feature '${feature}' is not Baseline. Consider wrapping in @supports for progressive enhancement.`,
});

const ruleFunction = (primary, secondaryOptions, context) => {
  return (root, result) => {
    // Handle :has() selectors
    root.walkRules(rule => {
      // Skip if already inside @supports
      if (rule.parent.type === 'atrule' && rule.parent.name === 'supports') {
        return;
      }
      
      // Quick check before parsing
      if (!rule.selector.includes(':has(')) {
        return;
      }
      
      // Check if :has() is baseline supported
      // Currently not baseline in most browsers
      const hasFeature = webFeatures.features && webFeatures.features['css.selectors.has'];
      const isBaseline = hasFeature ? hasFeature.status.baseline === 'high' : false;
      
      if (!isBaseline) {
        // Report issue for UI
        stylelint.utils.report({ 
          message: messages.expected(':has() selector'), 
          node: rule, 
          result, 
          ruleName 
        });
        
        // Apply auto-fix if enabled
        if (context.fix) {
          // Create @supports wrapper
          const supportsRule = postcss.atRule({
            name: 'supports',
            params: 'selector(:has(*))'
          });
          
          // Clone and format the rule
          const clonedRule = rule.clone();
          
          // Add indentation
          clonedRule.raws.before = '\n  ';
          clonedRule.raws.after = '\n';
          
          supportsRule.append(clonedRule);
          supportsRule.raws.after = '\n\n';
          
          // Replace original with wrapped version
          rule.replaceWith(supportsRule);
        }
      }
    });

    // Handle @container queries
    root.walkAtRules('container', atRule => {
      // Skip if already wrapped
      if (atRule.parent.type === 'atrule' && atRule.parent.name === 'supports') {
        return;
      }
      
      // Check baseline status
      const containerFeature = webFeatures.features && webFeatures.features['css.at-rules.container'];
      const isBaseline = containerFeature ? containerFeature.status.baseline === 'high' : false;
      
      if (!isBaseline) {
        // Report issue for UI
        stylelint.utils.report({ 
          message: messages.expected('@container queries'), 
          node: atRule, 
          result, 
          ruleName 
        });
        
        // Apply auto-fix if enabled
        if (context.fix) {
          // Create @supports wrapper
          const supportsRule = postcss.atRule({
            name: 'supports',
            params: '(container-type: inline-size)'
          });
          
          // Clone and format
          const clonedAtRule = atRule.clone();
          
          // Add indentation
          clonedAtRule.raws.before = '\n  ';
          clonedAtRule.raws.after = '\n';
          
          supportsRule.append(clonedAtRule);
          supportsRule.raws.after = '\n\n';
          
          // Replace with wrapped version
          atRule.replaceWith(supportsRule);
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
module.exports = stylelint.createPlugin(ruleName, ruleFunction);
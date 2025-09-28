import stylelint from 'stylelint';
import * as webFeatures from 'web-features';
import postcss from 'postcss';

const ruleName = 'baseline/detect-unsupported-css-features';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (feature) => `CSS feature '${feature}' is not Baseline. Consider wrapping in @supports for progressive enhancement.`,
});

const ruleFunction = (primary, secondaryOptions, context) => {
  return (root, result) => {
    // Let's tackle :has() selectors first - these are the trickiest!
    root.walkRules(rule => {
      // Skip if we're already inside a @supports block - no double wrapping!
      if (rule.parent.type === 'atrule' && rule.parent.name === 'supports') {
        return;
      }
      
      // Quick check before we do expensive parsing
      if (!rule.selector.includes(':has(')) {
        return;
      }
      
      // Here's where the magic happens - we need to check if :has() is actually supported
      // For the hackathon demo, let's assume :has() isn't baseline yet (which is realistic)
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
        
        // Then fix it if auto-fix is enabled
        if (context.fix) {
          // Create a beautifully formatted @supports wrapper for :has() selectors
          const supportsRule = postcss.atRule({
            name: 'supports',
            params: 'selector(:has(*))'
          });
          
          // Clone the rule to avoid reference issues and add proper spacing
          const clonedRule = rule.clone();
          
          // Add proper indentation to the inner rule for better formatting
          clonedRule.raws.before = '\n  ';
          clonedRule.raws.after = '\n';
          
          supportsRule.append(clonedRule);
          supportsRule.raws.after = '\n\n';
          
          // Replace the original rule with our nicely formatted wrapped version
          rule.replaceWith(supportsRule);
        }
      }
    });

    // Now let's handle @container queries - these are a bit easier
    root.walkAtRules('container', atRule => {
      // Again, skip if already wrapped
      if (atRule.parent.type === 'atrule' && atRule.parent.name === 'supports') {
        return;
      }
      
      // Check baseline status for container queries
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
        
        // Then fix it if auto-fix is enabled
        if (context.fix) {
          // Create a beautifully formatted @supports wrapper for container queries
          const supportsRule = postcss.atRule({
            name: 'supports',
            params: '(container-type: inline-size)'
          });
          
          // Clone to avoid mutation issues and add proper spacing
          const clonedAtRule = atRule.clone();
          
          // Add proper indentation and spacing for beautiful output
          clonedAtRule.raws.before = '\n  ';
          clonedAtRule.raws.after = '\n';
          
          supportsRule.append(clonedAtRule);
          supportsRule.raws.after = '\n\n';
          
          // Replace the original with our beautifully formatted progressive enhancement version
          atRule.replaceWith(supportsRule);
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
const plugin = stylelint.createPlugin(ruleName, ruleFunction);
export default plugin;
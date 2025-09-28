import { json } from '@sveltejs/kit';
import { Linter } from 'eslint';
import stylelint from 'stylelint';

// Simplified baseline feature detection for the playground
// This avoids web-features dependency issues in serverless environments
const BASELINE_FEATURES = {
  ':has() selector': false,  // Not yet baseline
  '@container queries': false  // Not yet baseline
};

// Create lightweight plugins without web-features dependency
const createSimplifiedESLintPlugin = () => ({
  rules: {
    'detect-unsupported-js-features': {
      meta: {
        type: 'problem',
        docs: { description: 'Detect non-baseline JS features' },
        fixable: 'code'
      },
      create: (context) => ({
        // Simple rule that detects some common non-baseline features
        CallExpression: (node) => {
          // Example: detect usage of newer JS features
          if (node.callee.name === 'at' && node.callee.type === 'Identifier') {
            context.report({
              node,
              message: 'Array.at() is not Baseline. Consider using bracket notation.',
              fix: (fixer) => {
                if (node.arguments.length === 1) {
                  const arg = context.getSourceCode().getText(node.arguments[0]);
                  return fixer.replaceText(node, `[${arg}]`);
                }
              }
            });
          }
        }
      })
    },
    'no-heavy-alternatives': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Suggest lighter alternatives' }
      },
      create: () => ({}) // Simplified for demo
    }
  }
});

const createSimplifiedStylelintPlugin = () => ({
  ruleName: 'baseline/detect-unsupported-css-features',
  rule: (primary) => (root, result) => {
    // Handle :has() selectors
    root.walkRules(rule => {
      if (rule.parent?.type === 'atrule' && rule.parent.name === 'supports') {
        return; // Skip if already wrapped
      }
      
      if (rule.selector.includes(':has(')) {
        result.warn('CSS feature \':has() selector\' is not Baseline. Consider wrapping in @supports for progressive enhancement.', {
          node: rule
        });
        
        if (result.stylelint.config.fix) {
          // Create @supports wrapper
          const postcss = require('postcss');
          const supportsRule = postcss.atRule({
            name: 'supports',
            params: 'selector(:has(*))'
          });
          
          const clonedRule = rule.clone();
          clonedRule.raws.before = '\n  ';
          clonedRule.raws.after = '\n';
          
          supportsRule.append(clonedRule);
          supportsRule.raws.after = '\n\n';
          
          rule.replaceWith(supportsRule);
        }
      }
    });

    // Handle @container queries
    root.walkAtRules('container', atRule => {
      if (atRule.parent?.type === 'atrule' && atRule.parent.name === 'supports') {
        return; // Skip if already wrapped
      }
      
      result.warn('CSS feature \'@container queries\' is not Baseline. Consider wrapping in @supports for progressive enhancement.', {
        node: atRule
      });
      
      if (result.stylelint.config.fix) {
        const postcss = require('postcss');
        const supportsRule = postcss.atRule({
          name: 'supports',
          params: '(container-type: inline-size)'
        });
        
        const clonedAtRule = atRule.clone();
        clonedAtRule.raws.before = '\n  ';
        clonedAtRule.raws.after = '\n';
        
        supportsRule.append(clonedAtRule);
        supportsRule.raws.after = '\n\n';
        
        atRule.replaceWith(supportsRule);
      }
    });
  }
});

// This is our serverless API endpoint that powers the web playground.
export async function POST({ request }) {
  try {
    const { code, language } = await request.json();

    if (language === 'javascript') {
      // Initialize the ESLint linter instance programmatically.
      const linter = new Linter();
      // Use our simplified plugin
      const eslintPlugin = createSimplifiedESLintPlugin();
      linter.defineRules(eslintPlugin.rules);

      const config = {
        parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
        rules: {
          // We enable our custom rules for the playground execution.
          'detect-unsupported-js-features': ['error', { supportLevel: 'high' }],
          'no-heavy-alternatives': 'warn',
        },
      };
       // 1. First, get all the original messages before any fixes.
      const originalMessages = linter.verify(code, config);
      
      // 2. Then, get the fixed code.
      const { output } = linter.verifyAndFix(code, config);

      // 3. Return BOTH the fixed code AND the original messages.
      return json({ fixedCode: output, messages: originalMessages });

    } else if (language === 'css') {
      // Use our simplified stylelint plugin
      const stylelintPlugin = createSimplifiedStylelintPlugin();
      
      // Stylelint's programmatic API is async.
      const result = await stylelint.lint({ 
        code,
        fix: true,
        config: {
          plugins: [stylelintPlugin],
          rules: {
            'baseline/detect-unsupported-css-features': true,
          },
        },
      });
    
      return json({ fixedCode: result.code, messages: result.results[0].warnings });
    }

    return json({ error: 'Unsupported language' }, { status: 400 });
  } catch (e) {
    console.error('API Linter Error:', e);
    return json({ error: 'An unexpected error occurred while processing the code.' }, { status: 500 });
  }
}
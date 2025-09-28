import { json } from '@sveltejs/kit';
import { Linter } from 'eslint';
import stylelint from 'stylelint';
import postcss from 'postcss';

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
          // Detect Array.at() method
          if (node.callee.type === 'MemberExpression' && 
              node.callee.property && 
              node.callee.property.name === 'at') {
            context.report({
              node,
              message: 'Array.at() is not Baseline. Consider using bracket notation for better compatibility.',
              fix: (fixer) => {
                if (node.arguments.length === 1) {
                  const sourceCode = context.getSourceCode();
                  const arrayText = sourceCode.getText(node.callee.object);
                  const argText = sourceCode.getText(node.arguments[0]);
                  return fixer.replaceText(node, `${arrayText}[${argText}]`);
                }
              }
            });
          }
          
          // Detect hasOwnProperty usage
          if (node.callee.type === 'MemberExpression' && 
              node.callee.property && 
              node.callee.property.name === 'hasOwnProperty') {
            context.report({
              node,
              message: 'hasOwnProperty() can be unreliable. Consider using Object.hasOwn() for better safety and cleaner syntax.',
              fix: (fixer) => {
                if (node.arguments.length === 1) {
                  const sourceCode = context.getSourceCode();
                  const objectText = sourceCode.getText(node.callee.object);
                  const argText = sourceCode.getText(node.arguments[0]);
                  return fixer.replaceText(node, `Object.hasOwn(${objectText}, ${argText})`);
                }
              }
            });
          }
        },
        ImportDeclaration: (node) => {
          // Detect heavy libraries
          if (node.source.value === 'moment') {
            context.report({
              node,
              message: 'moment.js is heavy (67kB). Consider using date-fns (2kB) or native Date for better performance.',
            });
          }
          if (node.source.value === 'lodash') {
            context.report({
              node,
              message: 'lodash is heavy (70kB). Consider using native ES6+ methods or lodash-es for tree-shaking.',
            });
          }
        },
        MemberExpression: (node) => {
          // Detect newer array methods that might not be baseline
          if (node.property && node.property.name === 'flat') {
            context.report({
              node,
              message: 'Array.flat() might not be Baseline in all browsers. Consider a polyfill or manual flattening.',
            });
          }
          if (node.property && node.property.name === 'flatMap') {
            context.report({
              node,
              message: 'Array.flatMap() might not be Baseline in all browsers. Consider combining map() and flat().',
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

    // Handle @starting-style for entry animations
    root.walkAtRules('starting-style', atRule => {
      if (atRule.parent?.type === 'atrule' && atRule.parent.name === 'supports') {
        return;
      }
      
      result.warn('CSS feature \'@starting-style\' is not Baseline. Consider wrapping in @supports for progressive enhancement.', {
        node: atRule
      });
      
      if (result.stylelint.config.fix) {
        const supportsRule = postcss.atRule({
          name: 'supports',
          params: 'at-rule(starting-style)'
        });
        
        const clonedAtRule = atRule.clone();
        clonedAtRule.raws.before = '\n  ';
        clonedAtRule.raws.after = '\n';
        
        supportsRule.append(clonedAtRule);
        supportsRule.raws.after = '\n\n';
        
        atRule.replaceWith(supportsRule);
      }
    });

    // Handle CSS nesting (if not in @supports)
    root.walkRules(rule => {
      if (rule.parent?.type === 'rule' && rule.parent?.parent?.type !== 'atrule') {
        result.warn('CSS Nesting might not be Baseline in all browsers. Consider using a PostCSS plugin or SCSS.', {
          node: rule
        });
      }
    });

    // Handle modern CSS functions
    root.walkDecls(decl => {
      const value = decl.value;
      
      // Check for color-mix()
      if (value.includes('color-mix(')) {
        result.warn('CSS color-mix() function is not Baseline. Consider using a fallback color or PostCSS plugin.', {
          node: decl
        });
      }
      
      // Check for view-transition-name
      if (decl.prop === 'view-transition-name') {
        result.warn('view-transition-name is not Baseline. Consider wrapping in @supports for progressive enhancement.', {
          node: decl
        });
      }
      
      // Check for container-type without @supports
      if (decl.prop === 'container-type' && 
          decl.parent?.parent?.type !== 'atrule') {
        result.warn('container-type should be wrapped in @supports for better browser compatibility.', {
          node: decl
        });
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
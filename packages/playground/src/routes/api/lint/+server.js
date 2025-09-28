import { json } from '@sveltejs/kit';
import { Linter } from 'eslint';
import stylelint from 'stylelint';

// Dynamic imports to avoid SSR issues
let eslintPlugin, stylelintPlugin;

// Initialize plugins lazily to avoid build-time issues
async function initializePlugins() {
  try {
    if (!eslintPlugin) {
      eslintPlugin = await import('@baseline-vanguard/eslint-plugin-baseline');
    }
    if (!stylelintPlugin) {
      stylelintPlugin = await import('@baseline-vanguard/stylelint-plugin-baseline');
    }
    return { eslintPlugin, stylelintPlugin };
  } catch (error) {
    console.error('Failed to initialize plugins:', error);
    throw new Error(`Plugin initialization failed: ${error.message}`);
  }
}

// This is our serverless API endpoint that powers the web playground.
export async function POST({ request }) {
  try {
    const { code, language } = await request.json();

    // Initialize plugins dynamically to avoid SSR issues
    const { eslintPlugin, stylelintPlugin } = await initializePlugins();

    if (language === 'javascript') {
      // Initialize the ESLint linter instance programmatically.
      const linter = new Linter();
      // We have to define the rules from our plugin so the linter knows about them.
      linter.defineRules(eslintPlugin.default.rules);

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
      // Stylelint's programmatic API is async.
      const result = await stylelint.lint({ 
        code,
        fix: true,
        config: {
          plugins: [stylelintPlugin.default],
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
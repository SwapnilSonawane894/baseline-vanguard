import { json } from '@sveltejs/kit';
import { Linter } from 'eslint';
import stylelint from 'stylelint';
import eslintPlugin from '@baseline-vanguard/eslint-plugin-baseline';
import stylelintPlugin from '@baseline-vanguard/stylelint-plugin-baseline';

// Initialize the ESLint linter instance programmatically.
const linter = new Linter();
// We have to define the rules from our plugin so the linter knows about them.
linter.defineRules(eslintPlugin.rules);

// This is our serverless API endpoint that powers the web playground.
export async function POST({ request }) {
  try {
    const { code, language } = await request.json();

    if (language === 'javascript') {
      const config = {
        parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
        rules: {
          // We enable our custom rules for the playground execution.
          '@baseline-vanguard/baseline/detect-unsupported-js-features': ['error', { supportLevel: 'high' }],
          '@baseline-vanguard/baseline/no-heavy-alternatives': 'warn',
        },
      };
      
      // verifyAndFix runs the linter and applies any safe fixes it finds.
      const { output, messages } = linter.verifyAndFix(code, config);
      return json({ fixedCode: output, messages });

    } else if (language === 'css') {
      // Stylelint's programmatic API is async.
      const { output, results } = await stylelint.lint({
        code,
        fix: true, // Tell Stylelint to apply fixes.
        config: {
          plugins: [stylelintPlugin],
          rules: {
            'baseline/detect-unsupported-css-features': true,
          },
        },
      });
    
      return json({ fixedCode: output, messages: results[0].warnings });
    }

    return json({ error: 'Unsupported language' }, { status: 400 });
  } catch (e) {
    console.error('API Linter Error:', e);
    return json({ error: 'An unexpected error occurred while processing the code.' }, { status: 500 });
  }
}
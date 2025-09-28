import { RuleTester } from 'eslint';
import rule from './detect-unsupported-js-features';
import { describe, it } from 'vitest';

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('detect-unsupported-js-features', () => {
  it('should correctly fix Array.prototype.at()', () => {
    ruleTester.run('detect-unsupported-js-features', rule, {
      valid: [],
      invalid: [
        {
          code: "const last = items.at(-1);",
          output: "const last = items[(-1 < 0) ? items.length + (-1) : -1];",
          errors: [{ message: /does not meet the configured Baseline support level/ }],
        },
      ],
    });
  });

  it('should correctly fix hasOwnProperty', () => {
    ruleTester.run('detect-unsupported-js-features', rule, {
      valid: ["Object.hasOwn(obj, 'key');"],
      invalid: [
        {
          code: "if (obj.hasOwnProperty('key')) {}",
          output: "if (Object.hasOwn(obj, 'key')) {}",
          errors: [{ message: /can be unsafe/ }],
        },
        {
          code: "user.hasOwnProperty('name')",
          output: "Object.hasOwn(user, 'name')",
          errors: [{ message: /can be unsafe/ }],
        },
      ],
    });
  });

  it('should respect supportLevel configuration', () => {
    ruleTester.run('detect-unsupported-js-features', rule, {
      valid: [],
      invalid: [
        {
          code: "const last = items.at(-1);",
          output: "const last = items[(-1 < 0) ? items.length + (-1) : -1];",
          options: [{ supportLevel: 'low' }],
          errors: [{ message: /does not meet the configured Baseline support level/ }],
        },
      ],
    });
  });

  it('should use default supportLevel when no options provided', () => {
    ruleTester.run('detect-unsupported-js-features', rule, {
      valid: [],
      invalid: [
        {
          code: "const last = items.at(-1);",
          output: "const last = items[(-1 < 0) ? items.length + (-1) : -1];",
          errors: [{ message: /does not meet the configured Baseline support level/ }],
        },
      ],
    });
  });
});
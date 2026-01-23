---
applyTo: 'app/frontend/**'
---

# Linting Rule

Before marking any task as complete, **always run** `yarn lint:fix` to ensure code quality and consistency.

## When to Run

- After making any code changes (TypeScript, JavaScript, React components, etc.)
- Before completing a task
- Before creating a commit or pull request

## Command

```bash
yarn lint:fix
```

This command will:
- Automatically fix linting issues that can be auto-corrected
- Report any remaining issues that need manual fixes

## If Linting Fails

If `yarn lint:fix` reports errors that cannot be auto-fixed:
1. Review the linting errors
2. Fix them manually according to the error messages
3. Run `yarn lint:fix` again to verify all issues are resolved
4. Only mark the task as complete after all linting issues are resolved

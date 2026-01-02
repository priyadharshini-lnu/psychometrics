# Code Quality & Linting

### ESLint Configuration

Our ESLint setup extends:
- **Airbnb** style guide
- **TypeScript** specific rules
- **React** best practices
- **Testing Library** rules for tests

**Configuration:** [.eslintrc](../../.eslintrc)

### Key Rules

```javascript
// Key enforced rules:
"semi": [2, "never"]                    // No semicolons
"max-len": [2, 120, 2]                  // Max line length
"space-before-function-paren": "always" // function () {}
"@typescript-eslint/explicit-function-return-type": 1
```

### Code Formatting

```typescript
// ✅ Use arrow functions for inline functions
const items = data.map(item => item.name)

// ✅ Space before function parentheses
function processData () { ... }
const handler = () => { ... }

// ✅ No semicolons (per ESLint config)
const data = fetchData()
export default Component

// ✅ Max line length 120 characters
const veryLongVariableName = someVeryLongFunctionName(
  parameter1,
  parameter2,
  parameter3
)
```

# Testing

### Vitest Configuration

We use **Vitest** for testing with:
- **jsdom** environment for React testing
- **@testing-library/react** for component testing
- **Coverage reports** with v8 provider

**Configuration:** [vitest.config.ts](../../vitest.config.ts)

### Test Structure

**Real Example:** [app/frontend/__tests__/components/InputDuration/InputDuration.test.tsx](../../app/frontend/__tests__/components/InputDuration/InputDuration.test.tsx)

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Component from './Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('should handle user interactions', () => {
    const mockHandler = vi.fn()
    render(<Component onAction={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### Testing Guidelines

- **Unit Tests**: Test components in isolation
- **Integration Tests**: Test component interactions
- **Coverage**: Aim for high coverage on critical paths
- **Mocking**: Mock external dependencies and API calls

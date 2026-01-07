---
applyTo: 'app/frontend/**'
---

# Frontend Coding Guidelines

This document contains the comprehensive frontend development guidelines for the psychometrics application. Follow these guidelines to ensure consistency, maintainability, and optimal performance.

## Project Structure

### Module Organization

Our frontend is organized into two main modules:

**app/frontend/**
- **modules/**
  - **admin/** - Admin App
    - Standard Module Layout: `modules/{feature}`
      - `core/` - Business logic & Resource definitions
      - `routes/` - React Components & Routes
      - `settings.ts` - Module settings
  - **endUser/** - Enduser app
    - Standard Module Layout: `modules/{feature}`
      - `core/` - Business logic & State
      - `routes/` - Routes & Pages
      - `components/` - Module-specific components
      - `App.tsx` - Entry component
- **components/** - Shared components
- **hooks/** - Custom React hooks
- **utils/** - Utility functions
- **styles/** - Global styles and utilities
- **interfaces/** - TypeScript interfaces
- **middleware/** - Redux middleware
- **core/** - Core application logic
- **assets/** - Static assets

### Key Principles

- **Module Separation**: Keep admin and endUser modules completely separate
- **Shared Components**: Place reusable components in the global components/ directory
- **Feature-Based Organization**: Within modules, organize by feature

### File Naming Conventions

**Components:**
```
ComponentName.tsx          # Main component file
ComponentName.less         # Component styles
ComponentName.test.tsx     # Component tests
index.ts                   # Barrel export (if needed)
```

**Utilities and Hooks:**
```
hooks/
├── useCustomHook.ts      # Custom hook
├── useApiData.ts         # API-related hook

utils/
├── stringUtils.ts        # Utility functions
├── dateHelpers.ts        # Date utilities
```

## Build System & Performance

### Vite Configuration

We use **Vite** for development compilation and **Rails** (via vite_ruby) to serve compiled assets in production.

- **Development**: `esbuild` for fast compilation
- **Production**: `rollup` for optimized bundles, served by Rails asset pipeline
- **Plugin**: `vite-plugin-ruby` bridges Vite and Rails

### CSS Module Loading Strategy

All `.less` files are treated as CSS Modules **by default**, except for explicitly excluded global files.

**Global Style Files (Excluded from CSS Modules):**
- `*/ant.less` - Ant Design theme files
- `*/styles/global.less` - Global styles
- `styles/common.less` - Common styles
- `styles/utils.less` - Utility classes
- `*/admin/style.less` - Admin global styles

**CSS Module Files (Scoped):**
All other `.less` files are automatically treated as CSS Modules with:
- **Scoped class names**: Prevents global namespace pollution
- **Development naming**: `[name]__[local]___[hash:base64:5]`
- **Production naming**: `[hash:base64:5]` (optimized)
- **Camel case locals**: `class-name` becomes `className` in JavaScript

**Example:**
```typescript
import styles from './Component.less' // Automatically scoped

const Component = () => (
  <div className={styles.container}> // Becomes: Component__container___a1b2c
    <h1 className={styles.title}>Title</h1>
  </div>
)
```

### Key Build Principles

**SVG as React Components:**
```typescript
import StartIcon from './assets/Start_Recording.svg?react'

const Component = () => <StartIcon width={24} height={24} />
```

**Chunk Splitting:**
- Intelligent vendor chunking separates third-party libraries from application code
- Large libraries like `@tensorflow/tfjs-core`, `video.js`, `powerbi-client` are excluded from main vendor chunk

**Lazy Loading (Code Splitting):**
Use React lazy loading **at the module level** for major features:
```typescript
import { lazy } from 'react'

const Client = lazy(() => import('./Client'))
const ClientList = lazy(() => import('./ClientList'))
```

### Performance Guidelines

**Bundle Optimization:**
```typescript
// ✅ Import specific modules from lodash
import has from 'lodash/has'
import get from 'lodash/get'

// ❌ Import entire lodash
import _ from 'lodash'
```

**Component Optimization:**
```typescript
// ✅ Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // expensive rendering logic
})

// ✅ Use useMemo for expensive calculations
const expensiveValue = useMemo(() => complexCalculation(data), [data])

// ✅ Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependency])
```

## TypeScript Guidelines

### Configuration

- **Target**: ESNext with modern JavaScript features
- **JSX**: `react-jsx` transform
- **Strict Mode**: Enabled for null checks and implicit returns
- **Path Mapping**: `~/*` maps to `app/frontend/*`

### Types vs Interfaces

```typescript
// ✅ Use interfaces for external contracts and API responses
interface Assessment {
  id: string
  name: string
  disabled: boolean
}

// ✅ Use types for component props and internal state
type ComponentProps = {
  assessment: Assessment
  onSave: (data: Assessment) => void
}
```

### Runtime Type Validation with io-ts

Use `io-ts` for runtime type validation of API responses:

```typescript
import * as t from 'io-ts'

// Define io-ts runtime type
export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
        email: t.string,
      }),
      t.undefined
    ]),
  }),
])

// Extract TypeScript type from io-ts definition
export type Client = t.TypeOf<typeof ClientTR>
```

**Important:** Register the Schema in the central schema file (`libs/jsonApi/schema.ts`):
```typescript
import { Schema as clientSchema } from '~/modules/admin/modules/client/core/clients'

export const Schema = {
  clients: clientSchema,
  // ... other resources
}
```

### Best Practices

- **Interfaces Directory**: Place complex reusable interfaces in `app/frontend/interfaces/`
- **io-ts for API**: Always use `io-ts` for API response validation in Admin module
- **Type vs Interface**:
  - Use `interface` for extensible types
  - Use `type` for unions, intersections, and computed types
- **Export Types**: Always export types that are used across files
- **Path Mapping**: Use `~/` prefix for imports

## State Management & Data Fetching

### Module-Specific State Management

#### Admin Module: useResource with JSON:API

```typescript
import { useResources } from '@thetalententerprise/jsonapi-react'

const ClientList: React.FC = () => {
  const {
    data, meta, fetch, isLoading, createResource, updateResource
  } = useResources<Client>(
    'clients',
    {
      trackUrl: true,
      responseType: ClientTR,
      apiConfig: {
        include: ['project_manager'],
        fields: { users: ['name', 'email'] },
      },
    },
  )

  useEffect(() => {
    fetch()
  }, [])

  return <div>{/* component content */}</div>
}
```

#### EndUser Module: RTK Query & RTK Slices

```typescript
import { createSlice } from '@reduxjs/toolkit'
import { idpApi } from './api'

const idp = createSlice({
  name: 'idp',
  initialState: defaultState,
  reducers: {
    // Define synchronous reducers
  },
  extraReducers: (builder) => {
    // Handle RTK Query responses
    builder.addMatcher(
      idpApi.endpoints.updateReflectionQuestions.matchFulfilled,
      (state, action) => {
        // ✅ Direct mutation is OK - Immer handles immutability
        state.reflectionQuestions = action.payload.data
      },
    )
  },
})

export default idp.reducer
```

**Key principles for RTK slices:**
- ✅ **Use mutable syntax** - Immer handles immutability
- ✅ **extraReducers** - Handle async actions from RTK Query
- ✅ **Export selectors** - Colocate selectors with the slice

#### Legacy Redux (Deprecated)

```javascript
// ❌ Deprecated pattern - being phased out
const HANDLERS = {
  [ACTION_NAME]: (state, action) => { /* ... */ }
}
```

For existing legacy code, use immutable utilities from `app/frontend/utils/immutable.ts`:
```typescript
import { setIn, updateIn, getIn, merge } from '~/utils/immutable'

// ✅ Use setIn for setting nested values
return setIn(state, ['nested', 'deeply', 'value'], newValue)
```

## React Components

### Component Types

**Always use functional components with hooks:**

```typescript
// ✅ Functional component
const UserListComponent: React.FC<Props> = ({ currentUser, userTab }) => {
  const [drawerUser, setDrawerUser] = useState<User | undefined>()

  return (
    <>
      <Breadcrumb crumbs={crumbs} />
      <Tabs />
    </>
  )
}

// ❌ Class components (legacy) - being replaced
class Assessment extends React.Component { ... }
```

### Component Size Guidelines

- **Maximum 500 lines** per component file
- Break down larger components into smaller, focused pieces
- Extract custom logic into hooks

### Naming Conventions

```typescript
// ✅ Component names: PascalCase
const UserProfile = () => { ... }

// ✅ List components: ResourceList format
const AssessmentList = () => { ... }
const UserList = () => { ... }

// ✅ Hook names: use prefix
const useAssessmentData = () => { ... }
const useCurrentUser = () => { ... }
```

### State Management in Components

**EndUser Module (RTK):**
```typescript
// ✅ Use local state for UI-only concerns
import { useState } from 'react'

const [isLoading, setIsLoading] = useState(true)
const [messages, setMessages] = useState<Message[]>([])

// ✅ Use RTK selectors for global state
import { useSelector, useDispatch } from 'react-redux'

const dispatch = useDispatch()
const currentUser = useSelector((state: RootState) => state.currentUser)

// ✅ Prefer component state for:
// - Form inputs and validation
// - Modal visibility
// - Temporary UI state
// - Loading states (unless shared across components)
```

**Admin Module (useResource for v2 API):**
For new development on admin side, use `useResource` hook.

### Conditional Rendering

```typescript
// ✅ Use classnames utility for conditional classes
import cs from 'classnames'

const className = cs('base-class', {
  'active-class': isActive,
  'error-class': hasError,
  'disabled': !enabled,
})

// ✅ Always alias classnames as 'cs'
```

### Arrow Functions

Use arrow functions for:
- Functions defined inside other functions
- Callback functions (event handlers, array methods)
- Anonymous functions passed as props

```typescript
// ✅ Arrow functions for callbacks and event handlers
const handleClick = () => {
  dispatch(someAction())
}

// ✅ Arrow functions for array methods
const filteredItems = items.filter(item => item.active)

// ✅ Regular functions for top-level component exports
export function ComponentName() { ... }
```

### Module Imports

```typescript
// ✅ Import individual modules from lodash
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

// ❌ Avoid importing the entire library
import _ from 'lodash'

// ✅ Prefer native methods when available
const doubled = array.map(x => x * 2)
const filtered = array.filter(x => x > 0)

// ✅ Use lodash only when native methods are insufficient
const sorted = sortBy(users, ['age', 'name'])
```

**Circular dependencies:**
To avoid circular dependencies, import component dependencies directly from their source files instead of from index files.

## Styling Guidelines

### CSS Modules Strategy

**All component styles use CSS Modules** with `.less` files:

```typescript
// Component.tsx
import styles from './Component.less'

export const Component = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Title</h1>
  </div>
)
```

### Utility Classes

Use extensive utility class system from `app/frontend/styles/utils.less`:

```typescript
// ✅ Use utility classes for common styling
<div className="flex items-center justify-between p-4 mb-2">
  <span className="fs-16 font-bold">Title</span>
  <Button className="ms-auto" />
</div>
```

**Core utility files:**
- `styles/utils.less` - Utility classes
- `styles/variables.less` - LESS variables
- `styles/spacing.less` - Spacing scale
- `styles/antv4.variable.less` - Ant Design v4 theme variables

### Available Utilities

**Spacing** (using rem units):
```less
// Margin: ms-2, me-4, mt-1, mb-3, m-6
// Padding: ps-2, pe-4, pt-1, pb-3, p-6
// Values: 0, 1(0.25rem), 2(0.5rem), 3(0.75rem), 4(1rem), ..., 96(24rem)
```

**Layout:**
```less
.flex, .flex-column
.items-center, .items-start, .items-end
.justify-center, .justify-between, .justify-around
.w-100, .h-100, .w-auto, .h-auto
```

**Typography:**
```less
.fs-12, .fs-14, .fs-16, .fs-20, .fs-24, .fs-32
.font-normal, .font-bold, .font-semi-bold
.ta-c, .ta-s, .ta-e (text-align: center, start, end)
```

### Styling Rules

```less
// ✅ Use rem units for spacing and fonts
padding: @space-4;  // 1rem
font-size: 1.5rem;

// ❌ Avoid px units
padding: 16px;

// ✅ Nest styles for better organization
.container {
  padding: @space-4;

  .header {
    margin-bottom: @space-2;
  }

  // ✅ Use :global for third-party overrides
  :global {
    .ant-modal-body {
      padding: 0;
    }
  }
}

// ❌ Avoid !important (except for utilities)
```

### Inline Styles

```typescript
// ✅ Maximum 3 properties for inline styles
<div style={{ padding: 20 }}>
  <LangDropdownWithChangeUrl />
</div>

// ❌ Avoid complex inline styles - use CSS Modules instead
```

### Icons

```typescript
// ✅ Prefer Ant Design icons, keeping accessibility in mind
// Do not directly import from @ant-design/icons
// Instead import from glint/icons/AccessibleIconsAntDesign
// If icon doesn't exist, re-export with withAccessibilityProps
import { DownloadOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const Component = () => (
  <Button>
    <Space>
      {I18n.t('common.actions.download')}
      <DownOutlined />
    </Space>
  </Button>
)

// ✅ Custom SVG icons as React components (with ?react suffix)
import { RocketLaunchIcon } from '~/glint/icons'
import CustomIcon from './icons/custom-icon.svg?react'

const IconComponent = () => (
  <div>
    <RocketLaunchIcon height="3em" width="3em" />
    <CustomIcon />
  </div>
)
```

## API Integration

### Admin Module: JSON:API with useResource

The admin module follows JSON:API specifications using `useResource` hooks.

**Resource Definition:**
```typescript
import * as t from 'io-ts'

// Define io-ts types
export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
  }),
])

export type Client = t.TypeOf<typeof ClientTR>

// JSON:API Schema for serialization/deserialization
export const Schema = {
  type: 'clients',
  relationships: {
    projectManager: {
      type: 'users',
    },
  },
}
```

**useResource Hook Usage:**
```typescript
const {
  data,                    // Array of resources
  meta,                    // Metadata (pagination, etc.)
  fetch,                   // Fetch resources
  createResource,          // Create new resource
  updateResource,          // Update existing resource
  removeResource,          // Delete resource
  isLoading,              // Loading state checker
  changeFilter,           // Apply filters
  changePage,             // Pagination
  handleTableChange,      // Ant Design table integration
  memberAction,           // Custom member actions
  collectionAction,       // Custom collection actions
} = useResources<Client>(
  'clients',
  {
    trackUrl: true,
    responseType: ClientTR,
    apiConfig: {
      include: ['project_manager'],
      fields: { users: ['name', 'email'] },
      page: { size: 25 },
      filter: { name_cont: 'search_term' },
      sort: '-created_at',
    },
  },
)
```

**Form Integration with ResourceFormModal:**
```typescript
<ResourceFormModal
  resourceName="clients"
  resource={client}
  readableResourceName="Client"
  showSuccessMessages
  close={close}
  scrollToFirstError
  modalProps={{ width: 620 }}
  request={{
    createResource: createResource,
    updateResource: updateResource,
  }}
>
  {() => (
    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  )}
</ResourceFormModal>
```

### EndUser Module: RTK Query

```typescript
// Define RTK Query API
export const assessmentApi = createApi({
  reducerPath: 'assessmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v2/end_user/',
  }),
  tagTypes: ['Assessment'],
  endpoints: (builder) => ({
    getAssessments: builder.query<Assessment[], void>({
      query: () => 'assessments',
      providesTags: ['Assessment'],
    }),
    createAssessment: builder.mutation<Assessment, Partial<Assessment>>({
      query: (newAssessment) => ({
        url: 'assessments',
        method: 'POST',
        body: newAssessment,
      }),
      invalidatesTags: ['Assessment'],
    }),
  }),
})

// Generated hooks
export const {
  useGetAssessmentsQuery,
  useCreateAssessmentMutation,
} = assessmentApi
```

## Testing

### Vitest Configuration

We use **Vitest** for testing with:
- **jsdom** environment for React testing
- **@testing-library/react** for component testing
- **Coverage reports** with v8 provider

### Test Structure

```typescript
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

## Code Quality & Linting

### ESLint Configuration

Our ESLint setup extends:
- **Airbnb** style guide
- **TypeScript** specific rules
- **React** best practices
- **Testing Library** rules for tests

### Key Rules

```javascript
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

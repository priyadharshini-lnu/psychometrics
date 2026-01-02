# React Components

### Component Types

**Always use functional components with hooks**

Example: [modules/admin/modules/Users/routes/UserList/UserList.tsx](../../app/frontend/modules/admin/modules/Users/routes/UserList/UserList.tsx)

```typescript
// ✅ Functional component
const UserListComponent: React.FC<Props> = ({ currentUser, userTab }) => {
  const [drawerUser, setDrawerUser] = useState<User | undefined>()
  const [closed, closeModal] = useState(true)

  return (
    <>
      <Breadcrumb crumbs={crumbs} />
      <Tabs />
      <Resource config={config} name="users">
        {/* component content */}
      </Resource>
    </>
  )
}

// ❌ Class components (legacy) - being replaced
class Assessment extends React.Component { ... }
```

### Component Size Guidelines

Example of well-sized component: [modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx) (~68 lines)

- **Maximum 500 lines** per component file
- Break down larger components into smaller, focused pieces
- Extract custom logic into hooks (see custom hooks in [app/frontend/hooks/](../../app/frontend/hooks/))

### Naming Conventions

```typescript
// ✅ Component names: PascalCase
const UserProfile = () => { ... }

// ✅ List components: ResourceList format
// Real examples:
// - modules/admin/modules/Assessments/routes/AssessmentList
// - modules/admin/modules/Users/routes/UserList
const AssessmentList = () => { ... }
const UserList = () => { ... }  // See: UserList.tsx

// ✅ Hook names: use prefix
const useAssessmentData = () => { ... }
const useCurrentUser = () => { ... }
```

### State Management in Components

Our state management strategy varies by module:

#### EndUser Module (✅ Current - RTK)

Example: [modules/endUser/modules/campaigns/routes/idp/AIAssistant/AIChat/AIChat.tsx](../../app/frontend/modules/endUser/modules/campaigns/routes/idp/AIAssistant/AIChat/AIChat.tsx)

```typescript
// ✅ Use local state for UI-only concerns
import { useState } from 'react'

const [isLoading, setIsLoading] = useState(true)
const [messages, setMessages] = useState<Message[]>([])
const [userPrompt, setUserPrompt] = useState('')

// ✅ Use RTK selectors for global state
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'

const dispatch = useDispatch()
const currentUser = useSelector((state: RootState) => state.currentUser)
const introMessage = useSelector((state: RootState) => state.campaigns.idp.introMessage)

// ✅ Dispatch actions to update global state
dispatch(setUserIdpPlanStatus(USER_IDP_PLAN_STATUS.DRAFT))

// ✅ Dispatch async requests (legacy pattern)
dispatch({
  type: 'FETCH/AI_CHAT_MESSAGES',
  request: {
    method: 'get',
    url: '/ai_assisted_idp_chats',
  },
}) as unknown as Promise<{ response: AIAssistedIDPSession }>

// ✅ Prefer component state for:
// - Form inputs and validation
// - Modal visibility
// - Temporary UI state
// - Loading states (unless shared across components)
```

#### Admin Module (✅ Current - useResource for v2 API)

For new development on admin side, use `useResource` hook (see [State Management & Data Fetching](./04-state-management.md) section).

#### Admin Module (❌ Deprecated - v1 API with Redux)

Example: [modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx)

**⚠️ WARNING:** This pattern is being phased out in favor of v2 API with `useResource`. Use only for existing v1 API endpoints that haven't been migrated yet.

```typescript
// ⚠️ Legacy pattern - for v1 API only
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'

const dispatch = useDispatch()
const isSuperAdmin = useSelector<RootState>(state => state.currentUser.role === 'Users::SuperAdmin')

// Dispatch actions
dispatch(downloadIdpReport(campaignId, id, includeReflection, lang))
```

**Migration path**: New features and refactors should use v2 API with `useResource` hook instead of v1 API with Redux.

### Conditional Rendering

Example: [modules/admin/components/Options/Expandable.tsx](../../app/frontend/modules/admin/components/Options/Expandable.tsx)

```typescript
// ✅ Use classnames utility for conditional classes
import cs from 'classnames'

const className = cs('base-class', {
  'active-class': isActive,
  'error-class': hasError,
  'disabled': !enabled,
})

// ✅ Always alias classnames as 'cs'
import cs from 'classnames'
```

### Arrow Functions

Example: [modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx)

Use arrow functions for:
- Functions defined inside other functions
- Callback functions (event handlers, array methods)
- Anonymous functions passed as props

```typescript
// ✅ Arrow functions for callbacks and event handlers
const handleClick = () => {
  dispatch(someAction())
}

const menu = {
  items: [...],
  onClick: ({ key }) => {  // Arrow function for callback
    dispatch(downloadIdpReport(campaignId, id, key === 'with_rq', lang))
  },
}

// ✅ Arrow functions for array methods
const filteredItems = items.filter(item => item.active)
const mappedData = users.map(user => user.name)

// ✅ Regular functions for top-level component exports
export function ComponentName() { ... }
export function utilityFunction() { ... }
```

### Module Imports

For libraries that support individual module imports, always import specific functions to reduce bundle size.

Example: [modules/reports/components/DataSourceMenu/types/SavilleFactor.tsx](../../app/frontend/modules/reports/components/DataSourceMenu/types/SavilleFactor.tsx)

```typescript
// ✅ Import individual modules from lodash
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'

// ❌ Avoid importing the entire library
import _ from 'lodash'
import { has, get, map } from 'lodash'

// ✅ Prefer native methods when available
const doubled = array.map(x => x * 2)  // Native Array.map
const filtered = array.filter(x => x > 0)  // Native Array.filter
const found = array.find(x => x.id === id)  // Native Array.find

// ✅ Use lodash only when native methods are insufficient
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'

const sorted = sortBy(users, ['age', 'name'])  // Complex sorting
const grouped = groupBy(users, 'department')  // Grouping by property
```

**Why individual imports?**
- Reduces bundle size (only includes what you use)
- Faster build times
- Better tree-shaking


**Circular dependencies**

To avoid circular dependencies, import component dependencies directly from their source files instead of from index files.

# State Management & Data Fetching

### Module-Specific State Management

Our application uses different state management approaches for different modules:

#### Admin Module: useResource with JSON:API
The admin module uses `useResource` hooks for CRUD operations following JSON:API specifications:

```typescript
// ✅ Admin module pattern with useResource
import { useResources } from '@thetalententerprise/jsonapi-react'
import * as t from 'io-ts'

// Define io-ts types and schema
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

// JSON:API Schema
export const Schema = {
  type: 'clients',
  relationships: {
    projectManager: {
      type: 'users',
    },
  },
}

// Component using useResource
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

The endUser module uses RTK Query for data fetching and RTK slices for local state management.

**Real Example:** [modules/endUser/modules/campaigns/core/idp/idpPlanRtk.ts](../../app/frontend/modules/endUser/modules/campaigns/core/idp/idpPlanRtk.ts)

```typescript
// ✅ EndUser module pattern with RTK createSlice
import { createSlice } from '@reduxjs/toolkit'
import { idpApi } from './api'

interface UserIdpPlan {
  reflectionQuestions: ReflectionQuestion[]
}

const defaultState: UserIdpPlan = {
  reflectionQuestions: [],
}

const idp = createSlice({
  name: 'idp',
  initialState: defaultState,
  reducers: {
    // Define synchronous reducers here if needed
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

export const { actions } = idp
export default idp.reducer

// Selector
export const getReflectiveQuestions = (state) => 
  state.campaigns.idpRtk.reflectionQuestions
```

**Key principles for RTK slices:**
- ✅ **Use mutable syntax** - Immer handles immutability under the hood
- ✅ **extraReducers** - Handle async actions from RTK Query
- ✅ **Export selectors** - Colocate selectors with the slice

#### Legacy Redux (Deprecated)
```javascript
// ❌ Deprecated pattern - being phased out
const HANDLERS = {
  [ACTION_NAME]: (state, action) => { /* ... */ }
}

export default function reducer(state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
```

### Data Fetching Patterns by Module

#### Admin Module: useResource Hooks
```typescript
// ✅ Admin module - useResource pattern
const ClientManagement = () => {
  const {
    data,
    meta,
    fetch,
    createResource,
    updateResource,
    removeResource,
    isLoading,
    changeFilter,
    changePage,
    handleTableChange,
  } = useResources<Client>(
    'clients',
    {
      trackUrl: true,
      responseType: ClientTR,
      apiConfig: {
        include: ['project_manager'],
        page: { size: 25 },
      },
    },
  )

  // CRUD operations
  const handleCreate = async (attributes) => {
    await createResource(attributes)
  }

  const handleUpdate = async (id, attributes) => {
    await updateResource(id, attributes)
  }

  return <div>{/* component content */}</div>
}
```

#### EndUser Module: RTK Query Hooks
```typescript
// ✅ EndUser module - RTK Query pattern
const AssessmentList = () => {
  const {
    data: assessments,
    error,
    isLoading,
    refetch,
    useGetAssessmentsQuery,
  } = useGetAssessmentsQuery()

  const [createAssessment, { isLoading: isCreating }] = useCreateAssessmentMutation()

  const handleCreate = async (assessment) => {
    await createAssessment(assessment).unwrap()
  }

  return <div>{/* component content */}</div>
}
```

#### Legacy Redux (Deprecated)
```typescript
// ❌ Deprecated approach - being replaced
export default connect(
  state => ({ assessments: state.assessments.list }),
  { addAssessment }
)(MyComponent)
```

### Legacy Redux Patterns (Deprecated)

For existing code that hasn't been migrated to RTK, use our immutable utilities from [app/frontend/utils/immutable.ts](../../app/frontend/utils/immutable.ts):

```typescript
import { setIn, updateIn, getIn, merge } from '~/utils/immutable'

// ❌ Don't use complex spread operators for nested updates
return {
  ...state,
  nested: {
    ...state.nested,
    deeply: {
      ...state.nested.deeply,
      value: newValue
    }
  }
}

// ✅ Use setIn for setting nested values
return setIn(state, ['nested', 'deeply', 'value'], newValue)

// ✅ Use updateIn for updating based on current value
return updateIn(state, ['counter'], (current) => current + 1)

// ✅ Use getIn for safe nested access
const value = getIn(state, ['nested', 'deeply', 'value'])

// ✅ Use merge for shallow merging
return merge(state, { newProp: 'value' })
```

### Migration Strategy

#### Phase 1: Replace `connect` with hooks
```typescript
// Before
export default connect(mapState, mapDispatch)(Component)

// After
const Component = () => {
  const data = useSelector(selectData)
  const dispatch = useDispatch()
  // ...
}
```

#### Phase 2: Convert to RTK slices
```typescript
// Before: Traditional Redux
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ITEM:
      return { ...state, items: [...state.items, action.payload] }
  }
}

// After: RTK slice
const slice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload)
    }
  }
})
```

#### Phase 3: Modernize component patterns
- Convert class components to functional components
- Extract custom hooks from component logic
- Implement proper TypeScript types

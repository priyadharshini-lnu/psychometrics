# API Integration

### API Integration by Module

#### Admin Module: JSON:API with useResource
The admin module follows JSON:API specifications using `useResource` hooks:

> **Note:** For in-depth understanding of JSON:API implementation, please refer to:
> - [JSON:API Frontend High-Level Documentation](JSON:API-frontend-high-level.md)
> - [JSON:API Frontend Low-Level Documentation](JSON:API-frontend-low-level.md)


**Resource Definition:**
[app/frontend/modules/admin/modules/client/core/clients.ts](../../app/frontend/modules/admin/modules/client/core/clients.ts)

```typescript
// app/frontend/modules/admin/modules/client/core/clients.ts
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
// Component using useResource
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
  'clients',               // Resource name
  {
    trackUrl: true,        // Track filters in URL
    responseType: ClientTR, // Runtime validation
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

#### EndUser Module: RTK Query

The endUser module uses RTK Query for data fetching:

**Real Example:** [modules/endUser/modules/campaigns/core/idp/idpPlanRtk.ts](../../app/frontend/modules/endUser/modules/campaigns/core/idp/idpPlanRtk.ts)

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

#### Legacy API Actions (Deprecated)

```typescript
// ❌ Legacy pattern - being phased out
export const FETCH_ASSESSMENTS = 'assessments/FETCH_ASSESSMENTS'

export const fetchAssessments = (): ApiAction<Assessment[]> => ({
  type: FETCH_ASSESSMENTS,
  request: {
    url: '/api/v2/administration/assessments',
    typedResponse: t.array(AssessmentTR),
  },
})
```

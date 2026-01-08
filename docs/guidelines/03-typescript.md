# TypeScript Guidelines

### Configuration

Our TypeScript setup includes:
- **Target**: ESNext with modern JavaScript features
- **JSX**: `react-jsx` transform
- **Strict Mode**: Enabled for null checks and implicit returns
- **Path Mapping**: `~/*` maps to `app/frontend/*`

**Configuration file:** [tsconfig.json](../../tsconfig.json)

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

// ✅ Keep reusable interfaces in separate files
// interfaces/Assessment.ts
export interface AssessmentTR { ... }
```

### Runtime Type Validation with io-ts

We use `io-ts` for runtime type validation of API responses. This ensures type safety at runtime, not just compile time.

**Real Example:** [modules/admin/modules/client/core/clients.ts](../../app/frontend/modules/admin/modules/client/core/clients.ts)

```typescript
import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

// Define io-ts runtime type
export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
        email: t.string,
      }),
      t.undefined
    ]),
    meta: t.type({
      permissions: t.type({
        viewLicenses: t.boolean,
        canManageProject: t.boolean,
      }),
    }),
  }),
])

// Extract TypeScript type from io-ts definition
export type Client = t.TypeOf<typeof ClientTR>
```

**Usage with useResource:**
```typescript
const {
  data, fetch, createResource, updateResource
} = useResources<Client>(
  'clients',
  {
    responseType: ClientTR,  // Runtime validation
  },
)
```

**Important:** To enable runtime validation, you must register the `Schema` in the central schema file:

[libs/jsonApi/schema.ts](../../app/frontend/libs/jsonApi/schema.ts):
```typescript
// 1. Import your Schema
import { Schema as clientSchema } from '~/modules/admin/modules/client/core/clients'

// 2. Register it in the central Schema object
export const Schema = {
  clients: clientSchema,  // Maps resource type 'clients' to clientSchema
  // ... other resources
}
```

This central Schema is used by the API client for JSON:API serialization/deserialization.

### Best Practices

- **Interfaces Directory**: Place complex reusable interfaces in [app/frontend/interfaces/](../../app/frontend/interfaces/)
- **io-ts for API**: Always use `io-ts` for API response validation in Admin module
- **Type vs Interface**: 
  - Use `interface` for extensible types (can be extended later)
  - Use `type` for unions, intersections, and computed types
- **Export Types**: Always export types that are used across files
- **Path Mapping**: Use `~/` prefix for imports (maps to `app/frontend/`)

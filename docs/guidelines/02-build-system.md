# Build System & Configuration

### Vite Configuration

We use **Vite** for development compilation and **Rails** (via [vite_ruby](https://vite-ruby.netlify.app/)) to serve compiled assets in production.

**Configuration:** [vite.config.ts](../../vite.config.ts) | [config/vite.json](../../config/vite.json)

- **Development**: `esbuild` for fast compilation
- **Production**: `rollup` for optimized bundles, served by Rails asset pipeline
- **Plugin**: `vite-plugin-ruby` bridges Vite and Rails

### CSS Module Loading Strategy

We use a **custom CSS module loading approach** where all `.less` files are treated as CSS Modules **by default**, except for explicitly excluded global files.

#### Global Style Files (Excluded from CSS Modules)

The following files are loaded as **global styles** and are NOT scoped:

The following patterns are excluded from CSS Modules (files ending with these paths):

*   `*/ant.less` - Ant Design theme files
*   `*/styles/global.less` - Global styles (e.g., [modules/endUser/styles/global.less](../../app/frontend/modules/endUser/styles/global.less))
*   [styles/common.less](../../app/frontend/styles/common.less) - Common styles
*   [styles/utils.less](../../app/frontend/styles/utils.less) - Utility classes
*   `*/admin/style.less` - Admin global styles (e.g., [modules/admin/style.less](../../app/frontend/modules/admin/style.less))

#### CSS Module Files (Scoped)

All other `.less` files (excluding `node_modules`) are automatically treated as CSS Modules with:
- **Scoped class names**: Prevents global namespace pollution
- **Development naming**: `[name]__[local]___[hash:base64:5]`
- **Production naming**: `[hash:base64:5]` (optimized)
- **Camel case locals**: `class-name` becomes `className` in JavaScript

**Example:**
```typescript
// Component.tsx
import styles from './Component.less' // Automatically scoped

const Component = () => (
  <div className={styles.container}> // Becomes: Component__container___a1b2c
    <h1 className={styles.title}>Title</h1>
  </div>
)
```

See the configuration in [vite.config.ts:80-94](../../vite.config.ts#L80-L94)

### Key Principles

#### SVG as React Components

Import SVGs with the `?react` suffix to use them as React components:

```typescript
// Import SVG as a React component
import StartIcon from './assets/Start_Recording.svg?react'
import StopIcon from './assets/Stop_Recording.svg?react'

const Component = () => (
  <div>
    <StartIcon width={24} height={24} />
    <StopIcon className="icon-stop" />
  </div>
)
```

Configuration: [vite.config.ts:76-78](../../vite.config.ts#L76-L78) (using `vite-plugin-svgr`)

#### TypeScript Support

Full TypeScript support with strict type checking enabled:

```typescript
// tsconfig.json configuration
{
  "compilerOptions": {
    "target": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "~/*": ["./app/frontend/*"]
    }
  }
}
```

Configuration: [tsconfig.json](../../tsconfig.json) | Type checking in dev: [vite.config.ts:33](../../vite.config.ts#L33)

#### Chunk Splitting

Intelligent vendor chunking separates third-party libraries from application code for better caching:

```javascript
// Automatic vendor chunking (from vite.config.ts)
manualChunks(id) {
  if (id.includes('node_modules')) {
    return 'vendors' // All npm packages in vendors chunk
  }
}
```

Large libraries like `@tensorflow/tfjs-core`, `video.js`, `powerbi-client` are excluded from the main vendor chunk to reduce initial load time.

Configuration: [vite.config.ts:136-153](../../vite.config.ts#L136-L153)

#### Source Maps

Source maps are enabled in both development and production for debugging:

```javascript
// Development: external source maps via esbuild
esbuild: {
  sourcemap: 'external'
}

// Production: enabled for error tracking (Sentry)
build: {
  sourcemap: true
}
```

Configuration: [vite.config.ts:108-112](../../vite.config.ts#L108-L112)

#### Lazy Loading (Code Splitting)

We use React lazy loading **at the module level** for major features to reduce initial bundle size and improve performance. The strategy is to lazy load entire functional modules (like Client, Users, Reports) rather than lazy loading every individual route.

```typescript
// Example: Client module lazy loads major sub-routes
// File: modules/admin/modules/client/routes/index.tsx
import { lazy } from 'react'

// Lazy load major module components
const Client = lazy(() => import('./Client'))
const ClientList = lazy(() => import('./ClientList'))
const Project = lazy(() => import('~/modules/admin/modules/client/routes/Client/routes/Project'))

const routes = [
  {
    path: 'clients',
    element: <ClientList />,  // Loaded on demand
  },
  {
    path: 'clients/:clientId',
    element: <Client />,  // Loaded on demand
  },
]
```

**Major modules using this pattern:**
- **Client module**: [modules/admin/modules/client/routes/index.tsx](../../app/frontend/modules/admin/modules/client/routes/index.tsx) - Lazy loads Client, ClientList, Project
- **Users module**: [modules/admin/modules/Users/routes/index.tsx](../../app/frontend/modules/admin/modules/Users/routes/index.tsx) - Lazy loads UserList, APIKeysList
- **Reports module**: [modules/admin/modules/Reports/routes/index.tsx](../../app/frontend/modules/admin/modules/Reports/routes/index.tsx) - Lazy loads ReportList, EditReport, ReportBundleList

This strategy ensures that:
- Users only download the code for the major features they access
- Initial app load is faster
- We don't over-split by lazy loading every tiny component

### Performance Guidelines

#### Bundle Optimization

```typescript
// ✅ Import specific modules from lodash
import has from 'lodash/has'
import get from 'lodash/get'

// ❌ Import entire lodash
import _ from 'lodash'
```

#### Component Optimization

```typescript
// ✅ Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // expensive rendering logic
})

// ✅ Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data)
}, [data])

// ✅ Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependency])
```

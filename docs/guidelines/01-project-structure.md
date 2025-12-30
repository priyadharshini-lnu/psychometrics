# Project Structure

Our frontend is organized into two main modules. The entry point for the application is located at [app/frontend/entrypoints](../../app/frontend/entrypoints).

*   **app/frontend/**
    *   [modules/](../../app/frontend/modules)
        *   [admin/](../../app/frontend/modules/admin) - Admin App
            *   **Standard Module Layout:** [modules/client](../../app/frontend/modules/admin/modules/client)
                *   [core/](../../app/frontend/modules/admin/modules/client/core) - Business logic & Resource definitions
                *   [routes/](../../app/frontend/modules/admin/modules/client/routes) - React Components & Routes
                *   `settings.ts` - Module settings
        *   [endUser/](../../app/frontend/modules/endUser) - Enduser app
            *   **Standard Module Layout:** [modules/campaigns](../../app/frontend/modules/endUser/modules/campaigns)
                *   [core/](../../app/frontend/modules/endUser/modules/campaigns/core) - Business logic & State
                *   [routes/](../../app/frontend/modules/endUser/modules/campaigns/routes) - Routes & Pages
                *   [components/](../../app/frontend/modules/endUser/modules/campaigns/components) - Module-specific components
                *   `App.tsx` - Entry component
    *   [components/](../../app/frontend/components) - Shared components
    *   [hooks/](../../app/frontend/hooks) - Custom React hooks
    *   [utils/](../../app/frontend/utils) - Utility functions
    *   [styles/](../../app/frontend/styles) - Global styles and utilities
    *   [interfaces/](../../app/frontend/interfaces) - TypeScript interfaces
    *   [middleware/](../../app/frontend/middleware) - Redux middleware
    *   [core/](../../app/frontend/core) - Core application logic
    *   [assets/](../../app/frontend/assets) - Static assets

### Key Principles

- **Module Separation**: Keep [admin](../../app/frontend/modules/admin) and [endUser](../../app/frontend/modules/endUser) modules completely separate
- **Shared Components**: Place reusable components in the global [components/](../../app/frontend/components) directory
- **Feature-Based Organization**: Within modules, organize by feature

### File Naming Conventions

#### Components

```
ComponentName.tsx          # Main component file
ComponentName.less         # Component styles
ComponentName.test.tsx     # Component tests
index.ts                   # Barrel export (if needed)
```

#### Modules

```
modules/
├── admin/
│   ├── components/        # Module-specific components
│   ├── core/             # State management
│   ├── routes/           # Routing configuration
│   └── utils/            # Module utilities
```

#### Utilities and Hooks

```
hooks/
├── useCustomHook.ts      # Custom hook
├── useApiData.ts         # API-related hook

utils/
├── stringUtils.ts        # Utility functions
├── dateHelpers.ts        # Date utilities
```

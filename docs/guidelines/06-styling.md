# Styling Guidelines

### CSS Modules Strategy

**All component styles use CSS Modules** with `.less` files.

Real Example: [modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx) + [IdpReportPreview.less](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.less)

```typescript
// IdpReportPreview.tsx
import styles from './IdpReportPreview.less'

export const IdpReportPreview = () => (
  <div style={{ padding: 20 }}>
    <div className={styles.initial}>
      <IdpReport />
    </div>
  </div>
)
```

```less
/* IdpReportPreview.less */
.initial {
  margin-top: 20px;
  font-size: 12px;

  * {
    box-sizing: border-box;
  }
  p {
    margin: 0 0 10px;
  }
}
```

### Utility Classes

Use our extensive utility class system from [app/frontend/styles/utils.less](../../app/frontend/styles/utils.less):

```typescript
// ✅ Use utility classes for common styling
<div className="flex items-center justify-between p-4 mb-2">
  <span className="fs-16 font-bold">Title</span>
  <Button className="ms-auto" />
</div>
```

**Core utility files:**
- [styles/utils.less](../../app/frontend/styles/utils.less) - Utility classes
- [styles/variables.less](../../app/frontend/styles/variables.less) - LESS variables
- [styles/spacing.less](../../app/frontend/styles/spacing.less) - Spacing scale
- [styles/antv4.variable.less](../../app/frontend/styles/antv4.variable.less) - Ant Design v4 theme variables

### Available Utilities

See the complete list in [styles/utils.less](../../app/frontend/styles/utils.less)

**Spacing** (using rem units):
```less
// Margin: ms-2, me-4, mt-1, mb-3, m-6
// Padding: ps-2, pe-4, pt-1, pb-3, p-6
// Values: 0, 1(0.25rem), 2(0.5rem), 3(0.75rem), 4(1rem), ..., 96(24rem)
```

**Layout**:
```less
.flex, .flex-column
.items-center, .items-start, .items-end
.justify-center, .justify-between, .justify-around
.w-100, .h-100, .w-auto, .h-auto
```

**Typography**:
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

// ❌ Avoid global styles
:global {
  .some-class {
    width: 190px;
  }
}

// ❌ Avoid !important (except for utilities)
.my-class {
  color: red !important; /* avoid */
}
```

### Inline Styles

Example: [modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx:47](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx#L47)

```typescript
// ✅ Maximum 3 properties for inline styles
<div style={{ padding: 20 }}>
  <LangDropdownWithChangeUrl locales={['en', 'ar']} currentLocale={lang} />
</div>

// ❌ Avoid complex inline styles - use CSS Modules instead
<div style={{
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  margin: '8px',
  backgroundColor: '#fff',
  borderRadius: '4px'
}}>
```

### Icons

Example: [modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx:4](../../app/frontend/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/IdpReportPreview.tsx#L4)

```typescript
// ✅ Prefer Ant Design icons, keeping accessibility in mind do not directly import from @ant-design/icons instead import them from glint/icons/AccessibleIconsAntDesign. If icon does not already exist then re-export from above file with withAccessibilityProps and use it.
import { DownloadOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const Component = () => (
  <Button>
    <Space>
      {I18n.t('common.actions.download')}
      <DownOutlined />  // Ant Design icon
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

**Custom icon directory:** [app/frontend/glint/icons/](../../app/frontend/glint/icons/)

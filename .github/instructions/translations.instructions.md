---
applyTo: '**'
---

# Translations Rule

**Always use translations for static text.** Never hardcode user-facing strings directly in the code.

## ⚠️ CRITICAL: Never Add Translations to others.yml

**❌ DO NOT add translations to `config/locales/*/others.yml`**
**❌ DO NOT add translations to `config/locales/*/administration.yml`**

The `others.yml` and `administration.yml` file is legacy and should **NEVER** be modified. All new translations **MUST** go into:
- `admin.yml`
- `enduser.yml`
- `shared.yml`

## Translation File Location

Determine the correct translation file based on where the code is used:

### Admin Module
If code is in `app/frontend/modules/admin`:
- **File**: `config/locales/en/admin.yml`
- **Access**: `I18n.t('admin.your.translation.key')`

### EndUser Module
If code is in `app/frontend/modules/endUser`:
- **File**: `config/locales/en/enduser.yml`
- **Access**: `I18n.t('enduser.your.translation.key')`

### Shared Code
If code is used in **both** admin and endUser modules (e.g., in `app/frontend/components`, `app/frontend/modules/reports`):
- **File**: `config/locales/en/shared.yml`
- **Access**: `I18n.t('shared.your.translation.key')`

### Reports Module
If code is in `app/frontend/modules/reports`:
- **File**: `config/locales/en/shared.yml` (reports are shared between admin and endUser)
- **Access**: `I18n.t('shared.reports.your.translation.key')`

## Usage Examples

### ❌ Bad - Hardcoded text
```typescript
<Typography.Text>Y-Axis Interval</Typography.Text>
<Button>Save Changes</Button>
<Checkbox>All corner rounded</Checkbox>
```

### ✅ Good - Using translations (with flat structure)
```typescript
// In admin module
<Typography.Text>{I18n.t('admin.y_axis_interval')}</Typography.Text>
<Button>{I18n.t('admin.save_button')}</Button>

// In endUser module
<Typography.Text>{I18n.t('enduser.y_axis_interval')}</Typography.Text>

// In shared components (including reports)
<Typography.Text>{I18n.t('shared.y_axis_interval')}</Typography.Text>
<Button>{I18n.t('shared.cancel')}</Button>
```

## Translation File Structure

**IMPORTANT: Use FLAT structure with snake_case keys**

All translations in `admin.yml`, `enduser.yml`, and `shared.yml` use a **flat structure** directly under the module namespace. Do NOT create nested hierarchies.

```yaml
# config/locales/en/admin.yml
en:
  admin:
    save_button: "Save"
    cancel_button: "Cancel"
    delete_button: "Delete"
    y_axis_interval: "Y-Axis Interval"
    x_axis_interval_placeholder: "Auto"

# config/locales/en/shared.yml
en:
  shared:
    y_axis_interval: "Y-Axis Interval"
    x_axis_interval: "X-Axis Interval"
    x_axis_interval_placeholder: "Auto"
    y_axis_interval_placeholder: "Auto"

# config/locales/en/enduser.yml
en:
  enduser:
    submit_button: "Submit"
    next_button: "Next"
```

**Key naming conventions:**
- Use `snake_case` for all keys
- Keep keys descriptive but flat (no nesting)
- Use suffixes for variations: `_button`, `_placeholder`, `_label`, `_title`, etc.

## Accessing Translations in Code

```typescript
// Access the I18n object from window
const { I18n } = window

// Use translation with flat structure
const label = I18n.t('admin.y_axis_interval')
const placeholder = I18n.t('shared.x_axis_interval_placeholder')

// With interpolation
const message = I18n.t('admin.items_count_message', { count: 5 })
// Translation: "You have {{count}} items"
```

## When Adding New Translations

1. **Identify the module**: Determine if it's admin, endUser, or shared
2. **Choose the file**: Select the appropriate YAML file
3. **Add the key**: Use a clear, descriptive key with snake_case
4. **Update all locales**: If other language files exist (e.g., `ar/admin.yml`), add translations there too
5. **Normalize translations**: Run the following command to sort keys alphabetically:
   ```bash
   bundle exec i18n-tasks normalize -p
   ```
6. **Use in code**: Reference the translation key using `I18n.t()`

## Important Notes

- **Never hardcode text** that users will see
- **Always use namespaced keys** (e.g., `admin.section.key`, not just `key`)
- **Keep keys descriptive** and organized hierarchically
- **Reuse existing translations** when possible before creating new ones
- **Check existing translations** in the YAML files to avoid duplicates

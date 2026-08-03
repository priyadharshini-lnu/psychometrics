// Value narrowers for reading legacy, untyped redux slices without type assertions.

export const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined)

export const asNumber = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined)

export const asBoolean = (value: unknown): boolean | undefined => (typeof value === 'boolean' ? value : undefined)

export const asStringOrNumber = (value: unknown): string | number | undefined => (
  asString(value) ?? asNumber(value)
)

export const asRecord = (value: unknown): Record<string, unknown> | undefined => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : undefined
)

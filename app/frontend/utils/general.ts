export const getNonEmptyValue = (value: unknown, fallback = '') => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'number' && isNaN(value)) return fallback
  return value
}

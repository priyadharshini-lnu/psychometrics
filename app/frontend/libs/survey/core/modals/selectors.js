
export const currentModalsSelector = modals => _.reduce(modals, (acc, value, key) => {
  if (value.show) {
    acc[key] = value
  }
  return acc
}, {})

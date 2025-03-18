
import { UserSavedFilter } from './core'

const predicates = ['cont', 'in']

export const toTitleCase = (str: string): string => str
  .split('_')
  .filter(part => !predicates.includes(part))
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ')

export const getFilterDetails = (savedFilters: UserSavedFilter[],
  label: string) => savedFilters.filter((item: UserSavedFilter) => item.name === label)

export const generateSmartFilterName = (selectedFilters:
  { [key: string]: string[] | string }) => Object.entries(selectedFilters).map(([key, value]) => {
  const filterLabel = toTitleCase(key)
  let filterValue: string
  if (Array.isArray(value)) {
    filterValue = value.join(', ')
  } else {
    filterValue = value
  }
  return `${filterLabel}: ${filterValue}`
}).join(' | ')

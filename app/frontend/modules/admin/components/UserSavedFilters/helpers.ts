import { UserSavedFilter } from './core'

const { I18n } = window

const predicates = ['cont', 'in']

export type FilterOption = { id: string | number, name: string }

export type FilterOptions = {
  clients?: FilterOption[]
  projects?: FilterOption[]
  campaigns?: FilterOption[]
  assessments?: FilterOption[]
  reports?: FilterOption[]
  qcUsers?: FilterOption[]
  approvers?: FilterOption[]
  [key: string]: FilterOption[] | undefined
}

const filterKeyToOptionsMapping: Record<string, string> = {
  client_id_in: 'clients',
  project_id_in: 'projects',
  campaign_id_in: 'campaigns',
  assessment_id_in: 'assessments',
  report_id_in: 'reports',
  qc_user_id_in: 'qcUsers',
  approver_user_id_in: 'approvers',
}

const toTitleCase = (str: string): string => str
  .split('_')
  .filter(part => !predicates.includes(part))
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ')

// i18n-js answers a missing key with its own placeholder text, never the key, so the fallback has to be handed over.
export const getFilterLabel = (filterKey: string): string => I18n.t(
  `admin.saved_filter_label.${filterKey}`, { defaultValue: toTitleCase(filterKey) },
)

export const getFilterDetails = (savedFilters: UserSavedFilter[],
  label: string) => savedFilters.filter((item: UserSavedFilter) => item.name === label)

const lookupFilterValueName = (
  filterKey: string,
  value: string,
  filterOptions?: FilterOptions,
): string => {
  if (!filterOptions) return value

  const optionsKey = filterKeyToOptionsMapping[filterKey]
  if (!optionsKey) return value

  const options = filterOptions[optionsKey]
  if (!options) return value

  const matchedOption = options.find(opt => String(opt.id) === String(value))
  return matchedOption ? matchedOption.name : value
}

export const resolveFilterValues = (
  filterKey: string,
  values: string[] | string,
  filterOptions?: FilterOptions,
): string => {
  if (Array.isArray(values)) {
    return values.map(v => lookupFilterValueName(filterKey, v, filterOptions)).join(', ')
  }
  return lookupFilterValueName(filterKey, values, filterOptions)
}

export const generateSmartFilterName = (
  selectedFilters: { [key: string]: string[] | string },
  filterOptions?: FilterOptions,
) => Object.entries(selectedFilters).map(([key, value]) => {
  const filterLabel = getFilterLabel(key)
  const filterValue = resolveFilterValues(key, value, filterOptions)
  return `${filterLabel}: ${filterValue}`
}).join(' | ')

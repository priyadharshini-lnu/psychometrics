import dayjs from '~/utils/dayjs'
import { AuditHistoryEntry } from '~/modules/admin/modules/AuditLog/core'
import { DayGroup, RequestGroup } from './types'

const ACTION_COLORS: Record<string, string> = {
  create: 'green',
  update: 'blue',
  destroy: 'red',
}

const MAX_RANGE_DAYS = 30
const DEFAULT_RANGE_DAYS = 7

const defaultDateRange = (): [dayjs.Dayjs, dayjs.Dayjs] => [
  dayjs().subtract(DEFAULT_RANGE_DAYS, 'day').startOf('day'),
  dayjs().endOf('day'),
]

const normalizeSearch = (value: string) => value.toLowerCase().replace(/[\s_:]+/g, '')

const filterRecordType = (input: string, option?: { label?: string; value?: string }) => (
  normalizeSearch(String(option?.label ?? option?.value ?? '')).includes(normalizeSearch(input))
)

const recordLabel = (entry: AuditHistoryEntry) => {
  const base = `${entry.auditableType} #${entry.auditableId}`

  return entry.auditableName ? `${base} — ${entry.auditableName}` : base
}

const groupByRequest = (list: AuditHistoryEntry[]): RequestGroup[] => {
  const groups: RequestGroup[] = []

  list.forEach((entry) => {
    const uuid = entry.requestUuid || undefined
    const last = groups[groups.length - 1]

    if (uuid && last && last.requestUuid === uuid) {
      last.entries.push(entry)
    } else {
      groups.push({ key: `${uuid || 'na'}-${entry.id}`, requestUuid: uuid, entries: [entry] })
    }
  })

  return groups
}

const groupByDay = (groups: RequestGroup[]): DayGroup[] => {
  const days: DayGroup[] = []

  groups.forEach((group) => {
    const createdAt = group.entries[0]?.createdAt
    const label = createdAt ? dayjs(createdAt).format('MMMM D, YYYY') : '—'
    const last = days[days.length - 1]

    if (last && last.label === label) last.groups.push(group)
    else days.push({ key: label, label, groups: [group] })
  })

  return days
}

const changedFieldNames = (entry: AuditHistoryEntry): string[] => {
  const changes = entry.auditedChanges

  return changes && typeof changes === 'object' ? Object.keys(changes) : []
}

export {
  ACTION_COLORS,
  MAX_RANGE_DAYS,
  defaultDateRange,
  filterRecordType,
  recordLabel,
  groupByRequest,
  groupByDay,
  changedFieldNames,
}

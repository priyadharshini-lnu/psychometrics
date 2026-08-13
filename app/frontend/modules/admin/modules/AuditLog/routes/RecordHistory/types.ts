import dayjs from '~/utils/dayjs'
import { AuditHistoryEntry } from '~/modules/admin/modules/AuditLog/core'

type SearchFormValues = {
  requestUuid?: string
  recordType?: string
  recordId?: string
  associatedRecord?: boolean
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs]
}

type RequestGroup = {
  key: string
  requestUuid?: string
  entries: AuditHistoryEntry[]
}

type DayGroup = {
  key: string
  label: string
  groups: RequestGroup[]
}

export type { SearchFormValues, RequestGroup, DayGroup }

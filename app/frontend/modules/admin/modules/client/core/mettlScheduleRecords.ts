import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const MettlScheduleRecordTR = t.type({
  id: t.string,
  scheduleName: t.string,
  scheduleId: t.string,
  proctoringEnabled: t.boolean,
  secureBrowserEnabled: t.boolean,
  assessmentId: t.string,
  assessmentName: t.string,
  createdAt: t.string,
  project: t.union([
    t.type({
      id: t.string,
    }),
    t.undefined]),
})

export type MettlScheduleRecord = t.TypeOf<typeof MettlScheduleRecordTR>

export const MettlScheduleRecordsTR = t.intersection([
  ResourceIdentifierTR,
  MettlScheduleRecordTR,
])

export type MettlScheduleRecords = t.TypeOf<typeof MettlScheduleRecordsTR>

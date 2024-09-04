import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const MettlScheduleRecordTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    id: t.string,
    scheduleName: t.string,
    scheduleId: t.string,
    createdAt: t.string,
    project: t.union([
      t.type({
        id: t.string,
      }),
      t.undefined]),
  }),
])

export type MettlScheduleRecords = t.TypeOf<typeof MettlScheduleRecordTR>

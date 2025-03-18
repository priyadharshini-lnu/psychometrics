import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const UserDataTR = t.type({
  id: t.string,
  email: t.string,
})

export const ReportApprovalSettingsTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    qcs: t.array(UserDataTR),
    approvers: t.array(UserDataTR),
    approvalNotificationUsers: t.array(UserDataTR),
    approversNotRequired: t.boolean,
    approversCanEdit: t.boolean,
    doNotSendNotifications: t.boolean,
    campaign: t.type({
      id: t.string,
      type: t.string,
    }),
    report: t.type({
      id: t.string,
      name: t.string,
    }),
  }),
])

export type ReportApprovalSettings = t.TypeOf<typeof ReportApprovalSettingsTR>

export const Schema = {
  type: 'report_approval_settings',
  relationships: {
    campaign: {
      type: 'campaigns',
    },
    report: {
      type: 'reports',
    },
  },
}

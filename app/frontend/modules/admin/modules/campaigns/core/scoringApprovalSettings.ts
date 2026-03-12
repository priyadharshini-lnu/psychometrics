import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const UserDataTR = t.type({
  id: t.string,
  email: t.string,
})

export const ScoringApprovalSettingsTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    assessors: t.array(UserDataTR),
    approvers: t.array(UserDataTR),
    allowBulkApprove: t.boolean,
    allowBulkApproveScores: t.boolean,
    sendDigestEmails: t.boolean,
    allowOneLevelApprove: t.boolean,
    digestFrequency: t.union([t.string, t.null]),
    digestWeekdays: t.array(t.number),
    digestTime: t.union([t.string, t.null]),
    digestTimezone: t.union([t.string, t.null]),
    digestDeliveryMode: t.union([t.string, t.null]),
    campaign: t.type({
      id: t.string,
      type: t.string,
    }),
    assessment: t.type({
      id: t.string,
      name: t.string,
    }),
  }),
])

export type ScoringApprovalSettings = t.TypeOf<typeof ScoringApprovalSettingsTR>

export const Schema = {
  type: 'ai_scoring_approval_settings',
  relationships: {
    campaign: {
      type: 'campaigns',
    },
    assessment: {
      type: 'assessments',
    },
  },
}

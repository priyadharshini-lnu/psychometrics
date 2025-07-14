import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const CommonPermissionsTR = t.type({
  edit: t.boolean,
  delete: t.boolean,
  copy: t.boolean,
  updateCampaignOptions: t.boolean,
  manageCampaigns: t.boolean,
  viewRegistrationCodes: t.boolean,
  viewDatasheets: t.boolean,
  manageCampaignAdmins: t.boolean,
  manageOptions: t.boolean,
  viewDashboard: t.boolean,
  initializeDashboard: t.boolean,
  viewAccesssheet: t.boolean,
  viewAccesssheetSettings: t.boolean,
  viewSmsInvites: t.boolean,
  viewAssessors: t.boolean,
  viewWorkshops: t.boolean,
  viewWorkshopInvites: t.boolean,
  viewCampiagnScoring: t.boolean,
  stats: t.boolean,
  pdfPassword: t.boolean,
  viewCampaignScoring: t.boolean,
  manageCampaignScoring: t.boolean,
  viewCampaignScoringSetting: t.boolean,
  viewAuditReports: t.boolean,
  viewAssessmentsAndReports: t.boolean,
  manageReportApprovalSettings: t.boolean,
})

const ThreesixtyCampaignPermissionsTR = t.type({
  editAssessment: t.boolean,
  manageReportsOptions: t.boolean,
  accessEmailMessages: t.boolean,
  accessInstructionMessages: t.boolean,
  accessMessagesOptions: t.boolean,
  editParticipantOptions: t.boolean,
  editReportOptions: t.boolean,
  manageAdmins: t.boolean,
})
export const CampaignTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    reportId: t.number,
    assessmentId: t.number,
    type: t.string,
    status: t.string,
    startDate: t.union([t.string, t.null]),
    endDate: t.union([t.string, t.null]),
    isFixedTime: t.union([t.boolean, t.null]),
    isThreesixty: t.union([t.boolean, t.null]),
    practiceCampaign: t.union([t.boolean, t.null]),
    campaignReports: t.array(t.type({
      id: t.string,
      defaultLanguage: t.string,
      availableLanguages: t.array(t.string),
      report: t.union([t.type({ id: t.string, name: t.string }), t.undefined]),
    })),
    campaignAssessments: t.array(t.type({
      id: t.string,
      name: t.string,
      assessment: t.union([t.type({
        id: t.string,
        name: t.string,
        dimension: t.union([t.type({ id: t.string, name: t.string }), t.undefined]),
      }), t.undefined]),
    })),
    threesixtyCampaign: t.union([
      t.type({
        id: t.string,
        name: t.string,
        reportId: t.string,
        assessmentId: t.string,
        meta: t.type({
          permissions: ThreesixtyCampaignPermissionsTR,
        }),
      }),
      t.undefined]),
    meta: t.type({
      permissions: t.union([CommonPermissionsTR, ThreesixtyCampaignPermissionsTR]),
    }),
  }),
])

export type Campaign = t.TypeOf<typeof CampaignTR>

export const Schema = {
  type: 'campaigns',
  relationships: {
    threeSixtyCampaign: {
      type: 'campaigns',
    },
    reports: {
      type: 'reports',
    },
    assessments: {
      type: 'assessments',
    },
  },
}

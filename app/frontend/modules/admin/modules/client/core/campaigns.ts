import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const CommonPermissionsTR = t.type({
  edit: t.union([t.boolean, t.undefined]),
  delete: t.union([t.boolean, t.undefined]),
  copy: t.union([t.boolean, t.undefined]),
  updateCampaignOptions: t.union([t.boolean, t.undefined]),
  manageCampaigns: t.union([t.boolean, t.undefined]),
  viewRegistrationCodes: t.union([t.boolean, t.undefined]),
  viewDatasheets: t.union([t.boolean, t.undefined]),
  manageCampaignAdmins: t.union([t.boolean, t.undefined]),
  manageOptions: t.union([t.boolean, t.undefined]),
  viewDashboard: t.union([t.boolean, t.undefined]),
  initializeDashboard: t.union([t.boolean, t.undefined]),
  viewAccesssheet: t.union([t.boolean, t.undefined]),
  viewAccesssheetSettings: t.union([t.boolean, t.undefined]),
  viewSmsInvites: t.union([t.boolean, t.undefined]),
  viewAssessors: t.union([t.boolean, t.undefined]),
  viewWorkshops: t.union([t.boolean, t.undefined]),
  viewWorkshopInvites: t.union([t.boolean, t.undefined]),
  stats: t.union([t.boolean, t.undefined]),
  pdfPassword: t.union([t.boolean, t.undefined]),
  viewCampaignScoring: t.union([t.boolean, t.undefined]),
  manageCampaignScoring: t.union([t.boolean, t.undefined]),
  viewCampaignScoringSetting: t.union([t.boolean, t.undefined]),
  viewAuditReports: t.union([t.boolean, t.undefined]),
  viewAssessmentsAndReports: t.union([t.boolean, t.undefined]),
  manageReportApprovalSettings: t.union([t.boolean, t.undefined]),
  exportDashboardToFile: t.union([t.boolean, t.undefined]),
})

const ThreesixtyCampaignPermissionsTR = t.type({
  editAssessment: t.union([t.boolean, t.undefined]),
  manageReportsOptions: t.union([t.boolean, t.undefined]),
  accessEmailMessages: t.union([t.boolean, t.undefined]),
  accessInstructionMessages: t.union([t.boolean, t.undefined]),
  accessMessagesOptions: t.union([t.boolean, t.undefined]),
  editParticipantOptions: t.union([t.boolean, t.undefined]),
  editReportOptions: t.union([t.boolean, t.undefined]),
  manageAdmins: t.union([t.boolean, t.undefined]),
  viewDatasheets: t.union([t.boolean, t.undefined]),
  viewAiArtifacts: t.union([t.boolean, t.undefined]),
})

export const CampaignTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    reportId: t.union([t.number, t.null, t.undefined]),
    assessmentId: t.union([t.number, t.null, t.undefined]),
    type: t.string,
    status: t.string,
    startDate: t.union([t.string, t.null, t.undefined]),
    endDate: t.union([t.string, t.null, t.undefined]),
    isFixedTime: t.union([t.boolean, t.null, t.undefined]),
    isThreesixty: t.union([t.boolean, t.null, t.undefined]),
    practiceCampaign: t.union([t.boolean, t.null, t.undefined]),
    tenantId: t.union([t.number, t.null, t.undefined]),
    campaignReports: t.array(t.type({
      id: t.string,
      defaultLanguage: t.union([t.string, t.null, t.undefined]),
      availableLanguages: t.array(t.string),
      report: t.union([
        t.intersection([t.type({ id: t.string }), t.partial({ name: t.string })]),
        t.undefined,
      ]),
    })),
    campaignAssessments: t.array(t.type({
      id: t.string,
      assessment: t.union([
        t.intersection([
          t.type({ id: t.string }),
          t.partial({
            name: t.string,
            dimension: t.union([
              t.intersection([t.type({ id: t.string }), t.partial({ name: t.string })]),
              t.undefined,
            ]),
          }),
        ]),
        t.undefined,
      ]),
    })),
    threesixtyCampaign: t.union([
      t.type({
        id: t.string,
        name: t.string,
        reportId: t.number,
        assessmentId: t.number,
        category: t.string,
        template: t.boolean,
        meta: t.type({
          permissions: ThreesixtyCampaignPermissionsTR,
        }),
      }),
      t.undefined]),
    meta: t.type({
      permissions: t.union([CommonPermissionsTR, t.undefined]),
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

import { Schema as activitiesSchema } from '~/modules/admin/modules/campaigns/core/workshopActivity'
import { Schema as clientSchema } from '~/modules/admin/modules/client/core/clients'
import { Schema as assessmentSchema } from '~/modules/admin/modules/client/core/assessments'
import { Schema as reportSchema } from '~/modules/admin/modules/client/core/reports'
import { Schema as reportBundleReportSchema } from '~/modules/admin/modules/client/core/reportBundleReports'
import { Schema as dashboardSchema } from '~/modules/admin/modules/campaigns/core/dashboard'
import { Schema as reportApprovalSchema } from '~/modules/admin/modules/ReportApprovals/core'
import { CommentSchema as commentSchema } from '~/modules/admin/modules/campaigns/core/userReports'
import { Schema as reportApprovalSettingSchema } from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'
import { Schema as licensesSchema } from '~/modules/admin/modules/client/core/licenses'
import { Schema as licenseUsagesSchema } from '~/modules/admin/modules/client/core/license_usages'
import { Workshops as workshopsSchema } from '~/modules/admin/modules/campaigns/core/workshop'
import { Schema as userAvailabilityDate } from '~/modules/admin/modules/UserAvailability/core/userAvailabilityDates'
import { Schema as membershipSchema } from '~/modules/admin/modules/client/core/admin'
import { Schema as adminRoleSchema } from '~/modules/admin/modules/client/core/adminRole'
import { Schema as workshopSubjectsSchema } from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { Schema as workshopResourcesSchema } from '~/modules/admin/modules/campaigns/core/workshopResource'
import {
  Schema as workshopInviteSubjectsSchema,
} from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { Schema as campaignAssessmentSchema } from '~/modules/admin/modules/campaigns/core/campaignAssessment'
import { Schema as workshopInviteSchema } from '~/modules/admin/modules/campaigns/core/invites'
import {
  Schema as campaignFactorGroupSchema,
  UpdatePositionsSchema, CampaignFactorsSchema,
} from '~/modules/admin/modules/campaigns/core/campaignFactorGroup'
import { Schema as CampaignTemplateSchema } from '~/modules/admin/core/types/campaignTemplates'
import { Schema as normsSchema } from '~/modules/admin/modules/client/core/norms'
import { Schema as developmentActionSchema } from '~/modules/admin/modules/client/core/developmentAction'

import { Schema as skillsSchema } from '~/modules/admin/modules/client/core/skills'
import { Schema as campaignIdpSchema } from '~/modules/admin/modules/campaigns/core/campaignIdp'

export const Schema = {
  clients: clientSchema,
  reports: reportSchema,
  report_families_reports: reportBundleReportSchema,
  assessments: assessmentSchema,
  dashboards: dashboardSchema,
  report_approvals: reportApprovalSchema,
  user_report_comments: commentSchema,
  report_approval_settings: reportApprovalSettingSchema,
  licenses: licensesSchema,
  license_usages: licenseUsagesSchema,
  workshops: workshopsSchema,
  user_availability_dates: userAvailabilityDate,
  memberships: membershipSchema,
  admin_roles: adminRoleSchema,
  workshop_subjects: workshopSubjectsSchema,
  workshop_resources: workshopResourcesSchema,
  workshop_invited_subjects: workshopInviteSubjectsSchema,
  campaign_assessments: campaignAssessmentSchema,
  user_assessments: activitiesSchema,
  workshop_invites: workshopInviteSchema,
  campaign_factor_groups: campaignFactorGroupSchema,
  campaign_factors: CampaignFactorsSchema,
  update_positions: UpdatePositionsSchema,
  campaign_templates: CampaignTemplateSchema,
  norms: normsSchema,
  development_actions: developmentActionSchema,
  skills: skillsSchema,
  campaign_idps: campaignIdpSchema,
}

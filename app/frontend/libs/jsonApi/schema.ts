import { Schema as userSavedFilterSchema } from '~/modules/admin/components/UserSavedFilters/core'
import { Schema as activitiesSchema } from '~/modules/admin/modules/campaigns/core/workshopActivity'
import { Schema as clientSchema } from '~/modules/admin/modules/client/core/clients'
import { Schema as assessmentSchema } from '~/modules/admin/modules/client/core/assessments'
import { Schema as reportSchema } from '~/modules/admin/modules/client/core/reports'
import { Schema as reportBundleReportSchema } from '~/modules/admin/modules/client/core/reportBundleReports'
import { Schema as dashboardSchema } from '~/modules/admin/modules/campaigns/core/dashboard'
import { Schema as reportApprovalSchema } from '~/modules/admin/modules/ReportApprovals/core'
import { Schema as scoringApprovalSettingSchema } from '~/modules/admin/modules/campaigns/core/scoringApprovalSettings'
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
import {
  Schema as DataReportsSchema, JobSchema as DataReportJobsSchema,
} from '~/modules/admin/modules/DataReports/core'
import { Schema as CampaignTemplateSchema } from '~/modules/admin/core/types/campaignTemplates'
import { Schema as normsSchema } from '~/modules/admin/modules/client/core/norms'
import { Schema as developmentActionSchema } from '~/modules/admin/modules/client/core/developmentAction'

import { Schema as skillsSchema } from '~/modules/admin/modules/client/core/skills'
import { Schema as campaignIdpSchema } from '~/modules/admin/modules/campaigns/core/campaignIdp'
import { Schema as idpTemplateSchema } from '~/modules/admin/modules/client/core/idp'
import { Schema as dimensionSchema } from '~/modules/admin/modules/client/core/dimensions'
import { Schema as proficiencyLevelSchema } from '~/modules/admin/modules/client/core/proficiencyLevels'
import { Schema as reflectionQuestionSchema } from '~/modules/admin/modules/client/core/reflectionQuestion'
import { Schema as interviewQuestionSchema } from '~/modules/admin/modules/client/core/interviewQuestion'
import { Schema as questionSchema } from '~/modules/admin/modules/QuestionCenter/core/questions'
import { Schema as aiAssistantSchema } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { Schema as userIdpPlanSchema } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { Schema as AiArtifactsSchema } from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { Schema as factorsSchema } from '~/modules/admin/modules/campaigns/core/factors'
import { Schema as blocksSchema } from '~/modules/admin/modules/QuestionCenter/core/blocks'
import { Schema as applicationsSchema } from '~/modules/admin/modules/client/core/applications'
import { Schema as publicKeysSchema } from '~/modules/admin/modules/client/core/publicKeys'
import { Schema as applicationSettingsSchema } from '~/modules/admin/modules/client/core/applicationSettings'
import { Schema as applicationIpWhitelistEntriesSchema }
  from '~/modules/admin/modules/client/core/applicationIpWhitelistEntries'

export const Schema = {
  clients: clientSchema,
  reports: reportSchema,
  report_families_reports: reportBundleReportSchema,
  assessments: assessmentSchema,
  dashboards: dashboardSchema,
  report_approvals: reportApprovalSchema,
  user_report_comments: commentSchema,
  report_approval_settings: reportApprovalSettingSchema,
  ai_scoring_approval_settings: scoringApprovalSettingSchema,
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
  data_reports: DataReportsSchema,
  data_report_jobs: DataReportJobsSchema,
  campaign_templates: CampaignTemplateSchema,
  norms: normsSchema,
  development_actions: developmentActionSchema,
  skills: skillsSchema,
  campaign_idps: campaignIdpSchema,
  idp_templates: idpTemplateSchema,
  user_saved_filters: userSavedFilterSchema,
  dimensions: dimensionSchema,
  proficiency_levels: proficiencyLevelSchema,
  reflection_questions: reflectionQuestionSchema,
  interview_questions: interviewQuestionSchema,
  ai_assistants: aiAssistantSchema,
  user_idp_plans: userIdpPlanSchema,
  ai_artifacts: AiArtifactsSchema,
  factors: factorsSchema,
  questions: questionSchema,
  blocks: blocksSchema,
  applications: applicationsSchema,
  public_keys: publicKeysSchema,
  application_settings: applicationSettingsSchema,
  application_ip_whitelist_entries: applicationIpWhitelistEntriesSchema,
}

import { ReportTypeDefinition } from './types'
import { jsonDataReportDefinition } from './JsonDataReportConfig'
import { userReportsDefinition } from './UserReportsConfig'
import { reportUsageSummaryDefinition } from './ReportUsageSummaryConfig'
import { userCreatedDatesExportDefinition } from './UserCreatedDatesExportConfig'
import { hoganUsageReportDefinition } from './HoganUsageReportConfig'
import { savilleUsageReportDefinition } from './SavilleUsageReportConfig'
import { pearsonUsageReportDefinition } from './PearsonUsageReportConfig'
import { activeClientsProjectsDefinition } from './ActiveClientsProjectsConfig'
import { clientAssessmentCountsDefinition } from './ClientAssessmentCountsConfig'
import { userAccessReviewDefinition } from './UserAccessReviewConfig'
import { campaignFactorScoresDefinition } from './CampaignFactorScoresConfig'
import { campaignUserCreationDefinition } from './CampaignUserCreationConfig'

export * from './types'

export const REPORT_TYPE_REGISTRY: Record<string, ReportTypeDefinition> = {
  json_data_report: jsonDataReportDefinition,
  user_reports_export: userReportsDefinition,
  report_usage_summary: reportUsageSummaryDefinition,
  user_created_dates: userCreatedDatesExportDefinition,
  hogan_usage_report: hoganUsageReportDefinition,
  saville_usage_report: savilleUsageReportDefinition,
  pearson_usage_report: pearsonUsageReportDefinition,
  active_clients_projects: activeClientsProjectsDefinition,
  client_assessment_counts: clientAssessmentCountsDefinition,
  user_access_review: userAccessReviewDefinition,
  campaign_factor_scores: campaignFactorScoresDefinition,
  campaign_user_creation: campaignUserCreationDefinition,
}

export const REPORT_TYPE_KEYS = Object.keys(REPORT_TYPE_REGISTRY) as Array<keyof typeof REPORT_TYPE_REGISTRY>

export const getReportTypeDefinition = (key: string): ReportTypeDefinition | undefined => REPORT_TYPE_REGISTRY[key]

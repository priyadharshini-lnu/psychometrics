import {
  LocalCampaign,
  CampaignReport,
  DerivedReport,
} from './types'

const { I18n } = window

export interface BulkReportState {
  selectedCampaignIds: Set<string>
  selectedCampaigns: LocalCampaign[]
  selectedReportIds: Set<string>
  startDate: string
  endDate: string
  reportLanguages: Record<string, Set<string>>
  includeInactiveUsers: boolean
}

export type BulkReportSubmitPayload = {
  campaign_ids: string[]
  selected_reports: Record<string, string[]>
  start_date: string | null
  end_date: string | null
  include_inactive_users: boolean
}

type ResourceError = {
  base?: Array<{ title?: string; detail?: string }>
  error?: string
  errors?: string[]
}

type CampaignReportWithDetail = CampaignReport

const REPORT_TYPE_FORMAT: Record<string, DerivedReport['format']> = {
  csv: 'CSV',
  custom_upload: 'Custom Upload',
  pdf: 'PDF',
}

export const reportTypeToFormat = (reportType: string | undefined): DerivedReport['format'] => (
  REPORT_TYPE_FORMAT[reportType ?? ''] ?? 'PDF'
)

export const initialBulkReportState: BulkReportState = {
  selectedCampaignIds: new Set(),
  selectedCampaigns: [],
  selectedReportIds: new Set(),
  startDate: '',
  endDate: '',
  reportLanguages: {},
  includeInactiveUsers: false,
}

export const getLanguageLabel = (code: string): string => {
  try {
    const key = `languages.${code}`
    const label = I18n.t(key)
    return label?.startsWith('[missing') ? code : (label ?? code)
  } catch {
    return code
  }
}

export const formatCampaignCount = (count: number): string => I18n.t(
  count === 1 ? 'admin.bulk_reports_campaign_count_one' : 'admin.bulk_reports_campaign_count_other',
  { count },
)

export const formatReportCount = (count: number): string => I18n.t(
  count === 1 ? 'admin.bulk_reports_report_count_one' : 'admin.bulk_reports_report_count_other',
  { count },
)

export const formatSelectedTagCount = (count: number): string => I18n.t(
  count === 1 ? 'admin.bulk_reports_selected_tags_count_one' : 'admin.bulk_reports_selected_tags_count_other',
  { count },
)

export const formatLanguagesSetForAll = (count: number): string => I18n.t(
  count === 1 ? 'admin.bulk_reports_languages_set_for_all_one' : 'admin.bulk_reports_languages_set_for_all_other',
  { count },
)

export const formatLanguagesProgress = (done: number, total: number): string => I18n.t(
  total === 1 ? 'admin.bulk_reports_languages_progress_one' : 'admin.bulk_reports_languages_progress_other',
  { done, total },
)

export const getResourceErrorMessage = (error: unknown): string | null => {
  if (typeof error === 'string') return error
  if (!error || typeof error !== 'object') return null

  const resourceError = error as ResourceError
  return resourceError.base?.[0]?.title
    || resourceError.base?.[0]?.detail
    || resourceError.error
    || resourceError.errors?.[0]
    || null
}

export const deriveSelectedReports = (
  campaigns: LocalCampaign[],
  selectedReportIds: Set<string>,
): DerivedReport[] => {
  const map: Record<string, DerivedReport> = {}

  campaigns.forEach((campaign) => {
    const campaignReports = campaign.campaignReports as CampaignReportWithDetail[] | undefined
    if (!campaignReports?.length) return

    campaignReports.forEach((campaignReport) => {
      if (!campaignReport.report?.id) return

      const reportId = String(campaignReport.report.id)
      if (!selectedReportIds.has(reportId)) return

      if (!map[reportId]) {
        const { reportType } = campaignReport.report
        map[reportId] = {
          reportId,
          name: campaignReport.report.name,
          description: campaignReport.report.description ?? null,
          format: reportTypeToFormat(reportType),
          availableLanguages: [...(campaignReport.availableLanguages ?? [])],
          defaultLanguage: campaignReport.defaultLanguage,
          campaignCount: 1,
        }
        return
      }

      const existingLanguages = new Set(map[reportId].availableLanguages)
      campaignReport.availableLanguages?.forEach(language => existingLanguages.add(language))
      map[reportId].availableLanguages = [...existingLanguages]
      map[reportId].campaignCount += 1
    })
  })

  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
}

export const buildSubmitPayload = (formState: BulkReportState): BulkReportSubmitPayload => {
  const selectedReports: Record<string, string[]> = {}

  formState.selectedReportIds.forEach((reportId) => {
    const languages = formState.reportLanguages[reportId]
    if (languages && languages.size > 0) {
      selectedReports[reportId] = [...languages]
    }
  })

  return {
    campaign_ids: [...formState.selectedCampaignIds],
    selected_reports: selectedReports,
    start_date: formState.startDate || null,
    end_date: formState.endDate || null,
    include_inactive_users: formState.includeInactiveUsers,
  }
}

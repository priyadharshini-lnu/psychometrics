import { Campaign as CampaignType } from '~/modules/admin/modules/client/core/campaigns'


export type ReportType = 'pdf' | 'csv' | 'custom_upload'

export interface ReportMeta {
  id: string
  name: string
  description?: string | null
  reportType?: ReportType
}

export interface CampaignReport {
  id: string
  defaultLanguage: string | null
  availableLanguages: string[]
  report: ReportMeta | null
}

export type CampaignsMeta = {
  recordCount?: number
  availableTags?: { id: number; name: string; campaignsCount: number }[]
}

export type LocalCampaign = CampaignType & {
  id: string
  tagList: string[]
  campaignReports: CampaignReport[]
  candidatesCount?: number
  project?: { name: string } | null
}

export interface DerivedReport {
  reportId: string
  name: string
  description: string | null | undefined
  format: 'PDF' | 'CSV' | 'Custom Upload'
  availableLanguages: string[]
  defaultLanguage: string | null | undefined
  campaignCount: number
}

export type BulkReportFile = {
  id: number
  filename: string
  url: string
}

export enum BulkReportJobStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
  Scheduled = 'scheduled',
}

export type BulkReportJobCampaign = {
  id: number
  name: string
}

export type BulkReportJobReport = {
  name: string
  locales: string[]
}

export type BulkReportJob = {
  id: string
  status: BulkReportJobStatus | string
  createdAt: string
  createdBy?: string
  startDate?: string
  endDate?: string
  errorMessages?: string[]
  filesCount?: number
  files?: BulkReportFile[]
  campaigns?: BulkReportJobCampaign[]
  selectedReports?: Record<string, BulkReportJobReport>
  includeInactiveUsers?: boolean
}

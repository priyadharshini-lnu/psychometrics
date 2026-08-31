import { asBoolean, asNumber, asString } from '~/utils/narrow'

const { I18n } = window

/** Loose shape of a dashboard campaign row (the API returns more than the decoder lists; every
 * field the card reads is optional-safe). */
export type DashboardCampaign = {
  id: number
  type: string
  name?: string
  assessmentName?: string
  status?: string
  progressStatus?: string | null
  completionPercentage?: number
  userReportsAvailable?: boolean
  scheduledIn?: number
}

const isCampaignRow = (value: unknown): value is { id: number } & Record<string, unknown> => (
  typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'number'
)

/** Derive the card view model field by field — the campaigns reducer is legacy untyped JS. */
const toDashboardCampaign = (row: { id: number } & Record<string, unknown>): DashboardCampaign => ({
  id: row.id,
  type: asString(row.type) ?? '',
  name: asString(row.name),
  assessmentName: asString(row.assessmentName),
  status: asString(row.status),
  progressStatus: asString(row.progressStatus) ?? null,
  completionPercentage: asNumber(row.completionPercentage),
  userReportsAvailable: asBoolean(row.userReportsAvailable),
  scheduledIn: asNumber(row.scheduledIn),
})

/** Rows without a numeric id cannot be keyed or linked, so they are dropped. */
export const toDashboardCampaigns = (rows: unknown): DashboardCampaign[] => (
  Array.isArray(rows) ? rows.filter(isCampaignRow).map(toDashboardCampaign) : []
)

export type CampaignStatus =
  | 'locked'
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'report-ready'

/** Tag color + label for a campaign status (antd Tag preset colors). */
export type StatusTag = { status: CampaignStatus; label: string; color: string }

const SECONDS_PER_DAY = 86_400

/** Whether the campaign is not yet startable (inactive or scheduled for the future). */
export const isCampaignDisabled = (c: DashboardCampaign): boolean => c.status === 'inactive' || (c.scheduledIn ?? 0) > 0

export const mapStatus = (campaign: DashboardCampaign): CampaignStatus => {
  if (isCampaignDisabled(campaign)) return 'locked'

  switch (campaign.progressStatus) {
    case 'completed':
      return campaign.userReportsAvailable ? 'report-ready' : 'completed'
    case 'in_progress':
    case 'interrupted':
      return 'in-progress'
    default:
      return 'not-started'
  }
}

const STATUS_COLOR: Record<CampaignStatus, string> = {
  locked: 'default',
  'not-started': 'default',
  'in-progress': 'blue',
  completed: 'green',
  'report-ready': 'green',
}

const statusLabel = (status: CampaignStatus): string => {
  switch (status) {
    case 'locked':
      return I18n.t('enduser.status_locked')
    case 'report-ready':
      return I18n.t('campaign.insights_reports')
    default:
      return I18n.t(`campaign_assessment.statuses.${status.replace('-', '_')}`)
  }
}

export const mapStatusTag = (campaign: DashboardCampaign): StatusTag => {
  const status = mapStatus(campaign)
  return { status, label: statusLabel(status), color: STATUS_COLOR[status] }
}

/** Whole days until a future-scheduled start, or undefined when there is no countdown. */
export const mapDaysLeft = (campaign: DashboardCampaign): number | undefined => {
  const seconds = campaign.scheduledIn ?? 0
  return seconds > 0 ? Math.ceil(seconds / SECONDS_PER_DAY) : undefined
}

export const mapTitle = (c: DashboardCampaign): string => c.name || c.assessmentName || I18n.t('campaign.campaigns')

/** Primary CTA label: unstarted/locked invites "Start program"; anything underway "Continue program". */
export const mapPrimaryLabel = (campaign: DashboardCampaign): string => {
  const status = mapStatus(campaign)
  const notYetStarted = status === 'not-started' || status === 'locked'
  return notYetStarted
    ? I18n.t('enduser.dashboard_begin_program')
    : I18n.t('enduser.dashboard_continue_program')
}

type Daypart = 'morning' | 'afternoon' | 'evening'

/** Local-clock daypart for the greeting (injectable hour for tests). */
export const daypart = (hour: number = new Date().getHours()): Daypart => {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

/** The serif greeting line, e.g. "Good afternoon, John." — name omitted cleanly when absent. */
export const greeting = (firstName?: string, hour?: number): string => I18n.t(
  `enduser.dashboard_greeting_${daypart(hour)}`,
  { name: (firstName ?? '').trim() },
)

export const detailPath = (campaign: DashboardCampaign): string => (campaign.type === 'threesixty'
  ? `/threesixty_campaigns/${campaign.id}`
  : `/campaigns/${campaign.id}`)

export const insightsPath = (campaign: DashboardCampaign): string => `/campaigns/${campaign.id}/insights`

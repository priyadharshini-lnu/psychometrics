import _ from 'lodash'
import type { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

const { I18n } = window

// ── Local presentation types ──────────────────────────────────────────────────
export type ProgramTab = 'intro' | 'tasks' | 'reports'
const PROGRAM_TABS: readonly ProgramTab[] = ['intro', 'tasks', 'reports']

// antd hands the Tabs callback a plain string; narrow it before it reaches the tab state.
export const isProgramTab = (key: string): key is ProgramTab => PROGRAM_TABS.some(tab => tab === key)
export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed' | 'locked' | 'error'
export type StatusTone = 'not_started' | 'in_progress' | 'completed'
export type AssessmentCenterState = 'invite' | 'reserved' | 'done' | 'locked'
export type ExerciseStep = { index: number; total: number }
/** A chip rendered as a glint Tag (color is an antd Tag preset). */
export type StatChip = { label: string; color: string }

// ── Loose campaign shapes (the campaign object is untyped app-wide; read optional-safe) ────────
export type CampaignGroup = {
  id: number | string
  name?: string
  groupType?: string
  campaignAssessmentIds?: number[]
  previousGroupRequired?: boolean
  previousAssessmentsRequired?: boolean
  hide?: boolean
}

export type CampaignUser = {
  status?: string
  startedAt?: string | null
}

export type Workshop = {
  campaignAssessmentGroupId?: number | string
  startTime?: string | null
  completed?: boolean
  attended?: boolean
  closed?: boolean
  meetingLink?: string | null
}

export type ProgramCampaign = {
  id: number | string
  name?: string
  type?: string
  endDate?: string | null
  userReportsAvailable?: boolean
  campaignUser?: CampaignUser
  groups?: CampaignGroup[]
  ungroupedAssessmentsIds?: number[]
  userAssessments?: UserAssessment[]
  workshops?: Workshop[]
  campaignOptions?: {
    instructionsEnabled?: boolean
    instructions?: string
    proctoringEnabled?: boolean
    selectiveProctoringEnabled?: boolean
  }
}

// ── Card / section models (plain data; composition happens in the content component) ──────────
export type ExerciseCardModel = {
  key: number
  userAssessment: UserAssessment
  title: string
  durationLabel: string
  status: ExerciseStatus
  progressPercent?: number
  proctored: boolean
  iconUrl?: string
  step?: ExerciseStep
  actionLabel: string
}

export type ExerciseGroupModel = {
  /** Admin group name; unnamed for the ungrouped bucket. */
  name?: string
  /** Gating note ("Unlocks after ...") when the group is locked. */
  hint?: string
  cards: ExerciseCardModel[]
}

export type ExerciseSectionModel = {
  heading: string
  hint: string
  groups: ExerciseGroupModel[]
  /** Cards run in order (renders the numbered step markers). */
  sequential?: boolean
}

export type AssessmentCenterModel = {
  groupId: number | string
  heading: string
  description: string
  name: string
  durationLabel: string
  proctored: boolean
  state: AssessmentCenterState
  timerEndMs?: number
}

export type ProgramDetailsModel = {
  title: string
  status: { label: string; tone: StatusTone }
  stats: StatChip[]
  dueDate?: { deadlineMs: number; urgent: boolean }
  tabs: { key: ProgramTab; label: string }[]
  hasIntro: boolean
  instructions?: string
  assessmentCenter?: AssessmentCenterModel
  sequential?: ExerciseSectionModel
  open?: ExerciseSectionModel
  reportsAvailable: boolean
}

const COMPLETED = 'completed'
const MS_PER_DAY = 86_400_000
const URGENT_DAYS = 14

const isCompleted = (ua: UserAssessment): boolean => ua.status === COMPLETED || ua.completionPercent === 100

export const mapStatusTone = (
  userAssessments: UserAssessment[],
  campaignUser?: CampaignUser,
): StatusTone => {
  if (campaignUser?.status === COMPLETED) return 'completed'
  if (!userAssessments.length) return 'not_started'
  if (userAssessments.every(isCompleted)) return 'completed'
  const isStarted = (ua: UserAssessment): boolean => isCompleted(ua)
    || (ua.completionPercent ?? 0) > 0
    || ua.status === 'in_progress'
    || ua.status === 'interrupted'
  return userAssessments.some(isStarted) ? 'in_progress' : 'not_started'
}

const statusLabel = (tone: StatusTone): string => I18n.t(`campaign_assessment.statuses.${tone}`)

// ── Stat chips (Total / Done / % Progress) ────────────────────────────────────
export const mapStats = (userAssessments: UserAssessment[]): StatChip[] => {
  const total = userAssessments.length
  const done = userAssessments.filter(isCompleted).length
  const avg = total
    ? Math.round(_.sumBy(userAssessments, ua => ua.completionPercent ?? 0) / total)
    : 0
  return [
    { label: `${total} ${I18n.t('enduser.details_total')}`, color: 'blue' },
    { label: `${done} ${I18n.t('campaign_assessment.statuses.completed')}`, color: 'green' },
    { label: `${avg}% ${I18n.t('enduser.details_progress')}`, color: 'purple' },
  ]
}

export const mapDueDate = (
  endDate?: string | null,
): { deadlineMs: number; urgent: boolean } | undefined => {
  if (!endDate) return undefined
  const deadlineMs = Date.parse(endDate)
  if (Number.isNaN(deadlineMs)) return undefined
  const daysLeft = Math.ceil((deadlineMs - Date.now()) / MS_PER_DAY)
  return { deadlineMs, urgent: daysLeft <= URGENT_DAYS }
}

const cardStatus = (ua: UserAssessment, locked: boolean): ExerciseStatus => {
  if (locked) return 'locked'
  if (ua.completionReason === 'time_out_offline' || ua.status === 'timed_out') return 'error'
  if (isCompleted(ua)) return 'completed'
  const pct = ua.completionPercent ?? 0
  if (pct > 0 || ua.status === 'in_progress' || ua.status === 'interrupted') return 'in_progress'
  return 'not_started'
}

const cardActionLabel = (status: ExerciseStatus): string => {
  switch (status) {
    case 'in_progress':
      return I18n.t('assessments.card_actions.continue')
    case 'completed':
      return I18n.t('enduser.card_action_review')
    case 'locked':
      return I18n.t('enduser.status_locked')
    case 'error':
      return I18n.t('enduser.card_action_retry')
    default:
      return I18n.t('enduser.card_action_start')
  }
}

// Campaign-wide proctoring covers all; selective proctoring flags only the marked assessments.
const isProctored = (ua: UserAssessment | undefined, options?: ProgramCampaign['campaignOptions']): boolean => {
  if (!options?.proctoringEnabled) return false
  return options.selectiveProctoringEnabled ? Boolean(ua?.proctoringEnabled) : true
}

const toCardModel = (
  ua: UserAssessment,
  locked: boolean,
  options: ProgramCampaign['campaignOptions'],
  step?: ExerciseStep,
): ExerciseCardModel => {
  const status = cardStatus(ua, locked)
  return {
    key: ua.id,
    userAssessment: ua,
    title: ua.assessmentName,
    durationLabel: ua.timing || '',
    status,
    progressPercent: status === 'in_progress' ? ua.completionPercent ?? 0 : undefined,
    proctored: isProctored(ua, options),
    // Poster is the card-cover art; the small icon is a legacy fallback.
    iconUrl: ua.assessmentPosterUrl || ua.assessmentIconUrl || undefined,
    step,
    actionLabel: cardActionLabel(status),
  }
}

const findAssessments = (campaign: ProgramCampaign, ids?: number[]): UserAssessment[] => _.compact(
  (ids || []).map(id => _.find(campaign.userAssessments, { assessmentId: id })),
)

const isAssessmentCenterGroup = (g: CampaignGroup): boolean => g.groupType === 'assessment_center'
const isGatedGroup = (g: CampaignGroup): boolean => Boolean(g.previousGroupRequired || g.previousAssessmentsRequired)

// Best-effort mapping of the legacy assessment-center handling onto the invite callout. The full
// reserve/schedule/InviteDetails flow stays on the legacy detail route.
const mapAssessmentCenter = (
  campaign: ProgramCampaign,
  group: CampaignGroup,
  locked: boolean,
): AssessmentCenterModel | undefined => {
  const assessments = findAssessments(campaign, group.campaignAssessmentIds)
  const first = assessments[0]
  const workshop = (campaign.workshops || []).find(w => w.campaignAssessmentGroupId === group.id)

  let state: AssessmentCenterState = 'invite'
  let timerEndMs: number | undefined
  if (locked) {
    state = 'locked'
  } else if (workshop?.completed || assessments.every(isCompleted)) {
    state = 'done'
  } else if (workshop && !_.isEmpty(workshop)) {
    state = 'reserved'
    if (workshop.startTime) {
      const ms = Date.parse(workshop.startTime)
      if (!Number.isNaN(ms)) timerEndMs = ms
    }
  }

  return {
    groupId: group.id,
    heading: I18n.t('campaign_assessment.assessment_center_heading_label'),
    description: I18n.t('frontend.bookings.accept_invite_msg'),
    name: group.name || first?.assessmentName || I18n.t('campaign_assessment.assessment_center_heading_label'),
    durationLabel: first?.timing || '',
    proctored: isProctored(first, campaign.campaignOptions),
    state,
    timerEndMs,
  }
}

// Within a gated group each card is locked until every preceding card completes; a
// `previousGroupRequired` group is fully locked until the previous group completes.
const mapSequentialCards = (
  campaign: ProgramCampaign,
  group: CampaignGroup,
  groupLocked: boolean,
): ExerciseCardModel[] => {
  const assessments = findAssessments(campaign, group.campaignAssessmentIds)
  let prevCompleted = !groupLocked
  return assessments.map((ua, index) => {
    const locked = groupLocked || !prevCompleted
    const step: ExerciseStep = { index: index + 1, total: assessments.length }
    if (group.previousAssessmentsRequired) {
      prevCompleted = prevCompleted && isCompleted(ua)
    }
    return toCardModel(ua, locked, campaign.campaignOptions, step)
  })
}

export const mapProgramDetails = (campaign: ProgramCampaign): ProgramDetailsModel => {
  const userAssessments = campaign.userAssessments || []
  const groups = campaign.groups || []
  const options = campaign.campaignOptions || {}

  const tone = mapStatusTone(userAssessments, campaign.campaignUser)

  let assessmentCenter: AssessmentCenterModel | undefined
  const sequentialGroups: ExerciseGroupModel[] = []
  const openGroups: ExerciseGroupModel[] = []
  const openCards: ExerciseCardModel[] = []
  const groupedAssessmentIds: number[] = []

  let prevGroupCompleted = true
  let prevGroupName: string | undefined
  groups.forEach((group) => {
    if (group.hide) return
    const assessments = findAssessments(campaign, group.campaignAssessmentIds)
    const groupIds = group.campaignAssessmentIds || []
    groupIds.forEach(id => groupedAssessmentIds.push(id))
    const groupLocked = Boolean(group.previousGroupRequired) && !prevGroupCompleted

    // A gated group explains what unlocks it.
    const lockedHint = groupLocked && prevGroupName
      ? I18n.t('enduser.details_group_locked_hint', { group: prevGroupName })
      : undefined

    if (isAssessmentCenterGroup(group)) {
      if (!assessmentCenter) {
        assessmentCenter = mapAssessmentCenter(campaign, group, groupLocked)
      }
    } else if (isGatedGroup(group)) {
      const cards = mapSequentialCards(campaign, group, groupLocked)
      if (cards.length) {
        sequentialGroups.push({ name: group.name, hint: lockedHint, cards })
      }
    } else {
      const cards = assessments.map(ua => toCardModel(ua, groupLocked, options))
      if (cards.length) {
        openGroups.push({ name: group.name, hint: lockedHint, cards })
      }
    }
    prevGroupCompleted = assessments.length ? assessments.every(isCompleted) : prevGroupCompleted
    prevGroupName = group.name || prevGroupName
  })

  const ungrouped = findAssessments(campaign, campaign.ungroupedAssessmentsIds)
  const orphaned = userAssessments.filter(
    ua => !_.includes(groupedAssessmentIds, ua.assessmentId)
      && !_.includes(campaign.ungroupedAssessmentsIds || [], ua.assessmentId),
  )
  const openAssessments = [...ungrouped, ...orphaned]
  openAssessments.forEach((assessment) => {
    if (!openCards.some(c => c.key === assessment.id)) {
      openCards.push(toCardModel(assessment, false, options))
    }
  })

  const hasIntro = Boolean(options.instructionsEnabled && options.instructions)

  const tabs: { key: ProgramTab; label: string }[] = []
  if (hasIntro) {
    tabs.push({ key: 'intro', label: I18n.t('enduser.details_intro_tab') })
  }
  tabs.push({ key: 'tasks', label: I18n.t('enduser.tasks') })
  tabs.push({ key: 'reports', label: I18n.t('enduser.details_reports_tab') })

  return {
    title: campaign.name || I18n.t('campaign.campaigns'),
    status: { label: statusLabel(tone), tone },
    stats: mapStats(userAssessments),
    dueDate: mapDueDate(campaign.endDate),
    tabs,
    hasIntro,
    instructions: hasIntro ? options.instructions : undefined,
    assessmentCenter,
    sequential: sequentialGroups.length
      ? {
        heading: I18n.t('enduser.details_sequential_heading'),
        hint: I18n.t('enduser.details_sequential_hint'),
        groups: sequentialGroups,
        sequential: true,
      }
      : undefined,
    open: openGroups.length || openCards.length
      ? {
        heading: I18n.t('enduser.details_open_heading'),
        hint: I18n.t('enduser.details_open_hint'),
        groups: openCards.length ? [...openGroups, { cards: openCards }] : openGroups,
      }
      : undefined,
    reportsAvailable: Boolean(campaign.userReportsAvailable),
  }
}

export default mapProgramDetails

export interface UserAssessment {
  id: number
  assessmentId: number
  assessmentCategory: string
  assessmentName: string
  assessmentIconUrl: string | null
  assessmentPosterUrl: string | null
  timing: string
  completionPercent: number | null
  completionReason: string | null
  url: string
  status: string
  type: string
  needConfirm: boolean
  assessmentExtra: AssessmentExtra
  selectedLocale: string
  availableLocales: string[]
  meetingLink: string | null
  prework: boolean
  workshopActivity: boolean | null
  meetingTime: string | null
  scheduleTime: string | null
  workshopActivityDuration: number | null
  requireScheduling: boolean
  cachingEnabled: boolean
  proctoringEnabled: boolean
  isTimed: boolean
  fixedTimeDuration: number | null
  shouldRunAssessmentLevelChecks: boolean
}

export interface AssessmentExtra {
  timer: number | null
  enableNetworkCheck: string | null
  enableAudioCheck: string | null
  enableVideoCheck: string | null
}

export enum Statuses {
  NOT_STARTED = 'not_started',
  COMPLETED = 'completed',
  TIMED_OUT = 'timed_out',
  INELIGIBLE = 'ineligible'
}

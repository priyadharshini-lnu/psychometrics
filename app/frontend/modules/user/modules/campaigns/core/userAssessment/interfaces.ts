export interface UserAssessment {
  id: number
  assessmentId: number
  assessmentCategory: string
  assessmentName: string
  hoganUrl: string
  timing: string
  completionPercent: number | null
  mindmill: boolean
  mindmillUrl: string
  url: string
  status: string
  needConfirm: boolean
  assessmentExtra: AssessmentExtra
}

export interface AssessmentExtra {
  timer: number | null
  enableNetworkCheck: string | null
  enableAudioCheck: string | null
  enableVideoCheck: string | null
}

export enum Statuses {
  NOT_STARTED = 'not_started',
  COMPLETED = 'completed'
}

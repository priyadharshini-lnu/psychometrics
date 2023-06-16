export const USER_ASSESSMENT_WEBHOOK_EVENTS = [
  'assessment_staretd',
  'assessment_completed',
  'assessment_timeout',
]

export enum ParentResourceType {
  UserAssessment = 'user_assessments',
  UserReport = 'user_reports'
}

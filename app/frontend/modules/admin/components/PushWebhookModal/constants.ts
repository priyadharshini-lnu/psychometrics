export const USER_ASSESSMENT_WEBHOOK_EVENTS = [
  'assessment_started',
  'assessment_completed',
  'assessment_timeout',
  'assessment_raw_response',
]

export const CAMPAIGN_WEBHOOK_EVENTS = [
  'campaign_user_status',
  'campaign_results_available',
]

export enum ParentResourceType {
  UserAssessment = 'user_assessments',
  UserReport = 'user_reports',
  CampaignUser = 'users'
}

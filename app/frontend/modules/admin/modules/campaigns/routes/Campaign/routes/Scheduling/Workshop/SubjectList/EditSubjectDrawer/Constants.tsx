const { I18n } = window

export const STATUSES = [
  { label: I18n.t('common.status.not_status'), value: 'no_status' }, // remove use of common.
  { label: I18n.t('common.status.on_time'), value: 'on_time' },
  { label: I18n.t('common.status.no_show'), value: 'no_show' },
  { label: I18n.t('common.status.late'), value: 'late' },
  { label: I18n.t('common.status.dropped_out'), value: 'dropped_out' },
]
export const PROGRESS_STATUSES = {
  not_started: { label: I18n.t('common.status.not_started'), color: 'default' },
  in_progress: { label: I18n.t('common.status.in_progress'), color: 'warning' },
  completed: { label: I18n.t('common.status.completed'), color: 'success' },
}

export enum ASSESSMENT_SOURCE {
  ASSESSOR_USER_ASSESSMENT = 'assessorUserAssessments',
  CAMPAIGN_ASSESSOR_ASSESSMENTS = 'campaignAssessorAssessments',
}

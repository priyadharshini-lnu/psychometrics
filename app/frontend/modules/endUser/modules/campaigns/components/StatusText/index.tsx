
import { FC } from 'react'
import { Typography } from 'antd'

const { Text } = Typography
const { I18n } = window
const STATUSES = {
  not_started: { label: I18n.t('campaign_assessment.statuses.not_started'), textType: 'secondary' },
  timed_out: { label: I18n.t('campaign_assessment.statuses.timed_out'), textType: 'secondary' },
  in_progress: { label: I18n.t('campaign_assessment.statuses.in_progress'), textType: 'warning' },
  interrupted: { label: I18n.t('campaign_assessment.statuses.in_progress'), textType: 'warning' },
  completed: { label: I18n.t('campaign_assessment.statuses.completed'), textType: 'success' },
  cancelled: { label: I18n.t('frontend.workshop_invited_subjects.statuses.cancelled'), textType: 'secondary' },
  requested_cancellation: {
    label: I18n.t('frontend.workshop_invited_subjects.statuses.requested_cancellation'),
    textType: 'secondary',
  },
  requested_rescheduling: {
    label: I18n.t('frontend.workshop_invited_subjects.statuses.requested_rescheduling'),
    textType: 'secondary',
  },
}

type StatusTextProps = {
  taskStatus: string
}

export const StatusText: FC<StatusTextProps> = ({ taskStatus }) => {
  const statusData = STATUSES[`${taskStatus}`] || {}
  return (
    <Text type={statusData.textType}>{statusData.label}</Text>
  )
}

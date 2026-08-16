import { FC, ReactNode } from 'react'
import {
  Button, ActivityCard, Tag, Typography, useDirection,
} from '@thetalententerprise/glint'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from '@thetalententerprise/glint/icons'
import { useStartCampaignActivity } from '~/modules/endUser/modules/campaigns/hooks/useStartCampaignActivity'
import type { ExerciseCardModel, ExerciseStatus } from './mapProgramDetails'

const { I18n } = window

// Progress-row status per state (colors via Text types / token references only).
const progressStatusNode = (model: ExerciseCardModel): ReactNode => {
  const pct = model.userAssessment.completionPercent ?? 0
  switch (model.status) {
    case 'completed':
      return (
        <Typography.Text type="success" strong>
          {I18n.t('campaign_assessment.statuses.completed')}
        </Typography.Text>
      )
    case 'in_progress':
      return (
        <Typography.Text strong style={{ color: 'var(--ant-color-info)' }}>
          {I18n.t('enduser.details_percent_done', { percent: pct })}
        </Typography.Text>
      )
    case 'locked':
      return <Typography.Text type="secondary" strong>{I18n.t('enduser.status_locked')}</Typography.Text>
    case 'error':
      return <Typography.Text type="danger" strong>{I18n.t('enduser.card_action_retry')}</Typography.Text>
    default:
      return (
        <Typography.Text strong>
          {I18n.t('campaign_assessment.statuses.not_started')}
        </Typography.Text>
      )
  }
}

const progressValue = (model: ExerciseCardModel): number => (
  model.status === 'completed' ? 100 : model.userAssessment.completionPercent ?? 0
)

const PROGRESS_COLOR: Partial<Record<ExerciseStatus, string>> = {
  completed: 'var(--ant-color-success)',
}

// One Folio exercise card. Owns its own `useStartCampaignActivity` hook (hooks can't run
// inside a `.map`), preserving the exact legacy begin/continue navigation. Locked cards
// don't navigate; their footer shows the lock note instead of a CTA.
export const ExerciseCardItem: FC<{ model: ExerciseCardModel }> = ({ model }) => {
  const { start } = useStartCampaignActivity(model.userAssessment)
  const locked = model.status === 'locked'
  const onAction = locked ? undefined : start
  // Standalone arrow glyphs don't mirror in RTL — pick the direction-appropriate icon.
  const forwardIcon = useDirection() === 'rtl' ? <ArrowLeftOutlined /> : <ArrowRightOutlined />

  const proctoredTag = model.proctored ? (
    <Tag color="geekblue">{I18n.t('enduser.proctored')}</Tag>
  ) : null

  const action = locked ? (
    <Typography.Text type="secondary" strong>
      <LockOutlined />
      {' '}
      {I18n.t('enduser.status_locked')}
    </Typography.Text>
  ) : (
    <Button
      color="primary"
      variant={model.status === 'completed' ? 'outlined' : 'solid'}
      icon={model.status === 'completed' ? undefined : forwardIcon}
      iconPlacement="end"
      onClick={onAction}
    >
      {model.actionLabel}
    </Button>
  )

  return (
    <ActivityCard
      coverSrc={model.iconUrl}
      coverAlt={model.title}
      coverSeed={model.title}
      coverMuted={locked}
      coverStart={proctoredTag}
      coverEnd={(() => {
        if (locked) return <Tag><LockOutlined /></Tag>
        if (model.status === 'completed') return <Tag color="green"><CheckOutlined /></Tag>
        return null
      })()}
      title={model.title}
      progressLabel={I18n.t('enduser.details_progress')}
      progressStatus={progressStatusNode(model)}
      progress={progressValue(model)}
      progressColor={PROGRESS_COLOR[model.status]}
      meta={model.durationLabel ? (
        <Typography.Text>
          <ClockCircleOutlined />
          {' '}
          {model.durationLabel}
        </Typography.Text>
      ) : null}
      action={action}
      onClick={onAction}
    />
  )
}

export default ExerciseCardItem

import React, { useState } from 'react'
import { Avatar, Row, Col } from 'antd'
import { useHistory } from 'react-router-dom'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { shortify } from '~/utils/string'
import { DetailsCard } from '~/glint'

import styles from './styles.less'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  view: string
  disabled: boolean
  campaignNotStarted: boolean
  prevCompleted: boolean
}

export const AssessmentCard: React.FC<Props> = ({
  userAssessment,
  view,
  disabled,
  prevCompleted,
  campaignNotStarted,
}) => {
  const {
    status, assessmentIconUrl, assessmentName, completionPercent, timing,
  } = userAssessment
  let taskStatus = status
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  let actionDisabledText = ''
  if (!prevCompleted) {
    actionDisabledText = I18n.t('campaign.complete_prev')
  }
  if (campaignNotStarted) {
    actionDisabledText = I18n.t('campaign.begin_campaign_msg')
  }

  const buttonTextData = {
    in_progress: I18n.t('assessments.card_actions.continue'),
    completed: '',
    not_started: I18n.t('assessments.card_actions.begin'),
    timed_out: '',
    interrupted: I18n.t('assessments.card_actions.continue'),
  }

  const loadAssessment = ({ id }) => {
    setLoading(true)
    history.push(`/user_assessments/${id}`)
  }

  const iconUrl = assessmentIconUrl
  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} />
  ) : (
    <Avatar
      className={styles.titleAvatar}
    >
      {shortify(assessmentName)}
    </Avatar>
  )

  if (completionPercent === 100) {
    taskStatus = 'completed'
  }
  const statusElement = <StatusText taskStatus={taskStatus} />
  const titleElement = (
    <Row wrap={false}>
      <Col>{assessmentIcon}</Col>
      <Col className={styles.assessmentLabel}>
        <span>
          <TruncatedTitle title={assessmentName} />
        </span>
      </Col>
    </Row>
  )

  return (
    <>
      <DetailsCard
        status={statusElement}
        showStatusAtTop={view === 'list'}
        title={titleElement}
        progressPercentage={completionPercent || 0}
        buttonText={buttonTextData[status]}
        actionDisabled={disabled}
        actionLoading={loading}
        actionDisabledText={actionDisabledText}
        onButtonClick={() => loadAssessment(userAssessment)}
        subtitle={timing && <TimerText text={timing} />}
      />
    </>
  )
}

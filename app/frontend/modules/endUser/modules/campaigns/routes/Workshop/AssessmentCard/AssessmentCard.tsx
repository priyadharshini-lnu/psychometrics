import React, { FC, useState } from 'react'
import {
  Avatar, Row, Col,
} from 'antd'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { DetailsCard } from '~/glint'
import styles from './styles.less'
import { shortify } from '~/utils/string'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { Subtitle } from './Subtitle'

const { I18n } = window

interface Props {
  assessment: {
    id: string,
    assessmentName: string,
    status: string,
    iconUrl: string,
    workshopActivityDuration: number
    completionPercent: number,
    scheduleTime: string,
    prework: boolean,
  },
  view: string,
  workshop: {
    attended: boolean,
  }
}

export const AssessmentCard: FC<Props> = ({ assessment, view, workshop }) => {
  const [loading, setLoading] = useState(false)
  let defaultCardDisabled = false
  if (assessment.prework) {
    defaultCardDisabled = false
  } else if (!workshop.attended) {
    defaultCardDisabled = true
  } else if (!assessment.scheduleTime) {
    defaultCardDisabled = true
  } else if (assessment.scheduleTime) {
    defaultCardDisabled = moment().isBefore(moment(assessment.scheduleTime))
  }
  const [cardActionDisabled, setCardActionDisabled] = useState(defaultCardDisabled)

  const history = useHistory()
  const loadAssessment = ({ id }) => {
    setLoading(true)
    history.push(`/user_assessments/${id}`)
  }

  const buttonTextData = {
    in_progress: I18n.t('assessments.card_actions.continue'),
    completed: '',
    not_started: I18n.t('assessments.card_actions.begin'),
    timed_out: '',
    interrupted: I18n.t('assessments.card_actions.continue'),
  }

  return (
    <>
      <DetailsCard
        status={<StatusText taskStatus={assessment.status} />}
        showStatusAtTop={view === 'list'}
        title={(
          <Row wrap={false}>
            <Col>
              {assessment.iconUrl ? (
                <Avatar src={assessment.iconUrl} />
              ) : (
                <Avatar className={styles.avatar}>{shortify(assessment.assessmentName)}</Avatar>
              )}
            </Col>
            <Col>
              <span><TruncatedTitle title={assessment.assessmentName} /></span>
            </Col>
          </Row>
        )}
        progressPercentage={assessment.completionPercent || 0}
        buttonText={buttonTextData[assessment.status]}
        actionLoading={loading}
        onButtonClick={() => loadAssessment(assessment)}
        actionDisabled={cardActionDisabled}
        actionDisabledText={
          assessment.scheduleTime ? I18n.t('campaign.workshops.not_started_button')
            : I18n.t('campaign.workshops.not_scheduled_button')
        }
        subtitle={
          assessment.prework ? null : (
            <Subtitle
              setCardActionDisabled={setCardActionDisabled}
              assessment={assessment}
              workshop={workshop}
            />
          )
        }
      />
    </>
  )
}

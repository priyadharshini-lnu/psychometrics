import React from 'react'
import { Col } from 'antd'
import { useHistory } from 'react-router-dom'
import _ from 'lodash'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/user/modules/campaigns/common/assessments'

import { TimerText } from 'modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from 'modules/endUser/modules/campaigns/components/StatusText'
import { DetailsCard, ViewMoreText } from 'glint'

import styles from './styles.less'

const { I18n } = window

export const Common = ({ campaign }) => {
  const history = useHistory()

  const handleClick = () => {
    history.push(`/campaigns/${campaign.id}`)
  }

  const handleSecondaryBtnClick = () => {
    history.push(`/campaigns/${campaign.id}/insights`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles['campaign-container-card']}>
      <DetailsCard
        title={_.truncate(campaign.name, { length: ASSESSMENT_TITLE_MAX_LENGTH })}
        status={<StatusText taskStatus={campaign.progressStatus} />}
        subtitle={campaign.timing && <TimerText text={campaign.timing} />}
        description={campaign.description && <ViewMoreText maxTextLen={200} text={campaign.description} />}
        buttonText={I18n.t('campaign.dashboard_menu.tasks')}
        onButtonClick={handleClick}
        secondaryBtnText={campaign.userReportsAvailable && I18n.t('campaign.insights_reports')}
        onSecondaryBtnClick={handleSecondaryBtnClick}
      />
    </Col>
  )
}

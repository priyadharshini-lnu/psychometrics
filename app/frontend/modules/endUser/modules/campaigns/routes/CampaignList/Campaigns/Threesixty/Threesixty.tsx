import _ from 'lodash'
import React from 'react'
import round from 'lodash/round'
import { Col } from 'antd'
import { useHistory } from 'react-router-dom'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/endUser/modules/campaigns/common/assessments'

import { TimerText } from 'modules/endUser/modules/campaigns/components/TimerText'
import { DetailsCard } from 'glint'
import { getTotalProgress } from 'modules/endUser/modules/campaigns/core/campaign/selectors'
import styles from './styles.less'

const { I18n } = window

export const Threesixty = ({ campaign }) => {
  const history = useHistory()
  const totalProgress = round(getTotalProgress(campaign))

  const handleClick = () => {
    history.push(`/threesixty_campaigns/${campaign.id}`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles.campaignCard}>
      <DetailsCard
        title={_.truncate(campaign.assessmentName, { length: ASSESSMENT_TITLE_MAX_LENGTH })}
        subtitle={campaign.timing && <TimerText text={campaign.timing} />}
        progressPercentage={totalProgress}
        // description={campaign.details}
        /* buttonText will be dynnamic in future based on progress status */
        buttonText={I18n.t('campaign.details')}
        handleButtonClick={handleClick}
      />
    </Col>
  )
}

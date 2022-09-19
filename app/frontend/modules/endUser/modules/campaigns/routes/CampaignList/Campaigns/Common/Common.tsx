import React from 'react'
import { Col } from 'antd'
import { useHistory } from 'react-router-dom'
import _ from 'lodash'
import round from 'lodash/round'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/user/modules/campaigns/common/assessments'

import { TimerText } from 'modules/endUser/modules/campaigns/components/TimerText'
import { DetailsCard } from 'glint'

import styles from './styles.less'

const { I18n } = window

export const Common = ({ campaign }) => {
  const history = useHistory()
  const totalProgress = round(campaign.completionPercentage)

  const handleClick = () => {
    history.push(`/campaigns/${campaign.id}`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles['campaign-container-card']}>
      <DetailsCard
        title={_.truncate(campaign.name, { length: ASSESSMENT_TITLE_MAX_LENGTH })}
        subtitle={campaign.timing && <TimerText text={campaign.timing} />}
        progressPercentage={totalProgress}
        description={campaign.description}
        /* buttonText will be dynnamic in future based on progress status */
        buttonText={I18n.t('campaign.details')}
        handleButtonClick={handleClick}
      />
    </Col>
  )
}

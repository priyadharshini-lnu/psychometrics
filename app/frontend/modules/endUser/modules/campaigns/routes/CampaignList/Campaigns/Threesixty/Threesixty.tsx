import round from 'lodash/round'
import { Col } from 'antd'
import { useHistory } from 'react-router-dom'

import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { getTotalProgress } from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import { DetailsCard } from '~/glint'
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
        title={<TruncatedTitle title={campaign.assessmentName} />}
        subtitle={campaign.timing && <TimerText text={campaign.timing} />}
        progressPercentage={totalProgress}
        buttonText={I18n.t('campaign.details')}
        onButtonClick={handleClick}
      />
    </Col>
  )
}

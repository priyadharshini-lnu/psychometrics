import round from 'lodash/round'
import { Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { getTotalProgress } from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import { DetailsCard } from '~/glint'
import styles from './styles.less'
import { StartsInTimer } from '../StartsInTimer'

const { I18n } = window

export const Threesixty = ({
  campaign, fetchCampaigns, campaignDisabled, scheduledForFuture,
}) => {
  const navigate = useNavigate()
  const totalProgress = round(getTotalProgress(campaign))

  const handleClick = () => {
    navigate(`/threesixty_campaigns/${campaign.id}`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles.campaignCard}>
      <DetailsCard
        title={<TruncatedTitle title={campaign.assessmentName} />}
        subtitle={
          <StartsInTimer campaign={campaign} fetchCampaigns={fetchCampaigns} scheduledForFuture={scheduledForFuture} />
        }
        progressPercentage={totalProgress}
        buttonText={I18n.t('campaign.details')}
        onButtonClick={handleClick}
        actionDisabled={campaignDisabled}
      />
    </Col>
  )
}

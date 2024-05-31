import { Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { DetailsCard, ViewMoreText } from '~/glint'

import styles from './styles.less'
import { StartsInTimer } from '../StartsInTimer'

const { I18n } = window

export const Common = ({
  campaign, fetchCampaigns, campaignDisabled, scheduledForFuture,
}) => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(`/campaigns/${campaign.id}`)
  }

  const handleSecondaryBtnClick = () => {
    navigate(`/campaigns/${campaign.id}/insights`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles['campaign-container-card']}>
      <DetailsCard
        title={<TruncatedTitle title={campaign.name} />}
        status={<StatusText taskStatus={campaign.progressStatus} />}
        subtitle={
          <StartsInTimer campaign={campaign} fetchCampaigns={fetchCampaigns} scheduledForFuture={scheduledForFuture} />
        }
        description={campaign.description && <ViewMoreText maxTextLen={200} text={campaign.description} />}
        buttonText={I18n.t('campaign.dashboard_menu.tasks')}
        buttonAriaDescription={I18n.t('frontend.aria.campaign_name_description', { campaignName: campaign.name })}
        onButtonClick={handleClick}
        actionDisabled={campaignDisabled}
        secondaryBtnText={campaign.userReportsAvailable && I18n.t('campaign.insights_reports')}
        secondaryBtnAriaDescription={I18n.t('frontend.aria.campaign_name_description', { campaignName: campaign.name })}
        onSecondaryBtnClick={handleSecondaryBtnClick}
      />
    </Col>
  )
}

import { Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { DetailsCard, ViewMoreText } from '~/glint'
import { RootState } from '~/modules/endUser/core/rootReducers'
import styles from './styles.less'
import { StartsInTimer } from '../StartsInTimer'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'

const { I18n } = window

export const Common = ({
  campaign, fetchCampaigns, campaignDisabled, scheduledForFuture,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const titleId = `campaign-card-title-${campaign.id}`

  const isSystemCheckEnabled = useSelector(
    (state: RootState) => state.campaigns.systemCheck.campaignList[campaign.id]?.isSystemCheckEnabled,
  )

  const isSystemCheckValid = useSelector(
    (state: RootState) => state.campaigns.systemCheck.campaignList[campaign.id]?.systemCheckStatus?.isValid,
  )

  const isCampaignCompleted = campaign.progressStatus === 'completed'

  const handleClickForReadinessCheck = () => {
    dispatch(actions.setCampaignDetailsForSystemCheck(campaign))
    navigate(`/campaign_system_check/${campaign.id}/welcome`)
  }

  const handleClick = () => {
    navigate(`/campaigns/${campaign.id}`)
  }

  const handleSecondaryBtnClick = () => {
    navigate(`/campaigns/${campaign.id}/insights`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles['campaign-container-card']}>
      <DetailsCard
        title={<TruncatedTitle id={titleId} title={campaign.name} />}
        titleId={titleId}
        titleHeadingLevel={3}
        status={<StatusText taskStatus={campaign.progressStatus} />}
        subtitle={
          <StartsInTimer campaign={campaign} fetchCampaigns={fetchCampaigns} scheduledForFuture={scheduledForFuture} />
        }
        description={campaign.description && <ViewMoreText maxTextLen={200} text={campaign.description} />}
        buttonText={I18n.t('campaign.dashboard_menu.tasks')}
        buttonId={`campaign-card-btn-${campaign.id}`}
        onButtonClick={handleClick}
        actionDisabled={campaignDisabled}
        secondaryBtnText={campaign.userReportsAvailable && I18n.t('campaign.insights_reports')}
        secondaryBtnId={`campaign-card-sec-btn-${campaign.id}`}
        onSecondaryBtnClick={handleSecondaryBtnClick}
        showReadinessCheck={isSystemCheckEnabled && !isSystemCheckValid && !isCampaignCompleted}
        onReadinessCheckClick={handleClickForReadinessCheck}
      />
    </Col>
  )
}

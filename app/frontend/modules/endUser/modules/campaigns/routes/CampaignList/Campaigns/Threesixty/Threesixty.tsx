import round from 'lodash/round'
import { Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { getTotalProgress } from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import { DetailsCard } from '~/glint'
import styles from './styles.less'
import { StartsInTimer } from '../StartsInTimer'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'

const { I18n } = window

export const Threesixty = ({
  campaign, fetchCampaigns, campaignDisabled, scheduledForFuture,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const totalProgress = round(getTotalProgress(campaign))

  const handleClick = () => {
    navigate(`/threesixty_campaigns/${campaign.id}`)
  }

  const titleId = `360camp-card-title-${campaign.id}`

  const isSystemCheckEnabled = useSelector(
    (state: RootState) => state.campaigns.systemCheck.campaignList[campaign.id]?.isSystemCheckEnabled,
  )

  const isSystemCheckValid = useSelector(
    (state: RootState) => state.campaigns.systemCheck.campaignList[campaign.id]?.systemCheckStatus?.isValid,
  )

  const isCampaignCompleted = campaign.progressStatus === 'completed'

  const handleClickForReadinessCheck = () => {
    dispatch(actions.setCampaignDetailsForSystemCheck(campaign))
    navigate(`/campaign_system_check/${campaign.campaignId}/welcome`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles.campaignCard}>
      <DetailsCard
        title={<TruncatedTitle id={titleId} title={campaign.assessmentName} />}
        titleHeadingLevel={3}
        titleId={titleId}
        subtitle={
          <StartsInTimer campaign={campaign} fetchCampaigns={fetchCampaigns} scheduledForFuture={scheduledForFuture} />
        }
        progressLabelAria={I18n.t('frontend.aria.task_progress_label')}
        progressPercentage={totalProgress}
        buttonText={I18n.t('campaign.details')}
        buttonId={`360-camp-card-btn-${campaign.id}`}
        onButtonClick={handleClick}
        actionDisabled={campaignDisabled}
        showReadinessCheck={isSystemCheckEnabled && !isSystemCheckValid && !isCampaignCompleted}
        onReadinessCheckClick={handleClickForReadinessCheck}
      />
    </Col>
  )
}

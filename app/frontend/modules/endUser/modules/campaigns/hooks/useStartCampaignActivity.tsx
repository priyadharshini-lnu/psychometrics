import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useApp, Typography } from '@thetalententerprise/glint'
import { InfoCircleFilled } from '@thetalententerprise/glint/icons'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { SafeHTML } from '~/components/SafeHTML'
import { setCampaignUser } from '~/modules/endUser/modules/campaigns/core/campaign'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncRequestResponseTR,
  AsyncRequestResponse,
} from '~/modules/admin/modules/client/core/asyncRequestResponse'
import { useIsProctored } from '~/hooks/useProctoringState'
import { useDeviceDetection } from '~/hooks/useDeviceDetection'

const { I18n } = window

const isCampaignSystemCheckValid = (
  lastSuccessfulCheckAt: number,
  systemCheckValidity: number,
) => {
  const campaignSystemCheckExpiryTime = lastSuccessfulCheckAt + systemCheckValidity
  return campaignSystemCheckExpiryTime > (Date.now() / 1000)
}

// Shared begin/continue navigation for a campaign exercise. Handles system-check redirect,
// examus sessions, prework gating and the start/mobile-proctoring modals — not a raw
// navigate. Caller owns enabled/locked gating.
export const useStartCampaignActivity = (userAssessment: UserAssessment) => {
  const campaign = useSelector((state: RootState) => state.campaigns.campaign)
  const {
    campaignUser, isTimedCampaign, fixedTimed, campaignTime, lastSuccessfulCheckAt,
    campaignOptions: {
      proctoringEnabledOnWorkshopActivity, integrationType, enableMobileProctoring,
      selectiveProctoringEnabled, proctoringEnabled, systemCheckEnabled, systemCheckValidity,
    },
  } = campaign

  const { id, prework } = userAssessment

  const { isProctored } = useIsProctored()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { message, modal } = useApp()
  const dispatch = useDispatch()
  const { isMobileDevice } = useDeviceDetection()
  const isWorkshopActivity = userAssessment.workshopActivity

  const hasStartedCampaign = !!campaignUser.startedAt && campaignUser.status !== 'not_started'
  const campaignUserTimedOut = campaignUser.status === 'timed_out'
  const isCampaignInterrupted = campaignUser.status === 'interrupted'
  const campaignClosed = campaign.status === 'closed'
  const campaignClosedForUser = campaignClosed
    || campaignUserTimedOut || (isTimedCampaign && campaignUser.status === 'completed')
  const hasNoExpiryDateForTimedCampaign = isTimedCampaign && !campaignUser?.expiryDate
    && campaignUser.status === 'in_progress'
  const campaignLevelProctoringEnabled = proctoringEnabled && !selectiveProctoringEnabled
  const campaignNeedsProctoring = isWorkshopActivity
    ? (proctoringEnabled && proctoringEnabledOnWorkshopActivity && !isProctored)
    : (campaignLevelProctoringEnabled && !isProctored)

  const canBeginCampaign = !campaignClosedForUser && !hasStartedCampaign
    && fixedTimed && !isCampaignInterrupted

  const canContinueCampaign = (isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
    && !campaignClosedForUser && !campaignUserTimedOut && fixedTimed

  const asyncUrl = canBeginCampaign
    ? `/campaign_users/${campaignUser.id}/begin_campaign`
    : `/campaign_users/${campaignUser.id}/continue_campaign`

  const {
    makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: asyncUrl,
    data: { id: campaignUser.id, continue_without_proctoring: !campaignNeedsProctoring },
    responseType: AsyncRequestResponseTR,
  })

  const campaignStartInstruction = () => {
    const messages = isTimedCampaign && campaignTime
      ? [I18n.t('campaign.instruction_modal.campaign_start_instruction', { minutes: campaignTime })] : []
    if (campaignNeedsProctoring) {
      messages.push(I18n.t('campaign.instruction_modal.common_proctoring_instructions'))
      integrationType === 'ldb' && messages.push(I18n.t('campaign.instruction_modal.lockdown_browser_instruction'))
    }

    messages.push(I18n.t('campaign.instruction_modal.campaign_start_final_instructions'))

    return (
      messages.map(message => <Typography.Paragraph><SafeHTML html={message} /></Typography.Paragraph>)
    )
  }

  const navigateToAssessment = () => {
    setLoading(true)
    navigate(`/user_assessments/${id}`)
  }

  const startCampaignActivities = async (shouldNavigate = true) => {
    try {
      const { responseData } = await makeAsyncRequest()
      const { examusSessionUrl } = responseData

      if (campaignLevelProctoringEnabled && examusSessionUrl) {
        window.location.href = examusSessionUrl
      } else {
        dispatch(setCampaignUser(responseData))
        if (shouldNavigate) {
          navigateToAssessment()
        }
      }
    } catch (error) {
      message.error(error)
      throw error
    }
  }

  const showCampaignStartModal = () => {
    modal.info({
      icon: false,
      title: null,
      content: campaignStartInstruction(),
      okText: I18n.t('common.actions.start'),
      closable: true,
      width: 600,
      async onOk () {
        if (campaignNeedsProctoring || canBeginCampaign || canContinueCampaign) {
          await startCampaignActivities(true)
        }
      },
    })
  }

  const start = () => {
    if (systemCheckEnabled
      && !isCampaignSystemCheckValid(lastSuccessfulCheckAt, systemCheckValidity)) {
      navigate(`/campaign_system_check/${campaign.id}/welcome`)
      return
    }
    const needToBeginOrContinueCampaign = (canBeginCampaign || canContinueCampaign) && !prework
    if (
      (isWorkshopActivity && proctoringEnabledOnWorkshopActivity && isProctored)
      || (!needToBeginOrContinueCampaign && (!campaignNeedsProctoring || prework))
    ) {
      return navigateToAssessment()
    }
    if (isMobileDevice && proctoringEnabled) {
      if (enableMobileProctoring) {
        modal.confirm({
          icon: <InfoCircleFilled style={{ color: 'var(--ant-color-info)' }} />,
          title: I18n.t('shared.desktop_or_laptop_recommended'),
          content: (
            <Typography.Paragraph>
              <SafeHTML html={I18n.t('shared.mobile_proctoring_enabled_instructions')} />
            </Typography.Paragraph>
          ),
          closable: true,
          width: 600,
          okText: I18n.t('common.actions.continue'),
          cancelText: I18n.t('shared.switch_to_laptop_or_desktop'),
          cancelButtonProps: { color: 'primary', variant: 'outlined' },
          onOk: () => showCampaignStartModal(),
        })
      } else {
        modal.info({
          icon: false,
          title: I18n.t('shared.desktop_or_laptop_required'),
          content: (
            <Typography.Paragraph>
              <SafeHTML html={I18n.t('shared.mobile_proctoring_disabled_instructions')} />
            </Typography.Paragraph>
          ),
          closable: true,
          width: 600,
        })
      }
    } else {
      showCampaignStartModal()
    }

    return null
  }

  return { start, loading }
}

export default useStartCampaignActivity

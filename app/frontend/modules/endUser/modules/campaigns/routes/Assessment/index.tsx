import {
  useEffect, FC, useState, useRef,
} from 'react'
import { connect, ConnectedProps, useDispatch } from 'react-redux'
import {
  useNavigate, useParams, useSearchParams, useLocation,
} from 'react-router-dom'
import {
  Col, Space, Layout, Button, App, Typography,
} from 'antd'
import { PageHeader } from '@ant-design/pro-components'
import {
  PageHeader as GlintPageHeader, CountdownTimer, FontsizeModifier, DirectionalNavigateBackIcon,
} from '~/glint'
import { SafeHTML } from '~/components/SafeHTML'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import { ClockCircleOutlined, InfoCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import WizardIsRequired from '~/modules/endUser/core/WizardIsRequired'
import { PrivacyConsent } from './PrivacyConsent'
import { LanguageSelection } from './LanguageSelection'
import { HoganStep } from './HoganStep'
import { ExternalAssessment } from './ExternalAssessment'
import { LTIAssessment } from './LTIAssessment'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import {
  fetchUserAssessment,
} from '~/modules/endUser/modules/campaigns/core/userAssessment'
import { isConnected } from '~/core/connection'
import { getProgress, substituteTextWithPipedData } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CheckingWizard } from '../CheckingWizard'
import { InstructionsComponent } from '~/modules/survey/views/Preview/Instructions'
import { secondsLeftFromNow } from '~/utils/time'
import { useIsProctored } from '~/hooks/useProctoringState'
import { AsyncRequestResponse, AsyncRequestResponseTR } from '~/modules/admin/modules/client/core/asyncRequestResponse'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import { setCampaignUser } from '~/modules/endUser/modules/campaigns/core/campaign'
import { useDeviceDetection } from '~/hooks/useDeviceDetection'
import { protectContent } from '~/utils/contentProtection'

import styles from './UserAssessment.less'

const { Content } = Layout

const connector = connect((state: RootState) => ({
  userAssessment: state.campaigns.userAssessment,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
  started: state.preview.started,
  isDisconnected: !isConnected(state),
}),
{
  fetchUserAssessment,
})

type Params = {
  userAssessmentId: string
}
type PropsFromRedux = ConnectedProps<typeof connector>
type UserAssessmentProps = PropsFromRedux

const { I18n } = window

const UserAssessmentComponent: FC<UserAssessmentProps> = ({
  userAssessment: {
    userAssessmentData,
    userAssessmentData: {
      assessmentId,
      id: userAssessmentId,
      selectedLocale,
      availableLocales,
      privacyConsentRequired,
      instructions,
      startedAt: assessmentStartedAt,
      assessmentExtra,
      assessmentName,
      currentCampaignExpiryDate,
      piped_text_mapping: pipedTextMapping,
      localeData,
      selectiveProctoringEnabled,
      proctoringIntegrationType: integrationType,
      enableMobileProctoring,
    },
  },
  isDisconnected,
  fetchUserAssessment,
}) => {
  const navigate = useNavigate()
  const params = useParams() as Params
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [showPolicyAccept, setShowPolicy] = useState(true)
  const [locale, setLocale] = useState(localeData?.code)
  const [dataAvailable, setDataAvailable] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const instructionsContainerRef = useRef<HTMLDivElement | null>(null)
  const dispatch = useDispatch()
  const { message, modal } = App.useApp()
  const assessmentTimer = assessmentExtra?.timer
  const remainingCampaignTime = currentCampaignExpiryDate ? secondsLeftFromNow(currentCampaignExpiryDate) : null
  const { isProctored } = useIsProctored()
  const { isMobileDevice } = useDeviceDetection()
  const assessmentNeedsProctoring = selectiveProctoringEnabled && !isProctored
  const insideSelectiveProctoringSession = selectiveProctoringEnabled && isProctored
  const isCopyEnabled = assessmentExtra?.enable_copy_content === true

  useEffect(() => {
    const lang = searchParams.get('lang') || localeData?.code || I18n.currentLocale()
    fetchUserAssessment(params.userAssessmentId, undefined, lang).then(() => {
      setDataAvailable(true)
    })
  }, [])

  useEffect(() => {
    // Proctored sessions handle their own content restrictions, via the proctoring layer.
    const shouldProtectInstructions = dataAvailable
      && showInstructions
      && !insideSelectiveProctoringSession
      && ((instructions && instructions.enabled) || (assessmentTimer && !assessmentStartedAt))
      && !isCopyEnabled

    if (!instructionsContainerRef.current || !shouldProtectInstructions) return

    return protectContent(() => instructionsContainerRef.current)
  }, [
    assessmentStartedAt,
    assessmentTimer,
    dataAvailable,
    insideSelectiveProctoringSession,
    instructions,
    isCopyEnabled,
    showInstructions,
  ])

  const proctoredAssessmentStartInstruction = () => {
    const messages = [I18n.t('campaign.instruction_modal.common_proctoring_instructions')]
    integrationType === 'ldb' && messages.push(I18n.t('campaign.instruction_modal.lockdown_browser_instruction'))
    return messages.map(message => <Typography.Paragraph><SafeHTML html={message} /></Typography.Paragraph>)
  }


  const backToCampaign = () => {
    navigate(`/campaigns/${userAssessmentData.campaignId}`)
  }

  const assessmentUrl = ({ url }, lang) => {
    const params = new URLSearchParams(`lang=${lang}`)
    return `${url}?${params.toString()}`
  }

  const assessmentAsyncUrl = `/user_assessments/${userAssessmentId}/proctoring_session`

  const {
    makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: assessmentAsyncUrl,
    data: { id: userAssessmentId },
    responseType: AsyncRequestResponseTR,
  })

  const startAssessment = async () => {
    try {
      const { responseData } = await makeAsyncRequest()
      const { examusSessionUrl } = responseData || {}

      if (examusSessionUrl) {
        window.location.href = examusSessionUrl
      } else {
        dispatch(setCampaignUser(responseData))
      }
    } catch (error) {
      message.error(error)
    }
  }

  const showProctoredAssessmentStartModal = () => {
    modal.info({
      icon: false,
      title: null,
      content: proctoredAssessmentStartInstruction(),
      okText: I18n.t('common.actions.start'),
      closable: true,
      width: 600,
      async onOk () {
        await startAssessment()
      },
    })
  }

  const showMobileProctoringInfoModal = () => {
    if (enableMobileProctoring) {
      return modal.confirm({
        icon: <InfoCircleFilled />,
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
        onOk: () => showProctoredAssessmentStartModal(),
      })
    }
    return modal.info({
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

  const handleBeginAssessment = (): void | Promise<void> => {
    if (assessmentNeedsProctoring) {
      isMobileDevice ? showMobileProctoringInfoModal() : showProctoredAssessmentStartModal()
    } else if (!assessmentStartedAt && !WizardIsRequired.run(
      userAssessmentData.assessmentExtra,
      userAssessmentId,
      userAssessmentData.shouldRunAssessmentLevelChecks,
    )) {
      const beginLink = `/user_assessments/${userAssessmentId}/begin${location.search}`
      window.location.href = beginLink
    } else {
      setShowInstructions(false)
    }
  }

  if (!dataAvailable) { return <PageContentSkeleton /> }


  if (showPolicyAccept && privacyConsentRequired && !insideSelectiveProctoringSession) {
    return (
      <PrivacyConsent
        onAccept={() => setShowPolicy(false)}
        assessmentCustomConsentText={userAssessmentData.customConsentText}
        assessmentCustomAcknowledgmentText={userAssessmentData.customAcknowledgmentText}
        isDataController={userAssessmentData.isDataController}
        assessmentCustomConsentPolicyVersion={userAssessmentData.customConsentPolicyVersion}
        campaignId={userAssessmentData.campaignId}
        assessmentId={userAssessmentData.assessmentId}
      />
    )
  }


  if (showInstructions && !insideSelectiveProctoringSession
    && ((instructions && instructions.enabled) || (assessmentTimer && !assessmentStartedAt))) {
    return (
      <>
        <title>{`${assessmentName || ''} - ${I18n.t('frontend.lighthouse_app')}`}</title>
        <GlintPageHeader>
          <Col offset={4} span={16} className="ta-c">
            <Space align="center" size="large">
              {remainingCampaignTime && (
                <CountdownTimer
                  shouldAnnounceRemainingTime
                  prefix={(
                    <>
                      {I18n.t('user_assessments.timer_title.campaign')}
                      {': '}
                      <ClockCircleOutlined />
                    </>
                    )}
                  seconds={remainingCampaignTime}
                />
              )}
            </Space>
          </Col>
          <Col span={4} className="ta-e text-nowrap">
            <Space>
              <FontsizeModifier />
              {availableLocales
                    && availableLocales.length > 1
                    && (
                      <LangDropdownWithChangeUrl
                        currentLocale={localeData?.code}
                        locales={availableLocales || []}
                      />
                    )
                  }
            </Space>
          </Col>
        </GlintPageHeader>
        <Content>
          <PageHeader
            className={styles.instructionHeader}
            ghost={false}
            title={(
              <Space>
                {!isProctored && !assessmentExtra?.disableNavigationBack
                  && (
                    <Button
                      onClick={backToCampaign}
                      size="small"
                      type="text"
                      aria-label={I18n.t('frontend.aria.back_to_tasks')}
                    >
                      <DirectionalNavigateBackIcon className={styles.backIcon} />
                    </Button>
                  )}
                <h1 className={styles.campaignDropdown}>
                  {assessmentName}
                </h1>
              </Space>
            )}
          />
          <div
            ref={instructionsContainerRef}
            data-content-protected={isCopyEnabled ? undefined : true}
            className={styles.instructionsContainer}
          >
            <InstructionsComponent
              initialized
              isDisconnected={isDisconnected}
              assessmentName={assessmentName}
              timerDuration={assessmentTimer}
              campaignExpiryDate={currentCampaignExpiryDate}
              translatedInstructions={
                instructions?.enabled ? substituteTextWithPipedData(instructions?.content, pipedTextMapping) : ''
              }
              onBegin={handleBeginAssessment}
            />
          </div>
        </Content>
      </>
    )
  }

  if (userAssessmentData.type === 'Assessments::Hogan') {
    return (
      <HoganStep
        onCancel={backToCampaign}
        userAssessmentId={userAssessmentData.id}
        userAssessmentUrl={userAssessmentData.url}
      />
    )
  }

  if (userAssessmentData.type === 'Assessments::Yoodli') {
    return (
      <LTIAssessment
        onCancel={backToCampaign}
        userAssessmentId={userAssessmentId}
        userAssessmentUrl={assessmentUrl(userAssessmentData, locale || I18n.currentLocale())}
      />
    )
  }

  if (userAssessmentData.type !== 'Assessments::Common') {
    return (
      <ExternalAssessment
        onCancel={backToCampaign}
        userAssessmentId={userAssessmentId}
        userAssessmentUrl={assessmentUrl(userAssessmentData, locale || I18n.currentLocale())}
      />
    )
  }

  if (WizardIsRequired.run(
    userAssessmentData.assessmentExtra,
    userAssessmentId,
    userAssessmentData.shouldRunAssessmentLevelChecks,
  )) {
    return (
      <CheckingWizard
        showTimer={insideSelectiveProctoringSession}
        assessmentId={assessmentId}
        userAssessmentId={userAssessmentId}
      />
    )
  }

  if (availableLocales && !locale && !availableLocales.includes(I18n.currentLocale())) {
    return (
      <LanguageSelection
        locales={availableLocales}
        select={lang => setLocale(lang)}
        onCancel={backToCampaign}
      />
    )
  }

  window.location.href = assessmentUrl(userAssessmentData, locale || selectedLocale || I18n.currentLocale())

  return null
}

export const Assessment = connector(UserAssessmentComponent)

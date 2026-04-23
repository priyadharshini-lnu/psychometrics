import { useEffect, FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  useNavigate, useParams, useSearchParams, useLocation,
} from 'react-router-dom'
import {
  Col, Space, Layout, Button,
} from 'antd'
import { PageHeader } from '@ant-design/pro-components'
import {
  PageHeader as GlintPageHeader, CountdownTimer, FontsizeModifier, DirectionalNavigateBackIcon,
} from '~/glint'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import { ClockCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
  const assessmentTimer = assessmentExtra?.timer
  const remainingCampaignTime = currentCampaignExpiryDate ? secondsLeftFromNow(currentCampaignExpiryDate) : null
  const { isProctored } = useIsProctored()

  useEffect(() => {
    const lang = searchParams.get('lang') || localeData?.code || I18n.currentLocale()
    fetchUserAssessment(params.userAssessmentId, undefined, lang).then(() => {
      setDataAvailable(true)
    })
  }, [])


  const backToCampaign = () => {
    navigate(`/campaigns/${userAssessmentData.campaignId}`)
  }

  const assessmentUrl = ({ url }, lang) => {
    const params = new URLSearchParams(`lang=${lang}`)
    return `${url}?${params.toString()}`
  }

  const handleBeginAssessment = () => {
    if (!assessmentStartedAt && !WizardIsRequired.run(
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


  if (showPolicyAccept && privacyConsentRequired) {
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

  if (showInstructions && ((instructions && instructions.enabled) || (assessmentTimer && !assessmentStartedAt))) {
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
          <div className={styles.instructionsContainer}>
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
    return <CheckingWizard assessmentId={assessmentId} userAssessmentId={userAssessmentId} />
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

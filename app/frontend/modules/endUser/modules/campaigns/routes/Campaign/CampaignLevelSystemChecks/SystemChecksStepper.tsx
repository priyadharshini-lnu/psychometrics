import { useState, useContext, useEffect } from 'react'
import {
  Steps, Layout, Flex,
} from 'antd'
import { useSelector, connect } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { LayoutWrapper } from './LayoutWrapper'
import { MediaQueryContext } from '~/glint'
import {
  BrowserCompatibility, NetworkCheck, CameraCheck, Results, MicrophoneCheck,
} from './Checks'
import { CampaignNameComponent } from './components/CampaignNameComponent'

const { I18n } = window

enum STEPS {
  browser = 'browser',
  network = 'network',
  audio = 'audio',
  camera = 'video',
  results = 'results',
}

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
}),
{

})
const SystemChecksStepperCompnent = () => {
  const { step: paramStep, campaignId } = useParams() as {step: string, campaignId: string}
  const navigate = useNavigate()

  const { isMobile, isTablet, isDesktop } = useContext(MediaQueryContext)

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const [currentStep, setCurrentStep] = useState(STEPS.browser)

  const STEP_ITEMS = [
    {
      title: I18n.t('enduser.browser'),
      step: STEPS.browser,
      ariaHidden: true,
      ariaLabel: I18n.t('enduser.browser_compatbility_step'),
      hide: !campaignDetailsForSystemCheck?.requiredSystemChecks?.includes(STEPS.browser),
    },
    {
      title: I18n.t('enduser.network'),
      step: STEPS.network,
      ariaHidden: true,
      ariaLabel: I18n.t('enduser.network_test_step'),
      hide: !campaignDetailsForSystemCheck?.requiredSystemChecks?.includes(STEPS.network),
    },
    {
      title: I18n.t('enduser.audio'),
      step: STEPS.audio,
      ariaHidden: true,
      ariaLabel: I18n.t('enduser.audio_test_step'),
      hide: !campaignDetailsForSystemCheck?.requiredSystemChecks?.includes(STEPS.audio),
    },
    {
      title: I18n.t('enduser.camera'),
      step: STEPS.camera,
      ariaHidden: true,
      ariaLabel: I18n.t('enduser.camera_test_step'),
      hide: !campaignDetailsForSystemCheck?.requiredSystemChecks?.includes(STEPS.camera),
    },
    {
      title: I18n.t('enduser.results'),
      step: STEPS.results,
      ariaHidden: true,
      ariaLabel: I18n.t('enduser.results_step'),
    },
  ]

  const visibleSteps = STEP_ITEMS.filter(item => !item.hide)

  const currentStepIndex = visibleSteps.findIndex(item => item.step === currentStep)

  const handleNext = () => {
    const nextStep = visibleSteps[currentStepIndex + 1].step
    setCurrentStep(nextStep)
    navigate(`/campaign_system_check/${campaignId}/${nextStep}`)
  }

  const handlePrev = () => {
    const prevStep = visibleSteps[currentStepIndex - 1].step
    setCurrentStep(prevStep)
    navigate(`/campaign_system_check/${campaignId}/${prevStep}`)
  }

  const handleNextForBrowserCheckStep = () => {
    handleNext()
  }

  const handlePrevForBrowserCheckStep = () => {
    navigate(`/campaign_system_check/${campaignId}/welcome`)
  }

  const handleNextForNetworkCheckStep = () => {
    handleNext()
  }

  const handleNextForCameraCheckStep = () => {
    setCurrentStep(STEPS.results)
    navigate(`/campaign_system_check/${campaignId}/${STEPS.results}`)
  }

  const handleNextForAudioCheckStep = () => {
    setCurrentStep(STEPS.results)
    navigate(`/campaign_system_check/${campaignId}/${STEPS.results}`)
  }

  const handleNextForResultsStep = () => {
    window.location.href = campaignDetailsForSystemCheck!.type === 'common' ? `/campaigns/${campaignId}`
      : `/threesixty_campaigns/${campaignDetailsForSystemCheck?.threeSixtyCampaignId}`
  }

  useEffect(() => {
    if (paramStep && Object.values(STEPS).includes(paramStep as STEPS)) {
      setCurrentStep(paramStep as STEPS)
    }
  }, [paramStep])

  return (
    <LayoutWrapper>
      <Layout.Content style={{
        ...(isMobile || isTablet || isDesktop ? { width: '100%' } : {
          maxWidth: '1200px',
          width: '800px',
        }),
      }}
      >
        <CampaignNameComponent campaignName={campaignDetailsForSystemCheck?.campaignName ?? ''} />
        <Flex
          justify="center"
          className="mb-2"
          vertical
          style={{
            width: '100%', alignSelf: 'center',
          }}
        >
          <div
            role="region"
            aria-label={currentStepIndex !== -1 ? `${I18n.t('idp.current_step',
              { step: visibleSteps[currentStepIndex].title })}`
              : undefined}
            className="pt-4 mb-4"
          >
            <Steps
              orientation="horizontal"
              responsive={false}
              current={currentStepIndex === -1 ? 0 : currentStepIndex}
              items={isMobile || isTablet || isDesktop ? visibleSteps.map(() => ({ title: '' }))
                : visibleSteps.map(({ title }) => ({ title }))
                  }
              aria-hidden="true"
            />
          </div>
          <Flex justify="center">
            {paramStep === STEPS.browser && (
              <BrowserCompatibility onPrev={handlePrevForBrowserCheckStep} onNext={handleNextForBrowserCheckStep} />
            )}
            {paramStep === STEPS.network && (
              <NetworkCheck onPrev={handlePrev} onNext={handleNextForNetworkCheckStep} />
            )}
            {paramStep === STEPS.audio && (
              <MicrophoneCheck onPrev={handlePrev} onNext={handleNextForAudioCheckStep} />
            )}
            {paramStep === STEPS.camera && (
              <CameraCheck onPrev={handlePrev} onNext={handleNextForCameraCheckStep} />
            )}
            {paramStep === STEPS.results && (
              <Results onPrev={handlePrev} onNext={handleNextForResultsStep} />
            )}
          </Flex>
        </Flex>
      </Layout.Content>
    </LayoutWrapper>

  )
}

export const SystemChecksStepper = connector(SystemChecksStepperCompnent)

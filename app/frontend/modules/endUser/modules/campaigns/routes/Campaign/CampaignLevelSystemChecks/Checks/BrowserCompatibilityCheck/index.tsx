import { useState, useEffect, useContext } from 'react'
import { useDispatch, useSelector, connect } from 'react-redux'
import {
  Flex, Spin, Typography, Button,
} from 'antd'
import { useParams } from 'react-router-dom'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { MediaQueryContext } from '~/glint'
import { BROWSER_FEATURES } from '~/modules/survey/constants/browser'
import { BROWSER_NAME, BROWSER_VERSION, checkBrowserSupportForFeature } from '~/utils/uaParser'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import {
  CheckCircleOutlined,
  GlobalOutlined, ExclamationCircleOutlined, RedoOutlined, ArrowLeftOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  useAddSystemCheckRecordMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import { CHECK_STATUS, CHECK_TYPE } from '../../common'
import { MIN_BROWSER_VERSIONS, BrowserCheckType, browserCheckErrorMessage } from './constants'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import commonStyles from '../../common-styles.less'
import { CountdownButton } from '../../components/CountdownButton'
import { AlertNotification } from '../../components/AlertNotification'
import { SuccessTag, FailureTag, PendingTag } from '../../components/StatusTags'

type BrowserCheckStatus = {
  type: BrowserCheckType;
  title: string;
  supported: boolean;
}

const { I18n } = window

const connector = connect(null,
  {
    fetchCampaign,
  })

const BrowserCompatibilityComponent = ({ onPrev, onNext, fetchCampaign }) => {
  const [isLoading, setIsLoading] = useState(true)

  const [checkStatus, setCheckStatus] = useState<CHECK_STATUS>(CHECK_STATUS.pending)

  const [browserChecks, setBrowserChecks] = useState<BrowserCheckStatus[]>([])

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { systemCheckSessionId = null, checksArray = [], campaignOptions } = campaignDetailsForSystemCheck || {}

  const { campaignId } = useParams() as {campaignId: string}

  const [addSystemCheckRecord] = useAddSystemCheckRecordMutation()
  const {
    data:
        systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId })

  const dispatch = useDispatch()

  const { isMobile } = useContext(MediaQueryContext)

  const checkBrowserSupportForWebGLAPI = () => {
    const canvas = document.createElement('canvas')
    const webglContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!webglContext) {
      return false
    }
    return true
  }

  const checkBrowserForLocalStorageSupport = () => {
    try {
      const testKey = '__test__'
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  const checkIfBrowserIsAboveMinimumVersion = () => Number(BROWSER_VERSION.split('.')[0])
   >= MIN_BROWSER_VERSIONS[BROWSER_NAME]

  const checkBrowserForFeatureCompatibility = () => {
    setIsLoading(true)

    const hasMinimumBrowserVersion = checkIfBrowserIsAboveMinimumVersion()
    const hasWebGLSupport = checkBrowserSupportForWebGLAPI()
    const hasMediaRecorderAPISupport = checkBrowserSupportForFeature(
      BROWSER_FEATURES.mediaRecorderAPI,
    ).isBrowserSupported

    const hasLocalStorageSupport = checkBrowserForLocalStorageSupport()

    setBrowserChecks([{
      type: BrowserCheckType.browserVersion,
      title: `${I18n.t('enduser.browser_compatibility')} ${BROWSER_NAME} ${BROWSER_VERSION}`,
      supported: hasMinimumBrowserVersion,
    }, {
      type: BrowserCheckType.webGL,
      title: I18n.t('enduser.webgl_api_support'),
      supported: hasWebGLSupport,
    }, {
      type: BrowserCheckType.mediaRecorderAPI,
      title: I18n.t('enduser.media_recorder_api_support'),
      supported: hasMediaRecorderAPISupport,
    },
    {
      type: BrowserCheckType.localStorage,
      title: I18n.t('enduser.localstorage_support'),
      supported: hasLocalStorageSupport,
    }])

    setCheckStatus(hasMinimumBrowserVersion && hasWebGLSupport && hasMediaRecorderAPISupport && hasLocalStorageSupport
      ? CHECK_STATUS.passed : CHECK_STATUS.failed)

    dispatch(actions.setChecksArray([
      {
        checkType: CHECK_TYPE.browser,
        passed: hasMinimumBrowserVersion && hasWebGLSupport && hasMediaRecorderAPISupport && hasLocalStorageSupport,
        data: {
          mediaRecorderApi: hasMediaRecorderAPISupport,
          webGL: hasWebGLSupport,
          localStorage: hasLocalStorageSupport,
          browserName: BROWSER_NAME,
          browserVersion: BROWSER_VERSION,
          browserCompatibility: hasMinimumBrowserVersion,
        },
      },
    ]))

    dispatch(actions.setSystemCheckStatusPassed(hasMinimumBrowserVersion
      && hasWebGLSupport && hasMediaRecorderAPISupport && hasLocalStorageSupport))
    setIsLoading(false)
  }

  useEffect(() => {
    if (!systemCheckSessionId) {
      setIsLoading(true)
      fetchCampaign(`/campaigns/${campaignId}`).then(({ response }) => {
        dispatch(actions.setCampaignDetailsForSystemCheck(response))

        if (systemCheckRequirementsStatus) {
          const validChecks = Object.keys((systemCheckRequirementsStatus)?.requirements).filter(
            key => systemCheckRequirementsStatus?.requirements[key]?.required === true,
          )

          dispatch(actions.setRequiredSystemChecks(validChecks))

          if (validChecks.includes('network')) {
            dispatch(actions.setNetworkSpeeds({
              minimumDownloadSpeed: systemCheckRequirementsStatus?.requirements?.network?.minimumDownloadSpeed,
              minimumUploadSpeed: systemCheckRequirementsStatus?.requirements?.network?.minimumUploadSpeed,
            }))
          }
          checkBrowserForFeatureCompatibility()
        }
      }).finally(() => {
        setIsLoading(false)
      })
    } else {
      checkBrowserForFeatureCompatibility()
    }
  }, [systemCheckRequirementsStatus])

  const handleNext = async () => {
    const record = checksArray.filter(check => check.checkType === CHECK_TYPE.browser)[0]
    await addSystemCheckRecord({
      campaignId,
      record,
    })
    onNext()
  }

  return (
    <Flex justify="center" flex={1} style={{ ...(!isMobile && { padding: '1rem' }) }} vertical>
      <Flex justify="space-between">
        <Flex gap={8}>
          <GlobalOutlined style={{
            fontSize: '1.5rem',
            color: 'var(--ant-primary-color)',
            alignSelf: 'flex-start',
          }}
          />
          <Flex vertical>
            <h4 className="mt-0">
              {I18n.t('enduser.browser_compatibility_check')}
            </h4>
            <Typography.Text className="mb-4">
              {I18n.t('enduser.browser_compatibility_check_description')}
            </Typography.Text>
          </Flex>
        </Flex>
        {checkStatus === CHECK_STATUS.passed && (
          <SuccessTag style={{ height: 'fit-content' }} />
        )}
        {checkStatus === CHECK_STATUS.failed && (
          <FailureTag style={{ height: 'fit-content' }} />
        )}
        {checkStatus === CHECK_STATUS.pending && (
          <PendingTag style={{ height: 'fit-content' }} />
        )}
      </Flex>
      {isLoading && (
        <Flex
          style={{
            minHeight: '400px',
          }}
          flex={1}
          className={`${commonStyles['bg-off-white']} mb-4`}
        >
          <Spin
            className="justify-center items-center"
            style={{ width: '100%', height: '100%', display: 'flex' }}
            tip={I18n.t('enduser.checking_browser_compatibility')}
          />
        </Flex>
      )}
      {!isLoading && (
        <Flex
          justify="center"
          align="center"
          className={`${commonStyles['border-dark']} p-4 mb-4`}
        >
          <Flex vertical gap={12} style={{ width: '100%' }}>
            {browserChecks.map(check => (
              <Flex key={check.type} vertical style={{ width: '100%' }}>
                <Flex align="start">
                  <Flex
                    flex={1}
                    align="start"
                    justify="space-between"
                  >
                    <Flex gap={8} align="start">
                      {check.supported ? (
                        <CheckCircleOutlined
                          className={commonStyles['primary-icon']}
                        />
                      ) : <ExclamationCircleOutlined className={commonStyles['error-icon']} />}
                      <Flex gap={4} vertical>
                        <h4 className="mt-0">{check.title}</h4>
                        {!check.supported
                        && <Typography.Text>{browserCheckErrorMessage[check.type].title}</Typography.Text>}
                      </Flex>
                    </Flex>
                    <Typography.Text>
                      {check.supported ? (
                        <SuccessTag />
                      ) : (
                        <FailureTag />
                      )}
                    </Typography.Text>
                  </Flex>
                </Flex>
                {!check.supported && (
                  <AlertNotification errorMessageList={browserCheckErrorMessage[check.type].description} />
                )}
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}

      <Flex style={{ width: '100%' }} justify="space-between">
        <Button icon={<ArrowLeftOutlined />} onClick={onPrev}>
          {I18n.t('enduser.back')}
        </Button>
        <Flex justify="end" gap={12}>
          <Button icon={<RedoOutlined />} onClick={checkBrowserForFeatureCompatibility}>
            {I18n.t('enduser.rerun_check')}
          </Button>
          <CountdownButton
            disabled={
              isLoading || checkStatus === CHECK_STATUS.pending || (checkStatus === CHECK_STATUS.failed
                && !campaignOptions?.allowContinueWithWarning)
            }
            label={I18n.t('shared.continue')}
            handleContinue={handleNext}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export const BrowserCompatibility = connector(BrowserCompatibilityComponent)

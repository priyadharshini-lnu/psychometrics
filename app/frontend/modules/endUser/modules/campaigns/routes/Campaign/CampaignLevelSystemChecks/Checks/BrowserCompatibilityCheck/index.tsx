import {
  useState, useEffect, useRef,
} from 'react'
import { useDispatch, useSelector, connect } from 'react-redux'
import {
  Flex, Spin, Typography, Button,
} from 'antd'
import { useParams } from 'react-router-dom'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { ButtonWithArrow, DirectionalBackArrowIcon } from '~/glint'
import { BROWSER_FEATURES } from '~/modules/survey/constants/browser'
import {
  BROWSER_NAME, BROWSER_VERSION, checkBrowserSupportForFeature, getExactBrowserVersionSync,
} from '~/utils/uaParser'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import {
  CheckCircleOutlined,
  GlobalOutlined, ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  useAddSystemCheckRecordMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import { CHECK_STATUS, CHECK_TYPE, InternationalizedDetails } from '../../common'
import {
  MIN_BROWSER_VERSIONS, BrowserCheckType, browserCheckErrorMessage,
  browserIncompatibleWithProctoringMessage, BROWSER_NOT_PROCTORING_COMPATIBLE,
} from './constants'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import commonStyles from '../../common-styles.less'
import { CountdownButton, CountdownButtonRef } from '../../components/CountdownButton'
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
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId }, { refetchOnMountOrArgChange: true })

  const dispatch = useDispatch()

  const countDownButtonRef = useRef<CountdownButtonRef>(null)

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

  const checkBrowserForProctoringSupport = () => {
    if (BROWSER_NOT_PROCTORING_COMPATIBLE.includes(BROWSER_NAME) && campaignOptions?.proctoringEnabled) {
      browserCheckErrorMessage.browserVersion = { ...browserIncompatibleWithProctoringMessage }
      return false
    }
    return true
  }

  const checkIfBrowserIsAboveMinimumVersion = () => {
    const compatibleVersion = MIN_BROWSER_VERSIONS[BROWSER_NAME]
    if (!compatibleVersion) {
      return false
    }
    return checkBrowserForProctoringSupport() && Number(BROWSER_VERSION.split('.')[0]) >= compatibleVersion
  }

  const checkBrowserForFeatureCompatibility = async () => {
    setIsLoading(true)
    const hasMinimumBrowserVersion = checkIfBrowserIsAboveMinimumVersion()
    const hasWebGLSupport = checkBrowserSupportForWebGLAPI()
    const hasMediaRecorderAPISupport = checkBrowserSupportForFeature(
      BROWSER_FEATURES.mediaRecorderAPI,
    ).isBrowserSupported

    const hasLocalStorageSupport = checkBrowserForLocalStorageSupport()

    const generateDetails = () => {
      const details:InternationalizedDetails[] = []


      if (!MIN_BROWSER_VERSIONS[BROWSER_NAME]) {
        details.push({
          i18nKey: 'enduser.browser_not_compatible_detail',
          i18nVars: [
            ['browser_name', BROWSER_NAME],
          ],
        })
      }


      if (hasMinimumBrowserVersion && hasWebGLSupport && hasMediaRecorderAPISupport && hasLocalStorageSupport) {
        details.push({
          i18nKey: 'enduser.browser_compatible',
          i18nVars: [
            ['browser_name', BROWSER_NAME],
            ['browser_version', getExactBrowserVersionSync() || ''],
          ],
        })
        return details
      }


      if (!hasMinimumBrowserVersion) {
        if (BROWSER_NOT_PROCTORING_COMPATIBLE.includes(BROWSER_NAME) && campaignOptions?.proctoringEnabled) {
          details.push({
            i18nKey: 'enduser.browser_proctoring_description',
            i18nVars: [
              ['browser_name', BROWSER_NAME],
            ],
          })
        } else {
          details.push({
            i18nKey: 'enduser.browser_incompatible_detail',
            i18nVars: [
              ['browser_name', BROWSER_NAME],
              ['browser_version', getExactBrowserVersionSync() || ''],
              ['min_browser_version', MIN_BROWSER_VERSIONS[BROWSER_NAME]?.toString() || ''],
            ],
          })
        }
      } else {
        details.push({
          i18nKey: 'enduser.browser_compatible_detail',
          i18nVars: [
            ['browser_name', BROWSER_NAME],
            ['browser_version', getExactBrowserVersionSync() || ''],
          ],
        })
      }

      if (!hasWebGLSupport) {
        details.push({
          i18nKey: 'enduser.webgl_not_supported_detail',
          i18nVars: [
            ['browser_name', BROWSER_NAME],
            ['browser_version', getExactBrowserVersionSync() || ''],
          ],
        })
      }

      if (!hasMediaRecorderAPISupport) {
        details.push({
          i18nKey: 'enduser.media_recorder_api_not_supported_detail',
          i18nVars: [
            ['browser_name', BROWSER_NAME],
            ['browser_version', getExactBrowserVersionSync() || ''],
          ],
        })
      }

      if (!hasLocalStorageSupport) {
        details.push(I18n.t('enduser.localstorage_not_enabled_detail'))

        details.push({
          i18nKey: 'enduser.localstorage_not_enabled_detail',
          i18nVars: [],
        })
      }
      return details
    }

    const getBrowserCheckDetails = () => {
      if (!MIN_BROWSER_VERSIONS[BROWSER_NAME]) {
        return {
          type: BrowserCheckType.browserVersion,
          title: `${I18n.t('enduser.browser_compatibility')} ${BROWSER_NAME} ${getExactBrowserVersionSync()}`,
          supported: false,
        }
      }
      return {
        type: BrowserCheckType.browserVersion,
        title: `${I18n.t('enduser.browser_compatibility')} ${BROWSER_NAME} ${getExactBrowserVersionSync()}`,
        supported: hasMinimumBrowserVersion,
      }
    }

    setBrowserChecks([getBrowserCheckDetails(), {
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
          browserVersion: getExactBrowserVersionSync(),
          browserCompatibility: hasMinimumBrowserVersion,
          details: generateDetails(),
        },
      },
    ]))

    dispatch(actions.setSystemCheckStatusPassed(hasMinimumBrowserVersion
      && hasWebGLSupport && hasMediaRecorderAPISupport && hasLocalStorageSupport))
    setIsLoading(false)
  }

  useEffect(() => {
    if (!systemCheckSessionId) {
      if (campaignOptions) {
        checkBrowserForFeatureCompatibility()
        setIsLoading(false)
        return
      }
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
        }
      })
    } else {
      checkBrowserForFeatureCompatibility()
    }
  }, [systemCheckRequirementsStatus, campaignOptions])

  const handleNext = async () => {
    const record = checksArray.filter(check => check.checkType === CHECK_TYPE.browser)[0]
    await addSystemCheckRecord({
      campaignId,
      record,
    })
    onNext()
  }

  return (
    <Flex justify="center" flex={1} vertical>
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
                      <Flex gap={2} vertical>
                        <h4 className="mt-0 mb-0">{check.title}</h4>
                        {!check.supported
                        && (
                          <Typography.Text className="mb-2">
                            {browserCheckErrorMessage[check.type].title}
                          </Typography.Text>
                        )}
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
        <Button icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
          {I18n.t('enduser.back')}
        </Button>
        <Flex justify="end" gap={12}>
          {checkStatus === CHECK_STATUS.passed ? (
            <CountdownButton
              label={I18n.t('shared.continue')}
              handleContinue={handleNext}
              ref={countDownButtonRef}
            />
          ) : (
            <ButtonWithArrow
              type="primary"
              disabled={isLoading || checkStatus === CHECK_STATUS.pending}
              style={{ alignSelf: 'flex-end' }}
              label={I18n.t('shared.continue')}
              onClick={handleNext}
            />
          )}

        </Flex>
      </Flex>
    </Flex>
  )
}

export const BrowserCompatibility = connector(BrowserCompatibilityComponent)

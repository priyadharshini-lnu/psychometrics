import {
  useEffect, useState, useRef,
} from 'react'
import {
  Flex, Typography, Button, Divider, Progress,
} from 'antd'
import { useDispatch, useSelector, connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  useTransform, useSpring, motion,
} from 'motion/react'
import cs from 'classnames'
import { useOnlineStatus } from './useOnlineStatus'
import { useNetworkTest } from '~/hooks/useNetworkTest'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { ButtonWithArrow, DirectionalBackArrowIcon } from '~/glint'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import {
  useAddSystemCheckRecordMutation, useCompleteSystemCheckSessionMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import {
  CheckCircleOutlined,
  WifiOutlined, ExclamationCircleOutlined, RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { WifiLoader } from './WifiLoader/WifiLoader'
import { CHECK_STATUS, CHECK_TYPE, InternationalizedDetails } from '../../common'
import { errorMessageList } from './constants'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import commonStyles from '../../common-styles.less'
import { CountdownButton, CountdownButtonRef } from '../../components/CountdownButton'
import { AlertNotification } from '../../components/AlertNotification'
import { SuccessTag, FailureTag, PendingTag } from '../../components/StatusTags'
import { convertSpeedToMbps } from './convertSpeedToMbps'

const { I18n } = window

const connector = connect(null,
  {
    fetchCampaign,
  })
const NetworkCheckComponent = ({ onPrev, onNext, fetchCampaign }) => {
  const {
    runTimedTest, formatSpeed, state: testState, reset: resetTest,
  } = useNetworkTest()
  const dispatch = useDispatch()
  const [speed, setSpeed] = useState<{ download: string; upload: string } | null>(null)
  const completedDownloadRef = useRef<number | null>(null)
  const isOnline = useOnlineStatus()
  const countDownButtonRef = useRef<CountdownButtonRef>(null)

  const [checkStatus, setCheckStatus] = useState(CHECK_STATUS.pending)

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const {
    systemCheckSessionId = null, minimumDownloadSpeed = 0,
    minimumUploadSpeed = 0, checksArray,
  } = campaignDetailsForSystemCheck || {}

  const { campaignId } = useParams() as {campaignId: string}

  const [addSystemCheckRecord] = useAddSystemCheckRecordMutation()
  const [completeSystemCheckSession] = useCompleteSystemCheckSessionMutation()
  const {
    data:
      systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId }, { refetchOnMountOrArgChange: true })

  const networkRequirements = systemCheckRequirementsStatus?.requirements?.network

  const downloadSpeed = useSpring(0, { stiffness: 150, damping: 30 })
  const uploadSpeed = useSpring(0, { stiffness: 150, damping: 30 })

  const downloadDisplay = useTransform(downloadSpeed, val => val.toFixed(2))
  const uploadDisplay = useTransform(uploadSpeed, val => val.toFixed(2))

  const generateDetails = (uploadSpeedStr: string, downloadSpeedStr: string) => {
    const details:InternationalizedDetails[] = []

    if (parseFloat(downloadSpeedStr) === 0 && parseFloat(uploadSpeedStr) === 0) {
      details.push({
        i18nKey: 'enduser.could_not_reach_servers',
        i18nVars: [],
      })

      return details
    }

    const hasRequiredSpeeds = (minimumUploadSpeed && convertSpeedToMbps(uploadSpeedStr)
     >= minimumUploadSpeed) && (minimumDownloadSpeed && convertSpeedToMbps(downloadSpeedStr) >= minimumDownloadSpeed)

    if (hasRequiredSpeeds) {
      details.push({
        i18nKey: 'enduser.network_speed_meets_required_detail',
        i18nVars: [],
      })
    } else {
      if (minimumUploadSpeed && convertSpeedToMbps(uploadSpeedStr) < minimumUploadSpeed) {
        details.push({
          i18nKey: 'enduser.upload_speed_below_minimum',
          i18nVars: [
            ['upload_speed', uploadSpeedStr],
            ['minimum_upload_speed', minimumUploadSpeed.toString()],
          ],
        })
      }

      if (minimumDownloadSpeed && convertSpeedToMbps(downloadSpeedStr) < minimumDownloadSpeed) {
        details.push({
          i18nKey: 'enduser.download_speed_below_minimum',
          i18nVars: [
            ['download_speed', downloadSpeedStr],
            ['minimum_download_speed', minimumDownloadSpeed.toString()],
          ],
        })
      }
    }

    return details
  }

  const runNetworkTest = async (checkPreloaded = true) => {
    if (checkPreloaded) {
      const preloadedCheck = checksArray?.find(check => check.checkType === CHECK_TYPE.network)
      if (preloadedCheck) {
        setCheckStatus(preloadedCheck.passed ? CHECK_STATUS.passed : CHECK_STATUS.failed)

        setSpeed({
          download: preloadedCheck.data.downloadSpeed
            ? `${preloadedCheck.data.downloadSpeed} `
            : '0 Mbps',
          upload: preloadedCheck.data.uploadSpeed
            ? `${preloadedCheck.data.uploadSpeed} `
            : '0 Mbps',
        })
        return
      }
    }

    resetTest()
    setCheckStatus(CHECK_STATUS.pending)
    setSpeed(null)
    completedDownloadRef.current = null
    downloadSpeed.set(0)
    uploadSpeed.set(0)

    try {
      const res = await runTimedTest({
        minimumDownloadSpeedMbps: networkRequirements?.minimumDownloadSpeed ?? minimumDownloadSpeed,
        minimumUploadSpeedMbps: networkRequirements?.minimumUploadSpeed ?? minimumUploadSpeed,
        stabilityDuration: networkRequirements?.stabilityDuration,
      })

      if (!res) {
        setCheckStatus(CHECK_STATUS.failed)
        setSpeed(null)
        addSystemCheckRecord({
          campaignId,
          record: {
            checkType: 'network',
            data: {
              details: generateDetails('0Mbps', '0Mbps'),
            },
          },
        })
        return
      }

      const {
        downloadSpeedMbps, uploadSpeedMbps, latency, stable, durationSeconds,
      } = res

      const speedData = {
        download_speed_mbps: downloadSpeedMbps,
        upload_speed_mbps: uploadSpeedMbps,
        latency: {
          latency: latency.latency,
          jitter: latency.jitter,
          packetLoss: latency.packetLoss,
        },
        stable,
        duration_seconds: durationSeconds,
      }

      const { data: response } = await addSystemCheckRecord({
        campaignId,
        record: {
          checkType: 'network',
          data: {
            ...speedData,
            details: generateDetails(
              formatSpeed(uploadSpeedMbps),
              formatSpeed(downloadSpeedMbps),
            ),
          },
        },
      })

      setCheckStatus(response?.passed ? CHECK_STATUS.passed : CHECK_STATUS.failed)
      setSpeed({
        download: formatSpeed(response?.data?.downloadSpeedMbps as number),
        upload: formatSpeed(response?.data?.uploadSpeedMbps as number),
      })
    } catch {
      setCheckStatus(CHECK_STATUS.failed)
      addSystemCheckRecord({
        campaignId,
        record: {
          checkType: 'network',
          data: {
            details: generateDetails('0', '0'),
          },
        },
      })
    }
  }

  useEffect(() => {
    if (!systemCheckSessionId) {
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
          runNetworkTest(false)
        }
      })
    } else {
      runNetworkTest()
    }
  }, [systemCheckRequirementsStatus])

  useEffect(() => {
    if (speed) {
      downloadSpeed.set(parseFloat(speed.download.split(' ')[0]))
      uploadSpeed.set(parseFloat(speed.upload.split(' ')[0]))
    }
  }, [speed])

  useEffect(() => {
    if (checkStatus !== CHECK_STATUS.pending) return
    const { currentTest, currentSpeedMbps } = testState
    if (!currentSpeedMbps) return

    if (currentTest === 'download') {
      downloadSpeed.set(currentSpeedMbps)
    }

    if (currentTest === 'upload') {
      if (completedDownloadRef.current === null) {
        completedDownloadRef.current = downloadSpeed.get()
      }
      uploadSpeed.set(currentSpeedMbps)
    }
  }, [testState.currentTest, testState.currentSpeedMbps, checkStatus])

  const showDownloadSpeed = testState.currentTest === 'download'
  const showUploadSpeed = testState.currentTest === 'upload'
  const testCompleted = checkStatus !== CHECK_STATUS.pending

  const handleNext = async () => {
    dispatch(actions.setChecksArray([
      {
        checkType: CHECK_TYPE.network,
        passed: checkStatus === CHECK_STATUS.passed,
        data: {
          downloadSpeed: speed?.download,
          uploadSpeed: speed?.upload,
        },
      },
    ]))

    dispatch(actions.setSystemCheckStatusPassed(checkStatus === CHECK_STATUS.passed))

    try {
      if (!campaignDetailsForSystemCheck?.requiredSystemChecks?.includes(CHECK_TYPE.video)) {
        await completeSystemCheckSession({
          campaignId,
        })
      }
      onNext()
    } catch (error) {
      console.error('Failed to add system check record:', error)
    }
  }

  if (!isOnline) {
    return (
      <Flex vertical className="w-100">
        <Flex
          vertical
          justify="center"
          align="center"
          className={`p-4 ${commonStyles['bg-off-white']} ${commonStyles['border-dark']}`}
          style={{
            minHeight: '300px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <ExclamationCircleOutlined style={{ fontSize: '2rem', color: 'var(--ant-error-color)' }} className="mb-2" />
          <h4>
            {I18n.t('enduser.please_check_your_internet_connection')}
          </h4>
        </Flex>
        <Flex justify="space-between" className="mt-2">
          <Button icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
            {I18n.t('enduser.back')}
          </Button>
          <Flex justify="end" gap={4}>
            <Button onClick={() => {
              runNetworkTest(false)
            }}
            >
              {I18n.t('enduser.rerun_check')}
            </Button>
            <ButtonWithArrow
              type="primary"
              style={{ alignSelf: 'flex-end' }}
              label={I18n.t('shared.continue')}
              onClick={handleNext}
              disabled={!isOnline}
            />
          </Flex>
        </Flex>
      </Flex>

    )
  }

  return (
    <Flex
      justify="center"
      className="mb-2"
      style={{ width: '100%', alignSelf: 'center' }}
      vertical
      gap={8}
    >
      <Flex justify="space-between">
        <Flex gap={8}>
          <WifiOutlined className={commonStyles['primary-icon']} style={{ alignSelf: 'flex-start' }} />
          <Flex vertical>
            <h4 className="mt-0">
              {I18n.t('enduser.network_check')}
            </h4>
            <Typography.Text className="mb-4">
              {I18n.t('enduser.network_check_description')}
            </Typography.Text>
          </Flex>
        </Flex>
        {checkStatus === CHECK_STATUS.passed && (
          <SuccessTag
            style={{ height: 'fit-content' }}
          />
        )}
        {checkStatus === CHECK_STATUS.failed && (
          <FailureTag
            style={{ height: 'fit-content' }}
          />
        )}

        {checkStatus === CHECK_STATUS.pending && (
          <PendingTag
            style={{ height: 'fit-content' }}
          />
        )}
      </Flex>
      <Flex
        justify="center"
        align="center"
        className={`${commonStyles['border-dark']} mb-2`}
      >
        {checkStatus !== CHECK_STATUS.failed && (
          <Flex
            vertical
            gap={16}
            justify="center"
            align="center"
            style={{
              width: '100%',
              padding: '1.5rem',
              minHeight: '370px',
            }}
          >
            {checkStatus === CHECK_STATUS.pending && (
              <Flex justify="center" align="center" vertical gap={12}>
                <WifiLoader />
                <Flex
                  vertical
                  align="center"
                  justify="space-between"
                  gap={8}
                  style={{
                    width: '60%',
                  }}
                >
                  <Typography.Text style={{ whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: 500 }}>
                    {testState.currentTest === 'latency' && I18n.t('enduser.checking_latency')}
                    {testState.currentTest === null && I18n.t('enduser.initializing')}
                    {testState.currentTest === 'download' && I18n.t('enduser.testing_download_speed')}
                    {testState.currentTest === 'upload' && I18n.t('enduser.testing_upload_speed')}
                  </Typography.Text>
                  {testState.status === 'testing'
                  && (testState.currentTest === 'download' || testState.currentTest === 'upload') && (
                    <Progress
                      percent={(() => {
                        const phaseProgress = Math.min(testState.elapsedSeconds / 20, 1)
                        if (testState.currentTest === 'download') return phaseProgress * 50
                        if (testState.currentTest === 'upload') return 50 + phaseProgress * 49
                        return 0
                      })()}
                      showInfo={false}
                      strokeColor="var(--ant-primary-color)"
                      size="small"
                    />
                  )}
                </Flex>
              </Flex>
            )}

            {checkStatus === CHECK_STATUS.passed && (
              <Flex
                gap={8}
                vertical
                justify="center"
                align="center"
              >
                <CheckCircleOutlined style={{ color: 'var(--ant-success-color)', fontSize: '5rem' }} />
                <Typography.Text>
                  {I18n.t('enduser.internet_speed_optimal')}
                </Typography.Text>
              </Flex>
            )}

            <Flex justify="center" gap={32} style={{ width: '100%' }}>
              {(showDownloadSpeed || testCompleted) && (
                <Flex vertical style={{ textAlign: 'center' }}>
                  <h1 className="mb-0 mt-0" style={{ color: 'var(--ant-primary-color)' }}>
                    <motion.span>{downloadDisplay}</motion.span>
                  </h1>
                  <Typography.Text className="mb-1">
                    {I18n.t('enduser.download')}
                    &nbsp;
                    {speed?.download.split(' ')[1]}
                  </Typography.Text>
                </Flex>
              )}

              {testCompleted && (
                <Divider
                  style={{ height: 'auto', borderColor: 'var(--light-grey-border)' }}
                  orientation="vertical"
                />
              )}

              {(showUploadSpeed || testCompleted) && (
                <Flex vertical style={{ textAlign: 'center' }}>
                  <h1 className="mb-0 mt-0" style={{ color: 'var(--ant-primary-color)' }}>
                    <motion.span>{uploadDisplay}</motion.span>
                  </h1>
                  <Typography.Text className="mb-1">
                    {I18n.t('enduser.upload')}
                    &nbsp;
                    {speed?.upload.split(' ')[1]}
                  </Typography.Text>
                </Flex>
              )}
            </Flex>

            {checkStatus === CHECK_STATUS.passed && (
              <>
                <Divider
                  style={{ borderColor: 'var(--light-grey-border)', margin: 0 }}
                />
                <Flex justify="space-evenly" style={{ width: '100%' }}>
                  <Flex vertical style={{ textAlign: 'center' }}>
                    <h3 className="mb-0 mt-0">
                      <span>{minimumDownloadSpeed}</span>
                    </h3>
                    <Typography.Text className="mb-1">
                      {I18n.t('enduser.required_download_in_mbps')}
                    </Typography.Text>
                  </Flex>
                  <Divider style={{ height: 'auto', borderColor: 'var(--light-grey-border)' }} orientation="vertical" />
                  <Flex vertical style={{ textAlign: 'center' }}>
                    <h3 className="mb-0 mt-0">
                      <span>{minimumUploadSpeed}</span>
                    </h3>
                    <Typography.Text className="mb-1">
                      {I18n.t('enduser.required_upload_in_mbps')}
                    </Typography.Text>
                  </Flex>
                </Flex>
              </>
            )}
          </Flex>
        )}

        {checkStatus === CHECK_STATUS.failed && (
          <Flex gap={12} vertical style={{ width: '100%', padding: '1.5rem' }}>
            <Flex justify="space-between" align="center">
              <Flex gap={8}>
                {checkStatus === CHECK_STATUS.failed
                  ? (
                    <ExclamationCircleOutlined className={cs(commonStyles['error-icon'], 'items-start')} />
                  ) : <CheckCircleOutlined className={commonStyles['success-icon']} />}
                <Flex gap={2} vertical>
                  <h4 className="mt-0 mb-0">{I18n.t('enduser.internet_speed_slow')}</h4>
                  <Typography.Text className="mb-2">
                    {I18n.t('enduser.minimum_speed_requirements', {
                      minimum_download_speed: minimumDownloadSpeed,
                      minimum_upload_speed: minimumUploadSpeed,
                    })}
                  </Typography.Text>
                </Flex>
              </Flex>
              <FailureTag
                style={{ height: 'fit-content' }}
                className="self-start"
              />
            </Flex>
            <AlertNotification errorMessageList={errorMessageList} />
          </Flex>
        )}
      </Flex>

      <Flex className="w-100" justify="space-between">
        <Button icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
          {I18n.t('enduser.back')}
        </Button>

        <Flex justify="end" gap={12}>
          {checkStatus !== CHECK_STATUS.pending && (
            <Button
              icon={<RedoOutlined />}
              onClick={() => {
                countDownButtonRef.current?.reset()
                runNetworkTest(false)
              }}
            >
              {I18n.t('enduser.rerun_check')}
            </Button>
          )}
          {checkStatus === CHECK_STATUS.passed ? (
            <CountdownButton
              label={I18n.t('shared.continue')}
              handleContinue={handleNext}
              ref={countDownButtonRef}
            />
          ) : (
            <ButtonWithArrow
              type="primary"
              disabled={checkStatus === CHECK_STATUS.pending}
              className="self-end"
              label={I18n.t('shared.continue')}
              onClick={handleNext}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const NetworkCheck = connector(NetworkCheckComponent)

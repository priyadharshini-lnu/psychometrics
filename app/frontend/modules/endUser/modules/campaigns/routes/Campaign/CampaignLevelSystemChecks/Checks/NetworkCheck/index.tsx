import {
  useEffect, useState, useContext, useRef,
} from 'react'
import {
  Flex, Typography, Skeleton, Button, Divider,
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
import { MediaQueryContext, ButtonWithArrow, DirectionalBackArrowIcon } from '~/glint'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import {
  useAddSystemCheckRecordMutation, useCompleteSystemCheckSessionMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import {
  CheckCircleOutlined,
  WifiOutlined, ExclamationCircleOutlined, RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { WifiLoader } from './WifiLoader/WifiLoader'
import { CHECK_STATUS, CHECK_TYPE } from '../../common'
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
  const { runTest, formatSpeed } = useNetworkTest()
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useDispatch()
  const [speed, setSpeed] = useState<{ download: string; upload: string } | null>(null)
  const { isMobile } = useContext(MediaQueryContext)
  const isOnline = useOnlineStatus()
  const countDownButtonRef = useRef<CountdownButtonRef>(null)

  const [checkStatus, setCheckStatus] = useState(CHECK_STATUS.pending)

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const {
    systemCheckSessionId = null, minimumDownloadSpeed = 0,
    minimumUploadSpeed = 0,
  } = campaignDetailsForSystemCheck || {}

  const { campaignId } = useParams() as {campaignId: string}

  const [addSystemCheckRecord] = useAddSystemCheckRecordMutation()
  const [completeSystemCheckSession] = useCompleteSystemCheckSessionMutation()
  const {
    data:
      systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId })

  const downloadSpeed = useSpring(0, { stiffness: 30, damping: 10 })
  const uploadSpeed = useSpring(0, { stiffness: 30, damping: 10 })

  const downloadDisplay = useTransform(downloadSpeed, val => val.toFixed(1))
  const uploadDisplay = useTransform(uploadSpeed, val => val.toFixed(1))


  const runNetworkTest = () => {
    const generateDetails = (uploadSpeed: string, downloadSpeed: string) => {
      const details:string[] = []

      if (parseFloat(downloadSpeed) === 0 && parseFloat(uploadSpeed) === 0) {
        details.push(I18n.t('enduser.could_not_reach_servers'))
        return details
      }

      if (minimumUploadSpeed && convertSpeedToMbps(uploadSpeed) < minimumUploadSpeed) {
        details.push(I18n.t('enduser.upload_speed_below_minimum', {
          upload_speed: uploadSpeed,
          minimum_upload_speed: minimumUploadSpeed,
        }))
      }

      if (minimumDownloadSpeed && convertSpeedToMbps(downloadSpeed) < minimumDownloadSpeed) {
        details.push(I18n.t('enduser.download_speed_below_minimum', {
          download_speed: downloadSpeed,
          minimum_download_speed: minimumDownloadSpeed,
        }))
      } else {
        details.push(I18n.t('enduser.network_speed_meets_required_detail'))
      }

      return details
    }

    setIsLoading(true)
    try {
      runTest().then((res) => {
        const speedData = {
          download_speed_mbps: res?.downloadSpeedMbps as number,
          upload_speed_mbps: res?.uploadSpeedMbps as number,
          latency: {
            latency: res?.latency.latency,
            jitter: res?.latency.jitter,
            packetLoss: res?.latency.packetLoss,
          },
        }

        addSystemCheckRecord({
          campaignId,
          record: {
            checkType: 'network',
            data: {
              ...speedData,
              details: generateDetails(formatSpeed(res?.uploadSpeedMbps as number),
                formatSpeed(res?.downloadSpeedMbps as number)),
            },
          },
        }).then(({ data: response }) => {
          setCheckStatus(response?.passed ? CHECK_STATUS.passed : CHECK_STATUS.failed)
          setIsLoading(false)
          setSpeed({
            download: formatSpeed(response?.data?.downloadSpeedMbps as number),
            upload: formatSpeed(response?.data?.uploadSpeedMbps as number),
          })
        })
      }).catch(() => {
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
        setIsLoading(false)
      })
    } catch (error) {
      setCheckStatus(CHECK_STATUS.failed)

      setIsLoading(false)
    }
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
          runNetworkTest()
        }
      }).finally(() => {
        setIsLoading(false)
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
      <Flex vertical>
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
        <Flex justify="end" gap={4} className="mt-2">
          <Button onClick={() => {
            setCheckStatus(CHECK_STATUS.pending)
            runNetworkTest()
          }}
          >
            {I18n.t('enduser.rerun_check')}
          </Button>
        </Flex>
      </Flex>

    )
  }

  return (
    <Flex
      justify="center"
      className="mb-2"
      style={{ ...(!isMobile && { padding: '1rem' }), width: '100%', alignSelf: 'center' }}
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
          <Flex vertical gap={4} justify="end" style={{ width: '100%', padding: '1rem', minHeight: '300px' }}>
            {checkStatus === CHECK_STATUS.pending && (
              <Flex justify="center" align="center">
                <WifiLoader />
              </Flex>
            )}

            {checkStatus === CHECK_STATUS.passed && (
              <Flex
                gap={4}
                vertical
                justify="center"
                align="center"
                style={{
                  minHeight: '150px',
                }}
              >
                <CheckCircleOutlined style={{ color: 'var(--ant-success-color)', fontSize: '5rem' }} />
                <Typography.Text>
                  {I18n.t('enduser.internet_speed_optimal')}
                </Typography.Text>
              </Flex>
            )}

            <Flex justify="space-evenly" className="mb-4" style={{ width: '100%' }}>
              <Skeleton
                active
                style={{ width: '20%' }}
                title
                paragraph={false}
                loading={checkStatus === CHECK_STATUS.pending}
              >
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
              </Skeleton>

              <Divider style={{ height: 'auto', borderColor: 'var(--light-grey-border)' }} orientation="vertical" />
              <Skeleton
                active
                title
                style={{ width: '20%' }}
                paragraph={false}
                loading={checkStatus === CHECK_STATUS.pending}
              >
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
              </Skeleton>
            </Flex>

            {checkStatus === CHECK_STATUS.passed && (
              <>
                <Divider
                  style={{ height: 'auto', borderColor: 'var(--light-grey-border)' }}
                  className="mt-0"
                />
                <Flex justify="space-evenly" style={{ width: '100%', marginBottom: '1rem' }}>
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
          <Flex gap={8} vertical style={{ width: '100%', padding: '1rem' }}>
            <Flex justify="space-between">
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
              />
            </Flex>
            <AlertNotification errorMessageList={errorMessageList} />
          </Flex>
        )}
      </Flex>

      <Flex style={{ width: '100%' }} justify="space-between">
        <Button icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
          {I18n.t('enduser.back')}
        </Button>

        <Flex justify="end" gap={12}>
          {checkStatus !== CHECK_STATUS.pending && (
            <Button
              icon={<RedoOutlined />}
              onClick={() => {
                countDownButtonRef.current?.reset()
                setCheckStatus(CHECK_STATUS.pending)
                runNetworkTest()
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

export const NetworkCheck = connector(NetworkCheckComponent)

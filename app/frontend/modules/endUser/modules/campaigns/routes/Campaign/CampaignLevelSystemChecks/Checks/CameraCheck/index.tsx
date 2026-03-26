/* eslint-disable max-len */
import {
  useState, useEffect, useMemo, useContext, useRef,
} from 'react'
import { useSelector, useDispatch, connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Flex, Spin, Typography, Button,
} from 'antd'
import { MediaQueryContext } from '~/glint'
import { VideoCheck } from './VideoCheck'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  useAddSystemCheckRecordMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import {
  VideoCameraOutlined, ExclamationCircleOutlined, ArrowLeftOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import { CHECK_STATUS, CHECK_TYPE } from '../../common'
import { PermissionDenied } from './PermissionDenied'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { SystemCheckAddedRecord } from '~/modules/endUser/modules/campaigns/core/systemChecks/interfaces'
import commonStyles from '../../common-styles.less'
import { CountdownButton, CountdownButtonRef } from '../../components/CountdownButton'
import { SuccessTag, FailureTag, PendingTag } from '../../components/StatusTags'

const { I18n } = window
const connector = connect(null,
  {
    fetchCampaign,
  })
export const CameraCheckComponent = ({ onPrev, onNext, fetchCampaign }) => {
  const [isLoading, setIsLoading] = useState(true)

  const [recordId, setRecordId] = useState<string | null>(null)

  const [checkStatus, setCheckStatus] = useState<CHECK_STATUS>(CHECK_STATUS.pending)

  const [isDeviceRequestGranted, setIsDeviceRequestGranted] = useState<boolean>(true)

  const dispatch = useDispatch()

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { systemCheckSessionId = null, campaignOptions } = campaignDetailsForSystemCheck || {}

  const { campaignId } = useParams() as { campaignId: string}

  const { isMobile } = useContext(MediaQueryContext)

  const countDownButtonRef = useRef<CountdownButtonRef>(null)

  const [addSystemCheckRecord] = useAddSystemCheckRecordMutation()
  const {
    data:
    systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId })

  useEffect(() => {
    const generateRecordId = async () => {
      const recordResponse = await addSystemCheckRecord({
        campaignId,
        record: {
          checkType: CHECK_TYPE.video,
          passed: false,
          data: {},
        },
      })

      return recordResponse
    }
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

          generateRecordId().then(({ data }: {data: SystemCheckAddedRecord}) => {
            setRecordId(data.id.toString())
          })
        }
      }).finally(() => {
        setIsLoading(false)
      })
    } else {
      generateRecordId().then(({ data }: {data: SystemCheckAddedRecord}) => {
        setRecordId(data.id.toString())
      })
    }
  }, [systemCheckRequirementsStatus])

  useEffect(() => {
    if (recordId) {
      setIsLoading(false)
    }
  }, [recordId])


  const handleNext = async () => {
    setIsLoading(true)
    await addSystemCheckRecord({
      campaignId,
      record: {
        checkType: CHECK_TYPE.video,
        passed: checkStatus === CHECK_STATUS.passed,
        data: {},
      },
    })

    dispatch(actions.setSystemCheckStatusPassed(checkStatus === CHECK_STATUS.passed))

    setIsLoading(false)
    onNext()
  }

  const directUploadURL = useMemo(() => {
    if (recordId) {
      return `${location.origin}/campaigns/${campaignId}/system_check_records/${recordId}/upload_video_url`
    }
    return null
  }, [recordId])

  const postRecordingCallbackURL = useMemo(() => {
    if (recordId) {
      return `${location.origin}/campaigns/${campaignId}/system_check_records/${recordId}/complete_multipart_upload`
    }
    return null
  }, [recordId])

  return (
    <Flex
      justify="center"
      vertical
      gap={8}
      style={{ ...(!isMobile && { padding: '1rem' }), width: '100%', alignSelf: 'center' }}
    >
      <Flex justify="space-between">
        <Flex gap={8}>
          <VideoCameraOutlined style={{ fontSize: '1.5rem', color: 'var(--ant-primary-color)', alignSelf: 'flex-start' }} />
          <Flex vertical>
            <h4 className="mt-0 mb-2">
              {I18n.t('enduser.camera_check')}
            </h4>
            <Typography.Text className="mb-4">
              {I18n.t('enduser.camera_check_description')}
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

      {!isDeviceRequestGranted && <PermissionDenied handleNext={handleNext} />}

      {checkStatus === CHECK_STATUS.failed ? (

        isDeviceRequestGranted && (
          <>
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
                <h4 className="mt-0">
                  {I18n.t('enduser.error_uploading_video')}
                </h4>
              </Flex>

            </Flex>

            <Flex style={{ width: '100%' }} justify="space-between">
              <Button className="mt-2" icon={<ArrowLeftOutlined />} onClick={onPrev}>
                {I18n.t('enduser.back')}
              </Button>
              <Flex justify="end" gap={4} className="mt-2">
                <Button onClick={() => {
                  countDownButtonRef.current?.reset()
                  setCheckStatus(CHECK_STATUS.pending)
                }}
                >
                  {I18n.t('enduser.rerun_check')}
                </Button>

                <CountdownButton
                  disabled={!campaignOptions?.allowContinueWithWarning}
                  label={I18n.t('shared.continue')}
                  handleContinue={handleNext}
                  ref={countDownButtonRef}
                />
              </Flex>
            </Flex>
          </>
        )
      ) : (
        <>
          {isLoading
          && <Spin />}
          {!isLoading
          && (
            <VideoCheck
              directUploadURL={directUploadURL || ''}
              postRecordingCallbackURL={postRecordingCallbackURL || ''}
              nextStep={handleNext}
              setCheckStatus={setCheckStatus}
              setIsDeviceRequestGranted={setIsDeviceRequestGranted}
            />
          )}
        </>

      )}
    </Flex>
  )
}

export const CameraCheck = connector(CameraCheckComponent)

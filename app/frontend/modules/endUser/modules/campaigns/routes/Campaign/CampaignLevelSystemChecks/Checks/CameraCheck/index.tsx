/* eslint-disable max-len */
import {
  useState, useEffect, useMemo,
} from 'react'
import { useSelector, useDispatch, connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Flex, Typography, Button, Skeleton,
} from 'antd'
import { ButtonWithArrow, DirectionalBackArrowIcon } from '~/glint'
import { VideoCheck } from './VideoCheck'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  useAddSystemCheckRecordMutation, useUpdateSystemCheckRecordMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import {
  VideoCameraOutlined, ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import { CHECK_STATUS, CHECK_TYPE, InternationalizedDetails } from '../../common'
import { PermissionDenied } from '../../components/PermissionDenied'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import commonStyles from '../../common-styles.less'
import { SuccessTag, FailureTag, PendingTag } from '../../components/StatusTags'
import { SystemCheckAddedRecord } from '~/modules/endUser/modules/campaigns/core/systemChecks/interfaces'

const { I18n } = window
const connector = connect(null,
  {
    fetchCampaign,
  })
export const CameraCheckComponent = ({ onPrev, onNext, fetchCampaign }) => {
  const [isLoading, setIsLoading] = useState(true)

  const [recordId, setRecordId] = useState<string | null>(null)

  const [checkStatus, setCheckStatus] = useState<CHECK_STATUS>(CHECK_STATUS.pending)

  const [failureReason, setFailureReason] = useState<string | null>(null)

  const [isDeviceRequestGranted, setIsDeviceRequestGranted] = useState<boolean>(true)

  const dispatch = useDispatch()

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { systemCheckSessionId = null } = campaignDetailsForSystemCheck || {}

  const { campaignId } = useParams() as { campaignId: string}

  const [addSystemCheckRecord] = useAddSystemCheckRecordMutation()
  const [updateSystemCheckRecord] = useUpdateSystemCheckRecordMutation()
  const {
    data:
    systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId }, { refetchOnMountOrArgChange: true })

  const generateRecordId = async () => {
    try {
      const recordResponse = await addSystemCheckRecord({
        campaignId,
        record: {
          checkType: CHECK_TYPE.video,
          passed: false,
          data: {},
        },
      }).unwrap()

      return recordResponse
    } catch (e) {
      return null
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

          generateRecordId().then((data: SystemCheckAddedRecord | null) => {
            if (data) {
              setRecordId(data.id.toString())
            }
          })
        }
      }).finally(() => {
        setIsLoading(false)
      })
    } else {
      generateRecordId().then((data: SystemCheckAddedRecord | null) => {
        if (data) {
          setRecordId(data.id.toString())
        }
      })
    }
  }, [systemCheckRequirementsStatus])

  useEffect(() => {
    if (recordId) {
      setIsLoading(false)
    }
  }, [recordId])

  const generateDetails = () => {
    const details:InternationalizedDetails[] = []

    if (!isDeviceRequestGranted) {
      details.push({
        i18nKey: 'enduser.camera_access_blocked',
        i18nVars: [],
      })
    } else if (checkStatus === CHECK_STATUS.failed) {
      details.push({
        i18nKey: failureReason || 'enduser.error_uploading_video_detail',
        i18nVars: [],
      })
    } else {
      details.push({
        i18nKey: 'enduser.camera_check_passed',
        i18nVars: [],
      })
    }

    return details
  }

  const onCheckAbruptlyEnded = () => {
    if (checkStatus === CHECK_STATUS.pending) {
      setFailureReason('enduser.camera_check_abruptly_ended')
      setCheckStatus(CHECK_STATUS.failed)
    }
  }

  const handleNext = async () => {
    setIsLoading(true)
    await updateSystemCheckRecord({
      campaignId,
      recordId: recordId!,
      record: {
        passed: checkStatus === CHECK_STATUS.passed,
        data: {
          details: generateDetails(),
        },
      },
    })

    dispatch(actions.setSystemCheckStatusPassed(checkStatus === CHECK_STATUS.passed))
    setIsLoading(false)
    onNext()
  }

  const directUploadURL = useMemo(() => {
    if (recordId) {
      return `${location.origin}/campaigns/${campaignId}/system_check_records/${recordId}/upload_media_url`
    }
    return null
  }, [recordId])

  const postRecordingCallbackURL = useMemo(() => {
    if (recordId) {
      return `${location.origin}/campaigns/${campaignId}/system_check_records/${recordId}/complete_multipart_upload`
    }
    return null
  }, [recordId])

  if (!isDeviceRequestGranted) {
    return <PermissionDenied handleNext={handleNext} checkType={CHECK_TYPE.video} />
  }

  return (
    <Flex
      justify="center"
      vertical
      gap={8}
      style={{ width: '100%', alignSelf: 'center' }}
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
                  {I18n.t('enduser.camera_check_failed')}
                </h4>
                <Typography.Text type="secondary">
                  {failureReason ? I18n.t(failureReason) : I18n.t('enduser.error_uploading_video_detail')}
                </Typography.Text>
              </Flex>

            </Flex>

            <Flex style={{ width: '100%' }} justify="space-between">
              <Button className="mt-2" icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
                {I18n.t('enduser.back')}
              </Button>
              <Flex justify="end" gap={4} className="mt-2">
                <Button onClick={() => {
                  setCheckStatus(CHECK_STATUS.pending)
                  setFailureReason(null)
                }}
                >
                  {I18n.t('enduser.rerun_check')}
                </Button>

                <ButtonWithArrow
                  type="primary"
                  style={{ alignSelf: 'flex-end' }}
                  label={I18n.t('shared.continue')}
                  onClick={handleNext}
                />
              </Flex>
            </Flex>
          </>
        )
      ) : (
        <>
          {isLoading ? (
            <Skeleton.Input
              active
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <VideoCheck
              directUploadURL={directUploadURL || ''}
              postRecordingCallbackURL={postRecordingCallbackURL || ''}
              nextStep={handleNext}
              onPrev={onPrev}
              setCheckStatus={setCheckStatus}
              setIsDeviceRequestGranted={setIsDeviceRequestGranted}
              onCheckAbruptlyEnded={onCheckAbruptlyEnded}
              setFailureReason={setFailureReason}
              faceDetectionEnabled={
                systemCheckRequirementsStatus?.requirements?.video?.faceDetectionEnabled ?? false
              }
              phraseVerificationEnabled={
                systemCheckRequirementsStatus?.requirements?.video?.phraseVerificationEnabled ?? false
              }
            />
          )}
        </>
      )}
    </Flex>
  )
}


export const CameraCheck = connector(CameraCheckComponent)

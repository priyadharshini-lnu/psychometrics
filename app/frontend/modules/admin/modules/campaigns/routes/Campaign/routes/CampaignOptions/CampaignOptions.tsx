import React, { useEffect, useState, useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Row, Col, Radio, Tooltip, InputRef, Input, Button, Flex, message,
} from 'antd'
import snakeCase from 'lodash/snakeCase'
import {
  QuestionCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import { RootState } from '~/modules/admin/core/rootReducers'
import { CampaignOptions as ICampaignOptions } from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import {
  fetch,
  update,
  get as getCampaignOptions,
} from '~/modules/admin/modules/campaigns/core/campaignOptions'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import InputDuration from '~/components/InputDuration'
import Section from '~/modules/admin/components/Options/Section'
import Option from '~/modules/admin/components/Options/Expandable'
import { getFeatures } from '~/core/config'
import Instructions from './Instructions'
import { Description } from './Description'
import { MaskedInput } from '~/glint'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    options: getCampaignOptions(state),
    features: getFeatures(state),
  }),
  {
    fetch,
    update,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  options: ICampaignOptions
}

type Props = OwnProps & PropsFromRedux

const PROCTORING_LEVEL_TYPES = {
  selective: 'selective',
  all: 'all',
  allExceptWorkshopActivities: 'allExceptWorkshopActivities',
}

const CampaignOptions: React.FC<Props> = ({
  options,
  fetch,
  update,
  features,
}) => {
  const { projectId, campaignId } = useParams() as { projectId: string, campaignId: string }
  const [watermarkContent, setWatermarkContent] = useState<string>('')

  const [localFixedTime, setLocalFixedTime] = useState<boolean>(false)

  const [isEditingDownloadSpeed, setIsEditingDownloadSpeed] = useState<boolean>(false)
  const [isEditingUploadSpeed, setIsEditingUploadSpeed] = useState<boolean>(false)
  const [isEditingFaceDetectionRatio, setIsEditingFaceDetectionRatio] = useState<boolean>(false)
  const [downloadSpeed, setDownloadSpeed] = useState<number>(options.calculatedMinimumDownloadSpeed)
  const [uploadSpeed, setUploadSpeed] = useState<number>(options.calculatedMinimumUploadSpeed)
  const [faceDetectionRatio, setFaceDetectionRatio] = useState<number>(options.minimumFaceDetectionRatio ?? 85)

  const inputDurationRef = useRef<InputRef>(null)

  const inputValidityRef = useRef<InputRef>(null)

  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)

  const identifications = I18n.t('admin.proctoring_identifications')
  const integrationTypes = I18n.t('admin.proctoring_integration_types')
  const proctoringTypes = I18n.t('admin.proctoring_types')

  useEffect(() => {
    fetch(parsedProjectId, parsedCampaignId)
  }, [])

  useEffect(() => {
    setWatermarkContent(options.watermarkContent || '')
  }, [options.watermarkContent])

  useEffect(() => {
    setDownloadSpeed(options.minimumDownloadSpeed ?? options.calculatedMinimumDownloadSpeed)
    setUploadSpeed(options.minimumUploadSpeed ?? options.calculatedMinimumUploadSpeed)
  }, [options.calculatedMinimumDownloadSpeed, options.calculatedMinimumUploadSpeed])

  useEffect(() => {
    if (options && Object.keys(options).length > 0) {
      setLocalFixedTime(options.fixedTime || false)
    }
  }, [options.fixedTime])

  const sendFixedTimeUpdate = (fixedTimeValue: boolean, durationValue: number) => {
    if (!fixedTimeValue || (fixedTimeValue && durationValue > 0)) {
      update(
        parsedProjectId, parsedCampaignId, {
          ...options,
          fixedTime: fixedTimeValue,
          fixedTimeDuration: durationValue,
          ...(fixedTimeValue ? {} : { selectiveProctoringEnabled: options.proctoringEnabled === true }),
          enableMobileProctoring: fixedTimeValue ? options.enableMobileProctoring : false,
        },
      )
    }
  }

  const parametersForField = name => ({
    value: (options || {})[name],
    onChange: (value: string | number) => update(
      parsedProjectId, parsedCampaignId, { ...options, [name]: value },
    ),
  })

  const parametersForFixedTimeField = () => ({
    value: localFixedTime,
    onChange: (value: boolean) => {
      setLocalFixedTime(value)

      if (!value) {
        sendFixedTimeUpdate(value, 0)
      } else {
        requestAnimationFrame(() => {
          inputDurationRef.current?.focus()
        })
      }
    },
  })

  const parametersForWorkshopInviteRequiresPreworkCompletionField = () => ({
    value: options?.workshopInviteRequiresPreworkCompletion || false,
    onChange: (value: boolean) => update(
      parsedProjectId, parsedCampaignId, {
        ...options,
        workshopInviteRequiresPreworkCompletion: value,
      },
    ),
  })

  const parametersForWorkshopBookingRequiresPreworkCompletionField = () => ({
    value: (options || {}).workshopBookingRequiresPreworkCompletion,
    onChange: (value: boolean) => update(
      parsedProjectId, parsedCampaignId, {
        ...options,
        workshopBookingRequiresPreworkCompletion: value,
      },
    ),
  })

  const parametersForShowWatermark = () => ({
    value: (options || {}).showWatermark,
    onChange: (value: boolean) => {
      update(
        parsedProjectId, parsedCampaignId, {
          ...options,
          showWatermark: value,
        },
      )
    },
  })

  const handleWatermarkContentChange = (e) => {
    const {
      target: { value },
    } = e
    setWatermarkContent(value)
  }

  const parametersWatermarkContent = ({
    value: watermarkContent,
    defaultValue: options.watermarkContent,
    onBlur: () => {
      update(
        parsedProjectId,
        parsedCampaignId,
        { ...options, watermarkContent },
      )
    },
    onChange: handleWatermarkContentChange,
  })

  const parametersForFixedTimeDuration = ({
    value: options.fixedTimeDuration ? options.fixedTimeDuration : 0,
    onChange: (value: number) => {
      if (value === 0 && localFixedTime) {
        setLocalFixedTime(false)
        sendFixedTimeUpdate(false, 0)
      } else if (value > 0) {
        sendFixedTimeUpdate(localFixedTime, value)
      }
    },
    ref: inputDurationRef,
  })

  const parametersForSystemCheckValidity = ({
    value: options.systemCheckValidity ? options.systemCheckValidity : '15m',
    onChange: (value: number) => {
      update(
        parsedProjectId, parsedCampaignId, {
          ...options,
          systemCheckValidity: value,
        },
      ).catch((e) => {
        message.error(e.systemCheckValidity[0])
      })
    },
    ref: inputValidityRef,
  })

  const parametersForRules = name => ({
    value: !!(options.rules || {})[name],
    onChange: (value: boolean) => update(
      parsedProjectId, parsedCampaignId, { ...options, rules: { ...options.rules, [name]: value } },
    ),
  })

  const saveIdentificationType = (e) => {
    const { value } = e.target
    update(parsedProjectId, parsedCampaignId, { ...options, identification: value })
  }

  const saveProctoringType = (e) => {
    const { value } = e.target
    update(parsedProjectId, parsedCampaignId, { ...options, proctoringType: value })
  }

  const saveIntegrationType = (e) => {
    const { value } = e.target
    update(parsedProjectId, parsedCampaignId, { ...options, integrationType: value })
  }

  const parametersForEnableProctoring = name => ({
    value: (options || {})[name],
    onChange: (value: string | number) => update(
      parsedProjectId, parsedCampaignId,
      {
        ...options,
        [name]: value,
        proctoringEnabledOnWorkshopActivity: (value && localFixedTime)
          ? true
          : (options.proctoringEnabledOnWorkshopActivity || false),
        selectiveProctoringEnabled: (value && !localFixedTime)
          ? true
          : (options.selectiveProctoringEnabled || false),
      },
    ),
  })

  return (
    <div className="pt-4 pb-4 ps-4 pe-4">
      <Section>
        <div className="mbl">
          <Row>
            <Col span={24}>
              <Row>
                <Col span={2}>
                  <label>{I18n.t('admin.time_zone')}</label>
                </Col>
                <Col span={8}>
                  <TimeZoneSelect
                    {...parametersForField('timeZone')}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <Option
          label={I18n.t('admin.fixed_time')}
          {...parametersForFixedTimeField()}
        />

        <div style={{ display: localFixedTime ? 'block' : 'none' }}>
          <div className="mbl">
            <Row>
              <Col span={24}>
                <Row align="middle">
                  <Col span={5} offset={2}>
                    <InputDuration
                      masked
                      placeholder={I18n.t('admin.components_input_duration_placeholder')}
                      {...parametersForFixedTimeDuration}
                    />
                  </Col>
                  <Col>
                    <Tooltip title={I18n.t('admin.components_input_duration_placeholder')}>
                      <span><QuestionCircleOutlined className="ms-4" /></span>
                    </Tooltip>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
        <div style={{ display: features.proctoring ? 'block' : 'none' }}>
          <Option
            label={I18n.t('admin.proctoring_enable')}
            {...parametersForEnableProctoring('proctoringEnabled')}
          />
          {options.proctoringEnabled && (
            <>
              <div className="mbl">
                <Row>
                  <Col span={22} offset={2}>
                    <Radio.Group
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === PROCTORING_LEVEL_TYPES.selective) {
                          return update(parsedProjectId, parsedCampaignId, {
                            ...options,
                            selectiveProctoringEnabled: true,
                            proctoringEnabledOnWorkshopActivity: false,
                          })
                        }
                        if (val === PROCTORING_LEVEL_TYPES.all) {
                          return update(parsedProjectId, parsedCampaignId, {
                            ...options,
                            selectiveProctoringEnabled: false,
                            proctoringEnabledOnWorkshopActivity: true,
                          })
                        }
                        return update(parsedProjectId, parsedCampaignId, {
                          ...options,
                          selectiveProctoringEnabled: false,
                          proctoringEnabledOnWorkshopActivity: false,
                        })
                      }}
                      value={(() => {
                        if (!localFixedTime) return PROCTORING_LEVEL_TYPES.selective
                        if (options.selectiveProctoringEnabled) return PROCTORING_LEVEL_TYPES.selective
                        if (options.proctoringEnabledOnWorkshopActivity) return PROCTORING_LEVEL_TYPES.all
                        return PROCTORING_LEVEL_TYPES.allExceptWorkshopActivities
                      })()}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Radio value={PROCTORING_LEVEL_TYPES.all} disabled={!localFixedTime}>
                          {I18n.t('admin.proctoring_mode_all')}
                          {!localFixedTime && (
                            <Tooltip title={I18n.t('admin.proctoring_fixed_time_required')}>
                              <span><InfoCircleOutlined className="ms-2" /></span>
                            </Tooltip>
                          )}
                        </Radio>
                        <Radio value={PROCTORING_LEVEL_TYPES.allExceptWorkshopActivities} disabled={!localFixedTime}>
                          {I18n.t('admin.proctoring_mode_all_except_ac')}
                          {!localFixedTime && (
                            <Tooltip title={I18n.t('admin.proctoring_fixed_time_required')}>
                              <span><InfoCircleOutlined className="ms-2" /></span>
                            </Tooltip>
                          )}
                        </Radio>
                        <Radio value={PROCTORING_LEVEL_TYPES.selective}>
                          {I18n.t('admin.selective_proctoring')}
                        </Radio>
                      </div>
                    </Radio.Group>
                  </Col>
                </Row>
              </div>
              <Option
                label={I18n.t('admin.enable_mobile_proctoring')}
                {...parametersForField('enableMobileProctoring')}
              />

              <div>
                <Option
                  label={I18n.t('admin.proctoring_trial')}
                  {...parametersForField('proctoringTrial')}
                />
                <div className="mbl">
                  <Row>
                    <Col span={2}>
                      <label>{I18n.t('admin.proctoring_rules')}</label>
                    </Col>
                    <Col span={22}>
                      {Object.keys(options.rules || {}).map(
                        key => (
                          <Option
                            key={key}
                            label={
                              I18n.t(`admin.proctoring_rule_types_${snakeCase(key)}`)
                            }
                            {...parametersForRules(key)}
                          />
                        ),
                      )}
                    </Col>
                  </Row>
                </div>


                <div className="mbl">
                  <Row>
                    <Col span={24}>
                      <Row>
                        <Col span={2}>
                          <label>
                            {I18n.t('admin.proctoring_identification')}
                          </label>
                        </Col>
                        <Col span={22}>
                          <Radio.Group
                            defaultValue="passport"
                            onChange={saveIdentificationType}
                            value={options.identification}
                          >
                            {Object.entries(identifications).map(
                              ([key, value]) => <Radio key={key} value={key}>{value as string}</Radio>,
                            )}
                          </Radio.Group>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Row>
                        <Col span={2}>
                          <label>
                            {I18n.t('admin.proctoring_integration_type')}
                          </label>
                        </Col>
                        <Col span={22}>
                          <Radio.Group
                            defaultValue="iframe"
                            onChange={saveIntegrationType}
                            value={options.integrationType}
                          >
                            {Object.entries(integrationTypes).map(
                              ([key, value]) => <Radio key={key} value={key}>{value as string}</Radio>,
                            )}
                          </Radio.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Row>
                            <Col span={2}>
                              <label>
                                {I18n.t('admin.proctoring_type')}
                              </label>
                            </Col>
                            <Col span={22}>
                              <Radio.Group
                                defaultValue="offline"
                                onChange={saveProctoringType}
                                value={options.proctoringType}
                              >
                                {Object.entries(proctoringTypes).map(
                                  ([key, value]) => <Radio key={key} value={key}>{value as string}</Radio>,
                                )}
                              </Radio.Group>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mbl">

          <Option
            label={I18n.t('admin.enable_system_check')}
            {...parametersForField('systemCheckEnabled')}
          />

          {options.systemCheckEnabled && (
            <>
              <Row className="mbl" align="middle">
                <Col offset={2}>
                  <label>{I18n.t('admin.validity')}</label>
                </Col>
                <Col offset={1}>
                  <InputDuration
                    masked
                    placeholder={I18n.t('admin.components_input_duration_placeholder')}
                    {...parametersForSystemCheckValidity}
                  />
                </Col>
              </Row>

              <Row className="mbl" gutter={16} align="middle">
                <Col offset={2} span={22}>
                  <Option
                    label={I18n.t('admin.allow_continue_with_warning_system_check')}
                    {...parametersForField('allowContinueWithWarning')}
                  />
                </Col>
              </Row>

              <Row className="mbl" gutter={16} align="middle">
                <Col offset={2} span={22}>
                  <Option
                    label={I18n.t('admin.skip_assessment_level_checks')}
                    {...parametersForField('skipAssessmentLevelChecks')}
                  />
                </Col>
              </Row>

              <Row justify="start" className="mbl" align="middle">
                <Col flex="200px" offset={2}>
                  <label>{I18n.t('admin.minimum_download_speed')}</label>
                </Col>
                <Col flex="300px" offset={1}>
                  <Flex gap={4}>
                    <Input
                      style={{ width: '200px' }}
                      disabled={!isEditingDownloadSpeed}
                      value={downloadSpeed}
                      onChange={(e) => {
                        setDownloadSpeed(Number(e.target.value))
                        update(
                          parsedProjectId, parsedCampaignId,
                          { ...options, minimumDownloadSpeed: Number(e.target.value) },
                        )
                      }}
                    />
                    {!isEditingDownloadSpeed ? (
                      <EditOutlined
                        className="ms-2"
                        onClick={() => {
                          setIsEditingDownloadSpeed(true)
                        }}
                      />
                    ) : (
                      <Button type="link" onClick={() => setIsEditingDownloadSpeed(false)}>
                        {I18n.t('shared.save')}
                      </Button>
                    ) }
                  </Flex>
                </Col>
              </Row>

              <Row justify="start" className="mbl" align="middle">
                <Col flex="200px" offset={2}>
                  <label>{I18n.t('admin.minimum_upload_speed')}</label>
                </Col>
                <Col flex="300px" offset={1}>
                  <Flex gap={4}>
                    <Input
                      style={{ width: '200px' }}
                      disabled={!isEditingUploadSpeed}
                      value={uploadSpeed}
                      onChange={(e) => {
                        setUploadSpeed(Number(e.target.value))
                        update(
                          parsedProjectId, parsedCampaignId,
                          { ...options, minimumUploadSpeed: Number(e.target.value) },
                        )
                      }}
                    />
                    {!isEditingUploadSpeed ? (
                      <EditOutlined
                        className="ms-2"
                        onClick={() => {
                          setIsEditingUploadSpeed(true)
                        }}
                      />
                    ) : (
                      <Button type="link" onClick={() => setIsEditingUploadSpeed(false)}>
                        {I18n.t('shared.save')}
                      </Button>
                    )}
                  </Flex>

                </Col>
              </Row>

              <Row className="mbl" gutter={16} align="middle">
                <Col offset={2} span={22}>
                  <Option
                    label={I18n.t('admin.enable_face_detection')}
                    {...parametersForField('faceDetectionEnabled')}
                  />
                </Col>
              </Row>

              {options.faceDetectionEnabled && (
                <Row justify="start" className="mbl" align="middle">
                  <Col flex="200px" offset={4}>
                    <label>{I18n.t('admin.minimum_face_detection_ratio')}</label>
                  </Col>
                  <Col flex="300px" offset={1}>
                    <Flex gap={4} align="center">
                      <Input
                        style={{ width: '100px' }}
                        type="number"
                        min={0}
                        max={100}
                        disabled={!isEditingFaceDetectionRatio}
                        value={faceDetectionRatio}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, Number(e.target.value)))
                          setFaceDetectionRatio(value)
                          update(
                            parsedProjectId, parsedCampaignId,
                            { ...options, minimumFaceDetectionRatio: value },
                          )
                        }}
                        suffix="%"
                      />
                      {!isEditingFaceDetectionRatio ? (
                        <EditOutlined
                          className="ms-2"
                          onClick={() => {
                            setIsEditingFaceDetectionRatio(true)
                          }}
                        />
                      ) : (
                        <Button type="link" onClick={() => setIsEditingFaceDetectionRatio(false)}>
                          {I18n.t('shared.save')}
                        </Button>
                      )}
                    </Flex>
                  </Col>
                </Row>
              )}

              <Row className="mbl" gutter={16} align="middle">
                <Col offset={2} span={22}>
                  <Option
                    label={I18n.t('admin.enable_phrase_verification')}
                    {...parametersForField('phraseVerificationEnabled')}
                  />
                </Col>
              </Row>
            </>
          )}

        </div>

        <Option
          label={I18n.t('admin.prework_required')}
          {...parametersForWorkshopBookingRequiresPreworkCompletionField()}
        />
        <Option
          label={I18n.t('admin.prework_required_for_invite')}
          {...parametersForWorkshopInviteRequiresPreworkCompletionField()}
        />

        {!features?.disable_meeting_recording && (
          options.allowVideoCallRecording && (
            <>
              <Option
                label={I18n.t('admin.enable_video_call_recording')}
                {...parametersForField('enableVideoCallRecording')}
              />
              <Option
                label={I18n.t('admin.hide_participant_video')}
                {...parametersForField('hideParticipantVideo')}
              />
              <Option
                label={I18n.t('admin.disable_transcript_download')}
                {...parametersForField('disableTranscriptDownload')}
              />
            </>
          )
        )}

        <Option
          label={I18n.t('admin.show_watermark')}
          {...parametersForShowWatermark()}
        />

        {
          options.showWatermark ? (
            <Row>
              <Col span={5} offset={2}>
                <MaskedInput
                  masked
                  zIndex={{
                    input: 5003,
                    backdrop: 5002,
                  }}
                  className="mbl"
                  placeholder={I18n.t('admin.watermark_content')}
                  {...parametersWatermarkContent}
                />
              </Col>
              <Col>
                <Tooltip
                  title={(
                    <SafeHTML
                      html={I18n.lookup('admin.watermark_info')}
                    />
                  )}
                >
                  <span>
                    <QuestionCircleOutlined className="ms-4" />
                  </span>
                </Tooltip>
              </Col>
            </Row>
          ) : null
        }

        <Option
          label={I18n.t('admin.instructions_enable')}
          {...parametersForField('instructionsEnabled')}
        />

        {options.instructionsEnabled && <Instructions projectId={parsedProjectId} campaignId={parsedCampaignId} />}

        {options.manageWebhookSettings && (
          <div className="mbl">
            <Option
              label={I18n.t('admin.disable_webhooks')}
              {...parametersForField('disableWebhooks')}
            />
            <Row>
              <Col span={22} offset={2}>
                <span className="text-muted">{I18n.t('admin.disable_webhooks_hint')}</span>
              </Col>
            </Row>
          </div>
        )}

        <div className="mb-8 mt-8">
          <h4>{I18n.t('shared.description')}</h4>
          <Description projectId={parsedProjectId} campaignId={parsedCampaignId} />
        </div>
      </Section>
    </div>
  )
}

export default connector(CampaignOptions)

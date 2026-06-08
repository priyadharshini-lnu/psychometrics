import { useState, useEffect, useRef } from 'react'
import {
  Row, Col, Tooltip, Input, Button, Flex,
} from 'antd'
import { QuestionCircleOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'
import { MaskedInput } from '~/glint'
import InputDuration from '~/components/InputDuration'

const { I18n } = window

export default function GlobalSection ({
  options,
  updateParticipantOptions,
}) {
  const [watermarkContent, setWatermarkContent] = useState(options.watermarkContent)
  const OBJECT_KEY = 'global'
  const inputDurationRef = useRef(null)

  const [isEditingDownloadSpeed, setIsEditingDownloadSpeed] = useState(false)
  const [isEditingUploadSpeed, setIsEditingUploadSpeed] = useState(false)
  const [isEditingFaceDetectionRatio, setIsEditingFaceDetectionRatio] = useState(false)
  const [downloadSpeed, setDownloadSpeed] = useState(options.calculatedMinimumDownloadSpeed)
  const [uploadSpeed, setUploadSpeed] = useState(options.calculatedMinimumUploadSpeed)
  const [faceDetectionRatio, setFaceDetectionRatio] = useState(options.minimumFaceDetectionRatio ?? 85)

  useEffect(() => {
    setWatermarkContent(options.watermarkContent || '')
  }, [options.watermarkContent])

  useEffect(() => {
    setDownloadSpeed(options.minimumDownloadSpeed || options.calculatedMinimumDownloadSpeed)
    setUploadSpeed(options.minimumUploadSpeed || options.calculatedMinimumUploadSpeed)
  }, [options.calculatedMinimumDownloadSpeed, options.calculatedMinimumUploadSpeed])

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

  const parametersForSystemCheckValidity = ({
    value: options.systemCheckValidity ? options.systemCheckValidity : '1d',
    onChange: (value) => {
      updateParticipantOptions([OBJECT_KEY, 'systemCheckValidity'], value)
    },
    ref: inputDurationRef,
  })

  return (
    <OptionSection label={I18n.t('admin.options_global')}>
      <ExpandableOption
        label={I18n.t('threesixty.options.global.cannot_re_edit')}
        {...parametersForSwitch('canNotEditEvaluation')}
      />
      <ExpandableOption
        label={I18n.t('threesixty.options.global.disable_all_evaluations')}
        {...parametersForSwitch('disableAllEvaluations')}
      />
      <ExpandableOption
        label={I18n.t('admin.show_watermark')}
        {...parametersForSwitch('showWatermark')}
      />
      {
        options.showWatermark && (
          <Row>
            <Col offset={2} span={6}>
              <MaskedInput
                className="mbl"
                masked
                placeholder={I18n.t('admin.watermark_content')}
                value={watermarkContent}
                onBlur={() => updateParticipantOptions([OBJECT_KEY, 'watermarkContent'], watermarkContent)}
                onChange={e => setWatermarkContent(e.target.value)}
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
        )
      }
      <ExpandableOption
        label={I18n.t('admin.enable_system_check')}
        {...parametersForSwitch('systemCheckEnabled')}
      />
      {
          options.systemCheckEnabled
        && (
          <>
            <Row className="mb-4" align="middle">
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
            <Row gutter={16} align="top">
              <Col offset={2} span={22}>
                <ExpandableOption
                  label={I18n.t('admin.allow_continue_with_warning_system_check')}
                  {...parametersForSwitch('allowContinueWithWarning')}
                />
              </Col>
            </Row>

            <Row className="mbl" align="middle">
              <Col flex="200px" offset={2}>
                <label>{I18n.t('admin.minimum_download_speed')}</label>
              </Col>
              <Col offset={1}>
                <Flex flex="300px" gap={4}>
                  <Input
                    style={{ width: '200px' }}
                    disabled={!isEditingDownloadSpeed}
                    value={downloadSpeed}
                    onChange={(e) => {
                      setDownloadSpeed(Number(e.target.value))
                      updateParticipantOptions([OBJECT_KEY,
                        'minimumDownloadSpeed'], Number(e.target.value))
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

            <Row className="mbl" align="middle">
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
                      updateParticipantOptions([OBJECT_KEY,
                        'minimumUploadSpeed'], Number(e.target.value))
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

            <Row gutter={16} align="top">
              <Col offset={2} span={22}>
                <ExpandableOption
                  label={I18n.t('admin.enable_face_detection')}
                  {...parametersForSwitch('faceDetectionEnabled')}
                />
              </Col>
            </Row>

            {options.faceDetectionEnabled && (
              <Row className="mbl" align="middle">
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
                        updateParticipantOptions([OBJECT_KEY,
                          'minimumFaceDetectionRatio'], value)
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

            <Row gutter={16} align="top">
              <Col offset={2} span={22}>
                <ExpandableOption
                  label={I18n.t('admin.enable_phrase_verification')}
                  {...parametersForSwitch('phraseVerificationEnabled')}
                />
              </Col>
            </Row>
          </>
        )}
    </OptionSection>
  )
}

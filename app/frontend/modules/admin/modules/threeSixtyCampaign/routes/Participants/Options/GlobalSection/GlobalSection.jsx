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
  const [downloadSpeed, setDownloadSpeed] = useState(options.calculatedMinimumDownloadSpeed)
  const [uploadSpeed, setUploadSpeed] = useState(options.calculatedMinimumUploadSpeed)

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
    <OptionSection label={I18n.t('administration.threesixty_campaigns.menu.participants.options.global')}>
      <ExpandableOption
        label={I18n.t('threesixty.options.global.cannot_re_edit')}
        {...parametersForSwitch('canNotEditEvaluation')}
      />
      <ExpandableOption
        label={I18n.t('threesixty.options.global.disable_all_evaluations')}
        {...parametersForSwitch('disableAllEvaluations')}
      />
      <ExpandableOption
        label={I18n.t('administration.campaigns.options.show_watermark')}
        {...parametersForSwitch('showWatermark')}
      />
      {
        options.showWatermark && (
          <Row>
            <Col offset={2} span={6}>
              <MaskedInput
                className="mbl"
                masked
                placeholder={I18n.t('administration.campaigns.options.watermark_content')}
                value={watermarkContent}
                onBlur={() => updateParticipantOptions([OBJECT_KEY, 'watermarkContent'], watermarkContent)}
                onChange={e => setWatermarkContent(e.target.value)}
              />
            </Col>
            <Col>
              <Tooltip
                title={(
                  <SafeHTML
                    html={I18n.lookup('administration.campaigns.options.watermark_info')}
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
                  placeholder={I18n.t('administration.components.input_duration.placeholder')}
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
                      Save
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
                      Save
                    </Button>
                  )}
                </Flex>
              </Col>
            </Row>
          </>
        )}
    </OptionSection>
  )
}

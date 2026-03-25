import { useState, useEffect } from 'react'
import {
  Row, Col, Tooltip,
} from 'antd'
import { QuestionCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'
import { MaskedInput } from '~/glint'

const { I18n } = window

export default function GlobalSection ({
  options,
  updateParticipantOptions,
}) {
  const [watermarkContent, setWatermarkContent] = useState(options.watermarkContent)
  const OBJECT_KEY = 'global'
  // const inputDurationRef = useRef(null)

  useEffect(() => {
    setWatermarkContent(options.watermarkContent || '')
  }, [options.watermarkContent])

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

  // const parametersForSystemCheckValidity = ({
  //   value: options.systemCheckValidity ? options.systemCheckValidity : '1d',
  //   onChange: (value) => {
  //     updateParticipantOptions([OBJECT_KEY, 'systemCheckValidity'], value)
  //   },
  //   ref: inputDurationRef,
  // })

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
      {/* <ExpandableOption
        label={I18n.t('admin.enable_system_check')}
        {...parametersForSwitch('systemCheckEnabled')}
      /> */}
      {/* {
                          options.systemCheckEnabled
                       && (
                         <>

                           <Row align="middle">
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
                           <Row className="mbl" gutter={16} align="middle">
                             <Col offset={2} span={22}>
                               <ExpandableOption
                                 label={I18n.t('admin.allow_continue_with_warning_system_check')}
                                 {...parametersForSwitch('allowContinueWithWarning')}
                               />
                             </Col>
                           </Row>

                           <Row className="mbl" align="middle">
                             <Col offset={2}>
                               <label>{I18n.t('admin.minimum_download_speed')}</label>
                             </Col>
                             <Col offset={1}>
                               <Input
                                 value={options.minimumDownloadSpeed ? options.minimumDownloadSpeed : 0}
                                 onChange={e => updateParticipantOptions([OBJECT_KEY,
                                   'minimumDownloadSpeed'], Number(e.target.value))}
                               />
                             </Col>
                           </Row>

                           <Row className="mbl" align="middle">
                             <Col offset={2}>
                               <label>{I18n.t('admin.minimum_upload_speed')}</label>
                             </Col>
                             <Col offset={1}>
                               <Input
                                 value={options.minimumUploadSpeed ? options.minimumUploadSpeed : 0}
                                 onChange={e => updateParticipantOptions([OBJECT_KEY,
                                   'minimumUploadSpeed'], Number(e.target.value))}
                               />
                             </Col>
                           </Row>
                         </>

                       )} */}
    </OptionSection>
  )
}

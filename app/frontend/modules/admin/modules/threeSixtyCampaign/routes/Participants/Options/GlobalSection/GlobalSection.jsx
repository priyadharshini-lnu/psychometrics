import { useState, useEffect } from 'react'
import { Row, Col, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

import { SafeHTML } from '~/components/SafeHTML'
import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'
import { MaskedInput } from '~/glint'

export default function GlobalSection ({
  options,
  updateParticipantOptions,
}) {
  const [watermarkContent, setWatermarkContent] = useState(options.watermarkContent)
  const OBJECT_KEY = 'global'

  useEffect(() => {
    setWatermarkContent(options.watermarkContent || '')
  }, [options.watermarkContent])

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Global Options">
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
                <QuestionCircleOutlined className="ms-4" />
              </Tooltip>
            </Col>
          </Row>
        )
      }
    </OptionSection>
  )
}

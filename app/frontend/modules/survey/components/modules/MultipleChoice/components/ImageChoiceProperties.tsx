import { FC } from 'react'
import {
  Checkbox,
  Space,
  Typography,
  Radio,
  Divider,
  RadioChangeEvent,
} from 'antd'

import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { PropertiesModel } from '~/modules/survey/interfaces/questions/MultipleChoice'

const { I18n } = window

interface Props {
  isEnabled: PropertiesModel['props']['withImageChoice']
  onImageEnableChange(event: CheckboxChangeEvent): void
  isPreviewEnabled: PropertiesModel['props']['isImagePreviewEnable']
  onPreviewOptionChange(event: CheckboxChangeEvent): void
  size: PropertiesModel['props']['imageChoiceSize']
  onSizeChange(event: RadioChangeEvent): void
}

export const ImageChoiceProperties: FC<Props> = ({
  isEnabled,
  isPreviewEnabled,
  onImageEnableChange,
  onPreviewOptionChange,
  size,
  onSizeChange,
}) => (
  <>
    <div className="ms-4 me-4">
      <Checkbox checked={isEnabled} onChange={onImageEnableChange}>
        {I18n.t(
          'administration.survey_builder.property_panel.image_multi_choice_properties.enable',
        )}
      </Checkbox>
      {isEnabled && (
        <Space orientation="vertical" size="small" className="mt-2">
          <Checkbox
            checked={isPreviewEnabled}
            onChange={onPreviewOptionChange}
          >
            {I18n.t(
              'administration.survey_builder.property_panel.image_multi_choice_properties.preview',
            )}
          </Checkbox>
          <div>
            <Typography.Text strong>
              {I18n.t(
                'administration.survey_builder.property_panel.image_multi_choice_properties.size.title',
              )}
            </Typography.Text>
            <Radio.Group className="mt-2" value={size} onChange={onSizeChange}>
              <Radio.Button value="xx-small">
                {I18n.t(
                  'administration.survey_builder.property_panel.image_multi_choice_properties.size.xx-small',
                )}
              </Radio.Button>
              <Radio.Button value="x-small">
                {I18n.t(
                  'administration.survey_builder.property_panel.image_multi_choice_properties.size.x-small',
                )}
              </Radio.Button>
              <Radio.Button value="small">
                {I18n.t(
                  'administration.survey_builder.property_panel.image_multi_choice_properties.size.small',
                )}
              </Radio.Button>
              <Radio.Button value="medium">
                {I18n.t(
                  'administration.survey_builder.property_panel.image_multi_choice_properties.size.medium',
                )}
              </Radio.Button>
              <Radio.Button value="large">
                {I18n.t(
                  'administration.survey_builder.property_panel.image_multi_choice_properties.size.large',
                )}
              </Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      )}
    </div>
    <Divider className="mt-4 mb-4" />
  </>
)

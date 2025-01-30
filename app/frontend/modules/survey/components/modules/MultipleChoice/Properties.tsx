import { FC } from 'react'
import {
  Space,
  Typography,
  Divider,
  Select,
  Radio,
  Checkbox,
  RadioChangeEvent,
} from 'antd'

import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import {
  ImageChoiceProperties,
} from '~/modules/survey/components/modules/MultipleChoice/components/ImageChoiceProperties'

import { ANSWER_TYPE_OPTIONS } from '~/modules/survey/components/modules/MultipleChoice/constants'
import useForceUpdate from '~/hooks/useUpdate'
import { MultilineEdit } from '~/modules/survey/components/MultilineEdit'
import { PropertiesModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'
import ChoicesInput from '~/modules/survey/components/ChoicesInput'


const { I18n } = window

export interface Props {
  model: PropertiesModel
  showOnlyTranslatable: boolean
}

export const Properties: FC<Props> = (props) => {
  const { model, showOnlyTranslatable } = props
  const forceUpdate = useForceUpdate()
  const handleAnswerTypeChange = (selectedType: string) => {
    model.resetDefaultValues()
    model.changeProps({
      type: selectedType,
    })
    model.update()
  }

  const handleChoiceCountChange = (val: number) => {
    model.setChoices(val)
    model.update()
  }

  const handleMultilineChange = (values) => {
    model.setChoices(values.length)
    model.changeProps({ choicesTexts: values })
    model.update()
  }

  const handlePositionChange = (event: RadioChangeEvent) => {
    model.changeProps({
      position: event.target.value,
    })
    model.update()
  }

  const handleNotApplicableOptionChange = (event: CheckboxChangeEvent) => {
    model.changeProps({
      notApplicable: event.target.checked,
    })
    model.update()
  }

  const handleWithImageChange = (event: CheckboxChangeEvent) => {
    model.changeProps({
      withImageChoice: event.target.checked,
      position: 'Vertical',
    })
    model.update()
  }

  const handleImagePreviewChange = (event: CheckboxChangeEvent) => {
    model.changeProps({
      isImagePreviewEnable: event.target.checked,
    })
    model.update()
  }

  const handleImageGridSizeChange = (event: RadioChangeEvent) => {
    model.changeProps({
      imageChoiceSize: event.target.value,
    })
    model.update()
  }

  const {
    type,
    position,
    notApplicable,
    withImageChoice,
    isImagePreviewEnable,
    imageChoiceSize,
  } = model.props
  const isSingleOrMultiAnswerType = type === 'SingleAnswer' || type === 'MultipleAnswer'

  if (showOnlyTranslatable) {
    return (
      <div>
        <ValidationTypes model={model} update={() => forceUpdate()} />
      </div>
    )
  }

  return (
    <div>
      <AnswerTypeSelect value={type} onSelect={handleAnswerTypeChange} />
      <Divider className="mt-4 mb-4" />
      <Space direction="vertical" size="small">
        <ChoicesCountInput model={model} onChange={handleChoiceCountChange} />
        <Space className="ms-4 me-4">
          <MultilineEdit title="Choices" lines={model.props.choicesTexts} onChange={handleMultilineChange} />
        </Space>
        <Checkbox
          onChange={handleNotApplicableOptionChange}
          checked={notApplicable}
          className="ms-4 me-4"
        >
          {I18n.t(
            'administration.survey_builder.property_panel.add_n_a_option',
          )}
        </Checkbox>
        {isSingleOrMultiAnswerType && (
          <PositionProperty
            value={position}
            onChange={handlePositionChange}
            isDisabled={withImageChoice}
          />
        )}
      </Space>
      <Divider className="mt-4 mb-4" />
      {isSingleOrMultiAnswerType && (
        <ImageChoiceProperties
          isEnabled={withImageChoice}
          onImageEnableChange={handleWithImageChange}
          isPreviewEnabled={isImagePreviewEnable}
          onPreviewOptionChange={handleImagePreviewChange}
          size={imageChoiceSize}
          onSizeChange={handleImageGridSizeChange}
        />
      )}
      <RequiredValidations model={model} update={() => forceUpdate()} />
      <ValidationTypes model={model} update={() => forceUpdate()} />
    </div>
  )
}

interface AnswerTypeSelectProps {
  value: string
  onSelect: (value: string) => void
}

const AnswerTypeSelect: FC<AnswerTypeSelectProps> = ({ value, onSelect }) => (
  <div className="m-4">
    <Typography.Text strong>
      {I18n.t(
        'administration.survey_builder.property_panel.answer_type',
      )}
    </Typography.Text>
    <Select
      className="w-100"
      options={ANSWER_TYPE_OPTIONS}
      value={value}
      onSelect={onSelect}
      size="small"
    />
  </div>
)
interface ChoicesCountInputProps {
  model: PropertiesModel
  onChange(value: number): void
}


const ChoicesCountInput: FC<ChoicesCountInputProps> = ({ model, onChange }) => (
  <Space direction="vertical" className="ms-4 me-4">
    <Typography.Text strong>
      {I18n.t(
        'administration.survey_builder.property_panel.no_of_choices',
      )}
    </Typography.Text>
    <ChoicesInput model={model} onChange={onChange} />
  </Space>
)
interface PositionPropertyProps {
  value: PropertiesModel['props']['position']
  onChange(event: RadioChangeEvent): void
  isDisabled?: boolean
}

const PositionProperty: FC<PositionPropertyProps> = ({
  value,
  onChange,
  isDisabled = false,
}) => (
  <div className="ms-4 me-4">
    <Typography.Text strong>
      {I18n.t(
        'administration.survey_builder.property_panel.orientation.title',
      )}
    </Typography.Text>
    <Radio.Group
      className="mt-2"
      value={value}
      onChange={onChange}
      disabled={isDisabled}
    >
      <Radio value="Vertical">
        {I18n.t(
          'administration.survey_builder.property_panel.orientation.vertical',
        )}
      </Radio>
      <Radio value="Horizontal">
        {I18n.t(
          'administration.survey_builder.property_panel.orientation.horizontal',
        )}
      </Radio>
    </Radio.Group>
  </div>
)

import { FC } from 'react'
import {
  Select, Space, Typography, Checkbox, Divider,
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import ScoreWithAI from '~/modules/survey/components/ScoreWithAI'
import {
  PropertiesModel,
  DateFormat,
} from '~/modules/survey/interfaces/questions/TextEntry'

import useForceUpdate from '~/hooks/useUpdate'
import ChoicesInput from '~/modules/survey/components/ChoicesInput'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'
import
EmailPropertyPanel
  from '~/modules/survey/components/modules/TextEntry/components/types/Email/Builder/PropertyPanel'
import RichTextPropertyPanel
  from '~/modules/survey/components/modules/TextEntry/components/types/RichText/PropertyPanel'
import { TextEntryProps } from '~/modules/survey/constants/DefaultProps'
import {
  ANSWER_TYPE_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from '~/modules/survey/components/modules/TextEntry/constant'

const { I18n } = window
const { enhance_with_ai_enabled } = window.PsyGlobalState.features

interface Props {
  model: PropertiesModel
  showOnlyTranslatable: boolean
}

export const Properties: FC<Props> = ({ model, showOnlyTranslatable }) => {
  const forceUpdate = useForceUpdate()
  const showEnhanceWithAiOption = enhance_with_ai_enabled

  const {
    props: {
      type, allowDictation, dateFormat, enhanceWithAIEnabled = true,
    },
  } = model

  const handleAnswerTypeChange = (selectedType: string) => {
    if (selectedType === 'Form' || model.props.type === 'Form') {
      model.resetDefaultValues()
    }
    model.changeProps({
      type: selectedType,
      ...(TextEntryProps[selectedType] || {}),
    })
  }

  const handleChatAnswerCount = (val: number) => {
    model.setChoices(val)
    forceUpdate()
  }

  const handleFormFieldsCount = (val: number) => {
    model.setFormFields(val)
    forceUpdate()
  }

  const handleDictationOptionChange = (event: CheckboxChangeEvent) => {
    const {
      target: { checked },
    } = event

    model.changeProps({
      allowDictation: checked,
    })
    forceUpdate()
  }

  const handleEnhanceWithAIChange = (event: CheckboxChangeEvent) => {
    const {
      target: { checked },
    } = event

    model.changeProps({
      enhanceWithAIEnabled: checked,
    })
    forceUpdate()
  }

  const handleDateFormatChange = (selectedDateFormat: DateFormat) => {
    model.changeProps({
      dateFormat: selectedDateFormat,
    })
  }

  if (showOnlyTranslatable) {
    return <ValidationTypes model={model} update={() => forceUpdate()} />
  }

  return (
    <>
      <AnswerTypeSelect value={type} onSelect={handleAnswerTypeChange} />
      {type === 'Form' && (
        <PropertyChoiceInput
          model={model}
          title="Form fields"
          onChange={handleFormFieldsCount}
        />
      )}
      {type === 'Chat' && (
        <PropertyChoiceInput
          model={model}
          title="Answers count"
          onChange={handleChatAnswerCount}
        />
      )}
      {showEnhanceWithAiOption && ['MultiLine', 'EssayTextBox', 'SingleLine', 'RichText'].includes(type) && (
        <EnhanceWithAI
          checked={enhanceWithAIEnabled}
          onChange={handleEnhanceWithAIChange}
        />
      )}
      {['MultiLine', 'EssayTextBox'].includes(type) && (
        <VoiceDictationCheckbox
          checked={allowDictation}
          onChange={handleDictationOptionChange}
        />
      )}
      {type === 'DateEntry' && (
        <DateFormatSelect
          value={dateFormat}
          onSelect={handleDateFormatChange}
        />
      )}
      {type === 'Email' && <EmailPropertyPanel model={model} />}
      {type === 'RichText' && <RichTextPropertyPanel model={model} />}

      <RequiredValidations model={model} update={forceUpdate} />
      <ValidationTypes model={model} update={() => forceUpdate()} />
      {['MultiLine', 'EssayTextBox', 'SingleLine', 'RichText'].includes(type) && (
        <ScoreWithAI model={model} update={forceUpdate} />
      )}
    </>
  )
}

interface AnswerTypeSelectProps {
  value: string
  onSelect: (value: string) => void
}

const AnswerTypeSelect: FC<AnswerTypeSelectProps> = ({ value, onSelect }) => (
  <div className="ms-4 me-4">
    <Space orientation="vertical" className="w-100">
      <Typography.Text strong>
        {I18n.t('administration.survey_builder.property_panel.answer_type')}
      </Typography.Text>
      <Select
        className="w-100"
        options={ANSWER_TYPE_OPTIONS}
        value={value}
        onSelect={onSelect}
      />
    </Space>
    <Divider />
  </div>
)

interface PropertyChoiceInputProps {
  model: PropertiesModel
  title: string
  onChange: (value: number) => void
}

const PropertyChoiceInput: FC<PropertyChoiceInputProps> = ({
  model,
  title,
  onChange,
}) => (
  <div className="ms-4 me-4 mb-4">
    <Space orientation="vertical">
      <Typography.Text strong>{title}</Typography.Text>
      <ChoicesInput model={model} onChange={onChange} />
    </Space>
    <Divider />
  </div>
)

const VoiceDictationCheckbox = ({ checked, onChange }) => (
  <div className="ms-4 me-4 mb-4">
    <Checkbox checked={checked} onChange={onChange}>
      {I18n.t('administration.survey_builder.property_panel.voice_dictation')}
    </Checkbox>
    <Divider />
  </div>
)

const EnhanceWithAI = ({ checked, onChange }) => (
  <div className="ms-4 me-4 mb-4">
    <Checkbox checked={checked} onChange={onChange}>
      Enhance with AI
    </Checkbox>
    <Divider />
  </div>
)


interface DateFormatSelectProps {
  value: DateFormat
  onSelect: (value: DateFormat) => void
}

const DateFormatSelect: FC<DateFormatSelectProps> = ({ value, onSelect }) => (
  <div className="ms-4 me-4 mb-4">
    <Space orientation="vertical" className="w-100">
      <Typography.Text strong>
        {I18n.t('administration.survey_builder.property_panel.date_format')}
      </Typography.Text>
      <Select
        className="w-100"
        options={DATE_FORMAT_OPTIONS}
        value={value}
        onSelect={onSelect}
      />
    </Space>
    <Divider />
  </div>
)

export default Properties

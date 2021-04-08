import React, { FC } from 'react'
import {
  Divider, Select, Space, Typography, Checkbox,
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import useForceUpdate from 'hooks/useUpdate'
import { ANSWER_TYPE_OPTIONS } from 'modules/survey/components/modules/TextEntry/constant'

import ChoicesInput from 'modules/survey/components/ChoicesInput'
import ValidationTypes from 'modules/survey/components/ValidationTypes'
import RequiredValidations from 'modules/survey/components/RequiredValidations'
import { TextEntryProps } from 'modules/survey/constants/DefaultProps'
import
EmailPropertyPanel
  from 'modules/survey/components/modules/TextEntry/components/types/Email/Builder/PropertyPanel'

const { I18n } = window
interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  restricted: boolean
}

const Properties: FC<Props> = ({ model, restricted }) => {
  const forceUpdate = useForceUpdate()

  const {
    props: { type, allowDictation },
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
      {['SingleLine', 'MultiLine', 'EssayTextBox'].includes(type) && (
        <VoiceDictationCheckbox
          checked={allowDictation}
          onChange={handleDictationOptionChange}
        />
      )}
      {type === 'Email' && <EmailPropertyPanel model={model} />}
      {!restricted && (
        <RequiredValidations model={model} update={forceUpdate} />
      )}
      {!restricted && <ValidationTypes model={model} update={forceUpdate} />}
    </>
  )
}

interface AnswerTypeSelectProps {
  value: string
  onSelect: (value: string) => void
}

const AnswerTypeSelect: FC<AnswerTypeSelectProps> = ({ value, onSelect }) => (
  <section className="ms-4 me-4">
    <Space direction="vertical" className="w-100">
      <Typography.Text strong>{I18n.t('administration.survey_builder.property_panel.answer_type')}</Typography.Text>
      <Select
        className="w-100"
        options={ANSWER_TYPE_OPTIONS}
        value={value}
        onSelect={onSelect}
      />
    </Space>
    <Divider />
  </section>
)

interface PropertyChoiceInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  title: string
  onChange: (value: number) => void
}

const PropertyChoiceInput: FC<PropertyChoiceInputProps> = ({
  model,
  title,
  onChange,
}) => (
  <section className="ms-4 me-4 mb-4">
    <Space direction="vertical">
      <Typography.Text strong>{title}</Typography.Text>
      <ChoicesInput model={model} onChange={onChange} />
    </Space>
    <Divider />
  </section>
)

const VoiceDictationCheckbox = ({ checked, onChange }) => (
  <section className="ms-4 me-4 mb-4">
    <Checkbox checked={checked} onChange={onChange}>
      {I18n.t('administration.survey_builder.property_panel.voice_dictation')}
    </Checkbox>
    <Divider />
  </section>
)

export default Properties

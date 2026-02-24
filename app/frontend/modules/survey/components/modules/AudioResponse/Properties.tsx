import { FC } from 'react'
import {
  Divider, Typography, Select, Space,
} from 'antd'

import { PropertiesModel } from '~/modules/survey/interfaces/questions/AudioResponse'

import useForceUpdate from '~/hooks/useUpdate'

import ValidationTypes from '~/modules/survey/components/ValidationTypes'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'

const { I18n } = window

const DURATION_OPTIONS = [
  {
    value: 10,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.10',
    ),
  },
  {
    value: 30,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.30',
    ),
  },
  {
    value: 60,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.60',
    ),
  },
  {
    value: 120,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.120',
    ),
  },
  {
    value: 180,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.180',
    ),
  },
  {
    value: 300,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.300',
    ),
  },
  {
    value: 600,
    label: I18n.t(
      'administration.survey_builder.property_panel.duration_options.600',
    ),
  },
]

interface Props {
  model: PropertiesModel
  restricted: boolean
  showOnlyTranslatable: boolean
}

export const Properties: FC<Props> = ({ model, restricted, showOnlyTranslatable }) => {
  const forceUpdate = useForceUpdate()

  const {
    props: { duration },
  } = model

  const handleDurationChange = (selectedDuration: number) => {
    model.changeProps({
      duration: selectedDuration,
    })
  }

  if (showOnlyTranslatable && !restricted) {
    return (<ValidationTypes model={model} update={forceUpdate} />)
  }

  return (
    <>
      <DurationSelect value={duration || 0} onSelect={handleDurationChange} />
      {!restricted && (
        <RequiredValidations model={model} update={forceUpdate} />
      )}
      {!restricted && <ValidationTypes model={model} update={forceUpdate} />}
    </>
  )
}

interface DurationSelectProps {
  value: number
  onSelect: (value: number) => void
}

const DurationSelect: FC<DurationSelectProps> = ({ value, onSelect }) => (
  <div className="ms-4 me-4">
    <Space orientation="vertical" className="w-100">
      <label htmlFor="duration_select">
        <Typography.Text strong>
          {I18n.t('administration.survey_builder.property_panel.max_duration')}
        </Typography.Text>
      </label>
      <Select
        id="duration_select"
        className="w-100"
        options={DURATION_OPTIONS}
        value={value}
        onSelect={onSelect}
      />
    </Space>
    <Divider />
  </div>
)

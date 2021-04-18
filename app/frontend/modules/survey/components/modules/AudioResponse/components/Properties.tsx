import React, { FC } from 'react'
import {
  Divider, Typography, Select, Space,
} from 'antd'

import { PropertiesModel } from 'modules/survey/interfaces/questions/AudioResponse'

import useForceUpdate from 'hooks/useUpdate'
import { DURATION_OPTIONS } from 'modules/survey/components/modules/AudioResponse/constants'

import ValidationTypes from 'components/ValidationTypes'
import RequiredValidations from 'components/RequiredValidations'

const { I18n } = window

interface Props {
  model: PropertiesModel
  restricted: boolean
}

export const Properties: FC<Props> = ({ model, restricted }) => {
  const forceUpdate = useForceUpdate()

  const {
    props: { duration },
  } = model

  const handleDurationChange = (selectedDuration: number) => {
    model.changeProps({
      duration: selectedDuration,
    })
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
    <Space direction="vertical" className="w-100">
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

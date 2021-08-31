import React, { FC } from 'react'
import { Space } from 'antd'

import { PropertiesModel } from 'modules/reports/interfaces/tables/HighestLowest'

import PropertyFilter from 'modules/reports/components/PropertyFilter'
import { FactorsList } from './dataSources/FactorList'
import { QuestionList } from './dataSources/QuestionList'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

interface Props {
  model: PropertiesModel
}

export const Properties: FC<Props> = ({ model }) => {
  const {
    props: { sourceType, factorIds, questionsChoices },
    assessment_id,
  } = model

  const onChange = (key: string, value: unknown) => {
    model.props[key] = value
    model.update()
  }

  return (
    <Space direction="vertical" size="small">
      <SourceTypeButtonGroup model={model} onChange={onChange} />
      {sourceType === 'Factor' && (
        <FactorsList
          assessmentId={assessment_id}
          value={factorIds}
          onChange={onChange}
        />
      )}
      {sourceType === 'Question' && (
        <QuestionList
          assessmentId={assessment_id}
          value={questionsChoices}
          onChange={onChange}
        />
      )}
      <PropertyFilter model={model} />
    </Space>
  )
}

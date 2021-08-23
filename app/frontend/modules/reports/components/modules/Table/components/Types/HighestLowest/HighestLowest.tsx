import React, { FC } from 'react'
import { Empty } from 'antd'

import { PreviewModel } from 'modules/reports/interfaces/tables/HighestLowest'

import QuestionType from './types/Question'
import FactorType from './types/Factor'

interface Props {
  model: PreviewModel
}

export const HighestLowest: FC<Props> = ({ model }) => {
  const {
    props: {
      sourceType, filter, factorIds, questionsChoices,
    },
    assessment_id,
  } = model

  if (filter === 0) {
    return (
      <Empty
        description="Select a filter to display Highest-Lowest table"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  if (sourceType === 'Question') {
    return (
      <QuestionType
        assessment_id={assessment_id}
        filterId={filter}
        questionsChoices={questionsChoices}
      />
    )
  }
  return (
    <FactorType
      assessment_id={assessment_id}
      filterId={filter}
      factorIds={factorIds}
    />
  )
}

import { FC } from 'react'
import { Empty } from 'antd'

import { PreviewModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'

import QuestionType from './types/Question'
import FactorType from './types/Factor'

interface Props {
  model: PreviewModel
}

export const HighestLowest: FC<Props> = ({ model }) => {
  const {
    props: {
      sourceType, filter, factorIds, questionsChoices, sections = TableSectionsType.ALL,
      tableStyle = TableStyleType.UNSTYLED, hideValues = false, noOfItems, scoreCutoff,
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
        sections={sections}
        tableStyle={tableStyle}
        hideValues={hideValues}
        noOfItems={noOfItems}
        scoreCutoff={scoreCutoff}
      />
    )
  }
  return (
    <FactorType
      assessment_id={assessment_id}
      filterId={filter}
      factorIds={factorIds}
      sections={sections}
      tableStyle={tableStyle}
      hideValues={hideValues}
      noOfItems={noOfItems}
      scoreCutoff={scoreCutoff}
    />
  )
}

import { FC } from 'react'
import { Empty } from 'antd'

import { PreviewModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'

import { useModulePagination } from '~/hooks/useModulePagination'
import QuestionType from './types/Question'
import FactorType from './types/Factor'
import { PaginationContext } from '../GapAssessment/PaginationContext'

interface Props {
  model: PreviewModel
  preview: boolean
  insertPaginationPage: () => void
}

export const HighestLowest: FC<Props> = ({ model, insertPaginationPage, preview }) => {
  const {
    props: {
      sourceType, filter, factorIds, questionsChoices, sections = TableSectionsType.ALL,
      tableStyle = TableStyleType.UNSTYLED, hideValues = false, noOfItems, scoreCutoff, style,
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


  const { paginationContext } = useModulePagination(
    model, `[data-table="${model.id}"]`, PaginationContext, insertPaginationPage, preview,
  )


  if (sourceType === 'Question') {
    return (
      <QuestionType
        model={model}
        assessment_id={assessment_id}
        filterId={filter}
        questionsChoices={questionsChoices}
        sections={sections}
        tableStyle={tableStyle}
        hideValues={hideValues}
        noOfItems={noOfItems}
        scoreCutoff={scoreCutoff}
        paginationContext={paginationContext}
        style={style}
      />
    )
  }
  return (
    <FactorType
      model={model}
      assessment_id={assessment_id}
      filterId={filter}
      factorIds={factorIds}
      sections={sections}
      tableStyle={tableStyle}
      hideValues={hideValues}
      noOfItems={noOfItems}
      scoreCutoff={scoreCutoff}
      paginationContext={paginationContext}
      style={style}
    />
  )
}

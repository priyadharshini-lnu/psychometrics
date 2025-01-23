import { FC } from 'react'
import { Empty } from 'antd'

import FactorType from './types/Factor'
import QuestionType from './types/Question'

import { PropertiesModel, GapType, TableStyleType } from '~/modules/reports/interfaces/tables/Gap'

import AppStore from '~/modules/reports/store/AppStore'


interface Props {
  model: PropertiesModel
}

export const GapAssessment: FC<Props> = ({ model }) => {
  const {
    props: {
      sourceType, filter, factorIds, questionsChoices, gapType = GapType.ALL, hideValues = false,
      noOfItems, gapCutoff, precision, allFactors, tableStyle = TableStyleType.UNSTYLED, style,
    },
    assessment_id,
  } = model
  const filterIds = Array.isArray(filter) ? filter.slice(0, 2) : []
  const firstFilter = AppStore.report.filters.find(
    appStoreFilter => appStoreFilter.id === filterIds[0],
  )
  const secondFilter = AppStore.report.filters.find(
    appStoreFilter => appStoreFilter.id === filterIds[1],
  )

  if (firstFilter === undefined || secondFilter === undefined) {
    return (
      <Empty
        description="Select any two(2) filters to display Gap assessment table"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <div>
      {sourceType === 'Factor' && (
        <FactorType
          assessment_id={assessment_id}
          gapType={gapType}
          filters={[firstFilter, secondFilter]}
          tableStyle={tableStyle}
          factorIds={factorIds}
          hideValues={hideValues}
          noOfItems={noOfItems}
          gapCutoff={gapCutoff}
          precision={precision}
          showAllFactors={allFactors}
          style={style}
        />
      )}
      {sourceType === 'Question' && (
        <QuestionType
          assessment_id={assessment_id}
          gapType={gapType}
          filters={[firstFilter, secondFilter]}
          tableStyle={tableStyle}
          questionsChoices={questionsChoices}
          hideValues={hideValues}
          noOfItems={noOfItems}
          gapCutoff={gapCutoff}
          precision={precision}
          style={style}
        />
      )}
    </div>
  )
}

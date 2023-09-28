import { FC, lazy, Suspense } from 'react'
import { Empty, Spin } from 'antd'

import { PropertiesModel, GapType } from '~/modules/reports/interfaces/tables/Gap'

import AppStore from '~/modules/reports/store/AppStore'

const FactorType = lazy(() => import('./types/Factor'))
const QuestionType = lazy(() => import('./types/Question'))

interface Props {
  model: PropertiesModel
}

export const GapAssessment: FC<Props> = ({ model }) => {
  const {
    props: {
      sourceType, filter, factorIds, questionsChoices, gapType = GapType.ALL, hideValues = false,
      noOfItems, gapCutoff,
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
      <Suspense fallback={<Spin />}>
        {sourceType === 'Factor' && (
          <FactorType
            assessment_id={assessment_id}
            gapType={gapType}
            filters={[firstFilter, secondFilter]}
            factorIds={factorIds}
            hideValues={hideValues}
            noOfItems={noOfItems}
            gapCutoff={gapCutoff}
          />
        )}
        {sourceType === 'Question' && (
          <QuestionType
            assessment_id={assessment_id}
            gapType={gapType}
            filters={[firstFilter, secondFilter]}
            questionsChoices={questionsChoices}
            hideValues={hideValues}
            noOfItems={noOfItems}
            gapCutoff={gapCutoff}
          />
        )}
      </Suspense>
    </div>
  )
}

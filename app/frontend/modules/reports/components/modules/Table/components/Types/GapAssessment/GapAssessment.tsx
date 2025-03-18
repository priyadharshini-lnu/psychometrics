import { FC, useEffect } from 'react'
import { Empty } from 'antd'

import { useModulePagination } from '~/hooks/useModulePagination'
import FactorType from './types/Factor'
import QuestionType from './types/Question'
import I18nStore from '~/modules/reports/store/I18nStore'

import { PropertiesModel, GapType, TableStyleType } from '~/modules/reports/interfaces/tables/Gap'

import AppStore from '~/modules/reports/store/AppStore'
import { PaginationContext } from './PaginationContext'


interface Props {
  model: PropertiesModel
  insertPaginationPage: () => void
  preview: boolean
}

export const GapAssessment: FC<Props> = ({ model, insertPaginationPage, preview }) => {
  useEffect(() => {
    const factorTableColumns = {
      rank: {
        label: I18nStore.t('reports.modules.gap_assessment.rank'),
        hide: false,
        allowHide: true,
      },
      indicator: {
        label: I18nStore.t('reports.modules.gap_assessment.item'),
        hide: false,
        allowHide: true,
      },
      gap: {
        label: I18nStore.t('reports.modules.gap_assessment.gap'),
        hide: false,
        allowHide: true,
      },
      positive_gaps: {
        label: I18nStore.t('reports.modules.gap_assessment.positive_gap'),
        hide: false,
        allowHide: true,
      },
      nagative_gaps: {
        label: I18nStore.t('reports.modules.gap_assessment.negative_gap'),
        hide: false,
        allowHide: true,
      },

    }
    const defaultTableColumns = {
      Question: {
        competency: {
          label: I18nStore.t('reports.modules.gap_assessment.scoring_category'),
          hide: false,
          allowHide: true,
        },
        ...factorTableColumns,
      },
      Factor: { ...factorTableColumns },
    }
    model.props.defaultTableColumns = defaultTableColumns
    model.update()
  }, [])
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

  const { paginationContext } = useModulePagination(
    model, `[data-table="${model.id}"]`, PaginationContext, insertPaginationPage, preview,
  )

  return (
    <div data-table={model.id}>
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
          model={model}
          paginationContext={paginationContext}
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
          model={model}
          paginationContext={paginationContext}
          style={style}
        />
      )}
    </div>
  )
}

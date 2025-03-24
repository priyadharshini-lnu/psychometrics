import { useEffect } from 'react'
import Types from './Types'
import I18nStore from '~/modules/reports/store/I18nStore'
import lookupAndEnhanceFilters from './lookupAndEnhanceFilters'
import { useModulePagination } from '~/hooks/useModulePagination'
import { PaginationContext } from '../FactorsTable/PaginationContext'

export default function Competencies ({ model, insertPaginationPage, preview }) {
  const Type = Types[model.props.sourceType]

  useEffect(() => {
    const defaultTableColumns = {
      Question: {
        questions: {
          label: I18nStore.t('reports.modules.single_value_cluster.questions'),
          hide: false,
          allowHide: true,
        },
        developmental_rating: {
          label: I18nStore.t('reports.modules.single_value_cluster.developmental_rating'),
          hide: false,
          allowHide: true,
        },
      },
      Factor: {
        competency: {
          label: I18nStore.t('reports.modules.single_value_cluster.competency'),
          hide: false,
          allowHide: true,
        },
        developmental_rating: {
          label: I18nStore.t('reports.modules.single_value_cluster.developmental_rating'),
          hide: false,
          allowHide: true,
        },
      },
    }
    model.props.defaultTableColumns = defaultTableColumns
    model.update()
  }, [])

  const { paginationContext } = useModulePagination(
    model, `[data-table="${model.id}"]`, PaginationContext, insertPaginationPage, preview,
  )
  const filters = lookupAndEnhanceFilters({ colors: model.props.colors, filterIds: model.props.filter })

  return (
    <div data-table={model.id}>
      <Type model={model} filters={filters} paginationContext={paginationContext} />
    </div>
  )
}

import Types from './Types'
import lookupAndEnhanceFilters from './lookupAndEnhanceFilters'
import { useModulePagination } from '~/hooks/useModulePagination'
import { PaginationContext } from '../FactorsTable/PaginationContext'

export default function Competencies ({ model, insertPaginationPage, preview }) {
  const Type = Types[model.props.sourceType]

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

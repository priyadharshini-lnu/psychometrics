import { CSSProperties, FC } from 'react'

import cs from 'classnames'
import _ from 'lodash'
import { PreviewModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'

import AppStore from '~/modules/reports/store/AppStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import I18nStore from '~/modules/reports/store/I18nStore'

import styles from './styles.less'
import { PageData } from '../../GapAssessment/PaginationContext'

const MOCK_HIGHEST_DATA = [
  { avg: 5.0, name: 'Customer First' },
  { avg: 4.83, name: 'Game Changer' },
  { avg: 3.9, name: 'Greater Together' },
  { avg: 3.3, name: 'Leads Transformation' },
  { avg: 3.0, name: 'Passion For Results' },
]
const MOCK_LOWEST_DATA = [
  { avg: 3.0, name: 'Passion For Results' },
  { avg: 3.3, name: 'Leads Transformation' },
  { avg: 3.9, name: 'Greater Together' },
  { avg: 4.83, name: 'Game Changer' },
  { avg: 5.0, name: 'Customer First' },
]

interface Props {
  assessment_id: PreviewModel['assessment_id']
  filterId: PreviewModel['props']['filter']
  factorIds: PreviewModel['props']['factorIds']
  sections: TableSectionsType
  tableStyle: TableStyleType
  hideValues: boolean
  noOfItems: number | null
  scoreCutoff: number | null
  model: PreviewModel
  paginationContext: PageData | null
  style?: CSSProperties & { fontColor: string }
}

const FactorType: FC<Props> = ({
  assessment_id, filterId, factorIds, sections, tableStyle, hideValues, noOfItems, scoreCutoff,
  model, paginationContext, style,
}) => {
  const calculateHighestLowest = (
    assessment_id: PreviewModel['assessment_id'],
    filterId: PreviewModel['props']['filter'],
    factorIds: PreviewModel['props']['factorIds'],
  ) => {
    const result = ResultStore.results[assessment_id].getAverageFactorScore(filterId)

    const allowedFactors = result.filter(factorResult => factorIds.includes(factorResult.id))
    const sortedFactors = allowedFactors.sort(
      (firstFactor, secondFactor) => secondFactor.avg - firstFactor.avg,
    ).filter(r => r.avg > 0)

    // _.remove to exclude highestScore entries from lowest
    const itemLimit = noOfItems || 5
    const highestFactors = _.remove(sortedFactors, (r, i) => r.avg >= (scoreCutoff ?? -Infinity) && i < itemLimit)
    const lowestFactors = sortedFactors
      .filter(r => r.avg < (scoreCutoff ?? Infinity))
      .slice(-(noOfItems ?? 5)).reverse()

    return [highestFactors, lowestFactors]
  }

  const getAllFactors = () => {
    const dimensionId = AppStore.getAssessmentById(assessment_id)?.dimensionId ?? ''
    const allFactors: Array<{ id: number; name: string }> = AppStore.factors?.[dimensionId] ?? []
    const allFactorsIds = allFactors.map(factor => factor.id)

    return allFactorsIds
  }

  const mockedResult = (data) => {
    const dimensionId = AppStore.getAssessmentById(assessment_id)?.dimensionId ?? ''
    const allFactors: Array<{ id: number; name: string }> = AppStore.factors?.[dimensionId] ?? []

    return factorIds?.map((id, i) => ({
      ...data[i],
      name: allFactors.find(factor => factor.id === id)?.name ?? '',
    }))
  }

  // If no factors are selected, by default consider all factors
  const providedFactorIds = factorIds && factorIds.length > 0 ? factorIds : getAllFactors()

  const [highestFactors, lowestFactors] = ResultStore.realResults
    ? calculateHighestLowest(assessment_id, filterId, providedFactorIds)
    : [mockedResult(MOCK_HIGHEST_DATA), mockedResult(MOCK_LOWEST_DATA)]

  const filter = AppStore.report.filters.find(
    filter => filter.id === filterId,
  )
  const filterName = filter ? I18nStore.tFilterName(filter) : ''
  const styleProp = { fontSize: style?.fontSize, fontFamily: style?.fontFamily, color: style?.fontColor }

  const showHighest = paginationContext
    ? !!paginationContext?.rowIds?.top?.length : (sections !== TableSectionsType.LOWEST)
  const showLowest = paginationContext
    ? !!paginationContext?.rowIds?.bottom?.length : (sections !== TableSectionsType.HIGHEST)

  return (
    <div className={cs(styles.table, styles[tableStyle])} style={styleProp}>
      <table data-table={model.id}>
        <tbody>
          {showHighest && (
            <>
              <THeaders
                title={I18nStore.t('reports.modules.highest_lowest.highest_scores')}
                filterName={filterName}
                hideValues={hideValues}
              />
              <TBody data={highestFactors} hideValues={hideValues} type="top" paginationContext={paginationContext} />
            </>
          )}
          {showLowest && (
            <>
              <THeaders
                title={I18nStore.t('reports.modules.highest_lowest.lowest_scores')}
                filterName={filterName}
                hideValues={hideValues}
              />
              <TBody data={lowestFactors} hideValues={hideValues} type="bottom" paginationContext={paginationContext} />
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

interface THeadersProps {
  title: string
  filterName: string
  hideValues: boolean
}

const THeaders: FC<THeadersProps> = ({ title, filterName, hideValues }) => (
  <>
    <tr className={styles.title} data-header>
      <th colSpan={hideValues ? 2 : 3}>
        {title}
      </th>
    </tr>
    <tr className={styles.headers} data-header>
      <th className={styles.label} scope="col">
        {I18nStore.t('reports.modules.highest_lowest.rank')}
      </th>
      <th className={styles.label} scope="col">
        {I18nStore.t('reports.modules.highest_lowest.category')}
      </th>
      {!hideValues && (
        <th className={cs(styles.label, styles.number)} scope="col">
          {filterName}
        </th>
      )}
    </tr>
  </>
)

interface TBodyProps {
  data: Array<{
    id: number
    avg: number
    name: string
  }>
  hideValues: boolean
  type: 'top' | 'bottom'
  paginationContext: PageData | null
}

const TBody: FC<TBodyProps> = ({
  data, hideValues, paginationContext, type,
}) => {
  const ranks = data.reduce((acc, factor, i) => ({ ...acc, [factor.id]: i + 1 }), {})
  const paginatedData = paginationContext ? paginationContext.rowIds[type].map(id => data[id]) : data

  return (
    <>
      {paginatedData.map((factor, index) => (
        <tr key={index} className={styles.row} data-row={index} data-type={type}>
          <td>{ranks[factor.id]}</td>
          <td>{I18nStore.tFactorName(factor)}</td>
          {!hideValues && (
            <td className={styles.number}>{factor.avg}</td>
          )}
        </tr>
      ))}
    </>
  )
}

export default FactorType

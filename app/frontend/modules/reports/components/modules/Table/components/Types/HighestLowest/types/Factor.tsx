import { FC } from 'react'

import cs from 'classnames'
import _ from 'lodash'
import { PreviewModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'

import AppStore from '~/modules/reports/store/AppStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import I18nStore from '~/modules/reports/store/I18nStore'

import styles from './styles.less'

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
}

const FactorType: FC<Props> = ({
  assessment_id, filterId, factorIds, sections, tableStyle, hideValues, noOfItems, scoreCutoff,
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

  // If no factors are selected, by default consider all factors
  const providedFactorIds = factorIds && factorIds.length > 0 ? factorIds : getAllFactors()

  const [highestFactors, lowestFactors] = ResultStore.realResults
    ? calculateHighestLowest(assessment_id, filterId, providedFactorIds)
    : [MOCK_HIGHEST_DATA, MOCK_LOWEST_DATA]

  const filter = AppStore.report.filters.find(
    filter => filter.id === filterId,
  )
  const filterName = filter ? I18nStore.tFilterName(filter) : ''

  return (
    <div className={cs(styles.table, styles[tableStyle])}>
      <table>
        <tbody>
          {sections !== TableSectionsType.LOWEST && (
            <>
              <THeaders
                title={I18nStore.t('reports.modules.highest_lowest.highest_scores')}
                filterName={filterName}
                hideValues={hideValues}
              />
              <TBody data={highestFactors} hideValues={hideValues} />
            </>
          )}
          {sections !== TableSectionsType.HIGHEST && (
            <>
              <THeaders
                title={I18nStore.t('reports.modules.highest_lowest.lowest_scores')}
                filterName={filterName}
                hideValues={hideValues}
              />
              <TBody data={lowestFactors} hideValues={hideValues} />
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
    <tr className={styles.title}>
      <th colSpan={hideValues ? 2 : 3}>
        {title}
      </th>
    </tr>
    <tr className={styles.headers}>
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
    avg: number
    name: string
  }>
  hideValues: boolean
}

const TBody: FC<TBodyProps> = ({ data, hideValues }) => (
  <>
    {data.map(({ avg, name }, index) => (
      <tr key={index} className={styles.row}>
        <td>{index + 1}</td>
        <td>{name}</td>
        {!hideValues && (
          <td className={styles.number}>{avg}</td>
        )}
      </tr>
    ))}
  </>
)

export default FactorType

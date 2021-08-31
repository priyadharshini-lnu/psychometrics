import React, { FC } from 'react'

import { PreviewModel } from 'modules/reports/interfaces/tables/HighestLowest'

import AppStore from 'modules/reports/store/AppStore'
import ResultStore from 'modules/reports/store/ResultStore'
import I18nStore from 'modules/reports/store/I18nStore'
import Text from '../../../Table/CellTypes/Text/Text'

import styles from './styles.scss'

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
}

const FactorType: FC<Props> = ({ assessment_id, filterId, factorIds }) => {
  const calculateHighestLowest = (
    assessment_id: PreviewModel['assessment_id'],
    filterId: PreviewModel['props']['filter'],
    factorIds: PreviewModel['props']['factorIds'],
  ) => {
    const result = ResultStore.results[assessment_id].getAverageFactorScore(filterId)

    const allowedFactors = result.filter(factorResult => factorIds.includes(factorResult.id))
    const sortedFactors = allowedFactors.sort(
      (firstFactor, secondFactor) => secondFactor.avg - firstFactor.avg,
    )

    const highestFactors = sortedFactors.slice(0, 5)
    const lowestFactors = sortedFactors.slice(-5).reverse()

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
    <div className={styles.table}>
      <table>
        <tbody>
          <THeaders
            title={I18nStore.t('reports.modules.highest_lowest.highest_scores')}
            filterName={filterName}
          />
          <TBody data={highestFactors} />
          <THeaders
            title={I18nStore.t('reports.modules.highest_lowest.lowest_scores')}
            filterName={filterName}
          />
          <TBody data={lowestFactors} />
        </tbody>
      </table>
    </div>
  )
}

interface THeadersProps {
  title: string
  filterName: string
}

const THeaders: FC<THeadersProps> = ({ title, filterName }) => (
  <>
    <tr>
      <th className={styles.label} colSpan={3}>
        {title}
      </th>
    </tr>
    <tr>
      <th className={styles.label} scope="col">
        {I18nStore.t('reports.modules.highest_lowest.rank')}
      </th>
      <th className={styles.label} scope="col">
        {I18nStore.t('reports.modules.highest_lowest.category')}
      </th>
      <th className={styles.label} scope="col">
        {filterName}
      </th>
    </tr>
  </>
)

interface TBodyProps {
  data: Array<{
    avg: number
    name: string
  }>
}

const TBody: FC<TBodyProps> = ({ data }) => (
  <>
    {data.map(({ avg, name }, index) => (
      <tr key={index}>
        <Text model={{ text: index + 1 }} />
        <Text model={{ text: name }} />
        <Text model={{ value: avg }} />
      </tr>
    ))}
  </>
)

export default FactorType

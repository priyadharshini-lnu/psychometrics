import { CSSProperties, FC } from 'react'

import cs from 'classnames'
import _ from 'lodash'
import { JobRoles } from '~/modules/reports/models/Results/interfaces'
import { PreviewModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'
import { ColumnsHeaderData, ColumnData } from '~/modules/reports/core/interfaces/TableColumn'

import AppStore from '~/modules/reports/store/AppStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import I18nStore from '~/modules/reports/store/I18nStore'

import styles from './styles.less'
import { PageData } from '../../GapAssessment/PaginationContext'
import DefaultTableColumns from '~/modules/reports/consts/DefaultTableColumns'

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
  includesCurrentJob?: boolean
  includesTargetJob?: boolean
}

const FactorType: FC<Props> = ({
  assessment_id, filterId, factorIds, sections, tableStyle, hideValues, noOfItems, scoreCutoff,
  model, paginationContext, style, includesCurrentJob,
  includesTargetJob,
}) => {
  const tableColumns = _.get(model, 'props.tableColumns.Factor')
      || _.get(DefaultTableColumns[model.props.type]?.defaultTableColumns(I18nStore), 'Factor') || {} as ColumnData

  const columnsHeaderData: ColumnsHeaderData = {
    rank: {
      label: I18nStore.tTableColumns(model, 'Factor', 'rank.label'),
      hide: _.get(tableColumns, 'rank.hide'),
    },
    category: {
      label: I18nStore.tTableColumns(model, 'Factor', 'category.label'),
      hide: _.get(tableColumns, 'category.hide'),
    },
  }
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


  let providedFactorIds: number[]

  if (includesCurrentJob || includesTargetJob) {
    const dimensionId = AppStore.getAssessmentById(assessment_id)?.dimensionId ?? ''
    let allFactors: Array<{ id: number; name: string; job_roles: JobRoles }> = AppStore.factors?.[dimensionId] ?? []

    // If job role factors are selected, filter the data with appropriate job role
    allFactors = allFactors.filter((factor) => {
      const currentJobIncluded = !includesCurrentJob || factor?.job_roles?.current_job_role?.included === true
      const targetJobIncluded = !includesTargetJob || factor?.job_roles?.target_job_role?.included === true
      return currentJobIncluded && targetJobIncluded
    })


    // If specific factors are selected, intersect them with job-role filtered factors
    if (factorIds && factorIds.length > 0) {
      providedFactorIds = allFactors
        .filter(factor => factorIds?.includes(factor.id))
        .map(factor => factor.id)
    } else {
      providedFactorIds = allFactors.map(factor => factor.id)
    }
  } else {
    // No job role filtering needed, use original logic
    providedFactorIds = factorIds && factorIds.length > 0 ? factorIds : getAllFactors()
  }

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
                title={I18nStore.tTableColumns(model, 'Factor', 'highest.label')}
                filterName={filterName}
                hideValues={hideValues}
                columnsHeaderData={columnsHeaderData}
              />
              <TBody
                columnsHeaderData={columnsHeaderData}
                data={highestFactors}
                hideValues={hideValues}
                type="top"
                paginationContext={paginationContext}
              />
            </>
          )}
          {showLowest && (
            <>
              <THeaders
                title={I18nStore.tTableColumns(model, 'Factor', 'lowest.label')}
                filterName={filterName}
                hideValues={hideValues}
                columnsHeaderData={columnsHeaderData}
              />
              <TBody
                data={lowestFactors}
                columnsHeaderData={columnsHeaderData}
                hideValues={hideValues}
                type="bottom"
                paginationContext={paginationContext}
              />
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
  columnsHeaderData: ColumnsHeaderData
}

const THeaders: FC<THeadersProps> = ({
  title, filterName, hideValues, columnsHeaderData,
}) => (
  <>
    <tr className={styles.title} data-header>
      <th colSpan={hideValues ? 2 : 3}>
        {title}
      </th>
    </tr>
    <tr className={styles.headers} data-header>
      {!columnsHeaderData.rank.hide && (
        <th className={styles.label} scope="col">
          {columnsHeaderData.rank.label}
        </th>
      )}
      {!columnsHeaderData.category.hide && (
        <th className={styles.label} scope="col">
          {columnsHeaderData.category.label}
        </th>
      )}
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
  columnsHeaderData: ColumnsHeaderData
}

const TBody: FC<TBodyProps> = ({
  data, hideValues, paginationContext, type, columnsHeaderData,
}) => {
  const ranks = (data || []).reduce((acc, factor, i) => ({ ...acc, [factor.id]: i + 1 }), {})
  const paginatedData = paginationContext ? paginationContext.rowIds[type].map(id => data[id]) : data

  return (
    <>
      {(paginatedData || []).map((factor, index) => (
        <tr key={index} className={styles.row} data-row={index} data-type={type}>
          {!columnsHeaderData.rank.hide && <td>{ranks[factor.id]}</td>}
          {!columnsHeaderData.category.hide && <td>{I18nStore.tFactorName(factor)}</td>}
          {!hideValues && (
            <td className={styles.number}>{factor.avg}</td>
          )}
        </tr>
      ))}
    </>
  )
}

export default FactorType

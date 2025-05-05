import _ from 'lodash'
import { CSSProperties, FC } from 'react'
import reduce from 'lodash/reduce'
import meanBy from 'lodash/meanBy'
import isEmpty from 'lodash/isEmpty'
import cs from 'classnames'
import { ColumnData, ColumnsHeaderData } from '~/modules/reports/core/interfaces/TableColumn'
import {
  GapType, PropertiesModel, TableStyleType, PreviewModel,
} from '~/modules/reports/interfaces/tables/Gap'

import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import Utils from '~/modules/reports/utils'

import styles from './styles.less'
import { PageData } from '../PaginationContext'
import DefaultTableColumns from '~/modules/reports/consts/DefaultTableColumns'

type Gap = {
  name: string
  left: number
  right: number
  diff: number
}

const MOCK_POSITIVE_GAPS: Array<Gap> = [
  {
    name: 'Customer First',
    left: 5.0,
    right: 3.83,
    diff: 1.17,
  },
  {
    name: 'Leads Transformation',
    left: 4.83,
    right: 3.53,
    diff: 1.3,
  },
  {
    name: 'Greater Together',
    left: 4.83,
    right: 3.73,
    diff: 1.1,
  },
  {
    name: 'Game Changer',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
  },
  {
    name: 'Game Changer (1)',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
  },
]
const MOCK_NEGATIVE_GAPS: Array<Gap> = [
  {
    name: 'Leads Transformation',
    left: 1.83,
    right: 0.72,
    diff: -1.11,
  },
  {
    name: 'Greater Together',
    left: 1.83,
    right: 0.71,
    diff: -1.12,
  },
  {
    name: 'Game Changer',
    left: 1.83,
    right: 0.7,
    diff: -1.13,
  },
  {
    name: 'Customer First',
    left: 2.0,
    right: 0.83,
    diff: -1.17,
  },
  {
    name: 'Customer First (1)',
    left: 2.0,
    right: 0.83,
    diff: -1.17,
  },
]

interface Props {
  factorIds: PropertiesModel['props']['factorIds']
  filters: typeof AppStore.report.filters
  gapType: PropertiesModel['props']['gapType']
  assessment_id: PropertiesModel['assessment_id']
  tableStyle: TableStyleType
  hideValues: boolean
  noOfItems: number | null
  gapCutoff: number | null
  precision?: number
  showAllFactors?: boolean
  model: PreviewModel
  paginationContext: PageData | null
  style?: CSSProperties & { fontColor: string }
}

const Factor: FC<Props> = ({
  filters: [leftFilter, rightFilter],
  factorIds,
  assessment_id,
  tableStyle,
  gapType,
  hideValues,
  noOfItems,
  gapCutoff,
  precision,
  showAllFactors,
  model,
  paginationContext,
  style,
}) => {
  const tableColumns = _.get(model, 'props.tableColumns.Factor')
  || _.get(DefaultTableColumns[model.props.type]?.defaultTableColumns(I18nStore), 'Factor') || {} as ColumnData

  const columnsHeaderData: ColumnsHeaderData = {
    rank: {
      label: I18nStore.tTableColumns(model, 'Factor', 'rank.label'),
      hide: _.get(tableColumns, 'rank.hide'),
    },
    indicator: {
      label: I18nStore.tTableColumns(model, 'Factor', 'indicator.label'),
      hide: _.get(tableColumns, 'indicator.hide'),
    },
    gap: {
      label: I18nStore.tTableColumns(model, 'Factor', 'gap.label'),
      hide: _.get(tableColumns, 'gap.hide'),
    },
  }
  const calculateGaps = (
    assessmentId: PropertiesModel['assessment_id'],
    leftFilter: typeof AppStore.report.filters[0],
    rightFilter: typeof AppStore.report.filters[0],
    factorIds: PropertiesModel['props']['factorIds'],
  ): Array<Array<Gap>> => {
    const scoreWithLeftFilter = ResultStore?.results?.[assessmentId]?.resultsByFilter?.[leftFilter.id]
      ?.scoring ?? null
    const scoreWithRightFilter = ResultStore?.results?.[assessmentId]?.resultsByFilter?.[rightFilter.id]
      ?.scoring ?? null

    if (!scoreWithLeftFilter || !scoreWithRightFilter) {
      return [[], []]
    }

    const allFactors = reduce(
      scoreWithLeftFilter,
      (result, factor) => {
        const leftMean = meanBy(factor.results, r => r.getValue())
        const rightResults = scoreWithRightFilter[parseInt(factor.id, 10)]?.results

        if (!rightResults || isEmpty(rightResults)) {
          return result
        }
        const rightMean = meanBy(rightResults, r => r.getValue())
        return [
          ...result,
          {
            diff: leftMean - rightMean,
            left: leftMean,
            right: rightMean,
            ...factor,
          },
        ]
      },
      [],
    )

    const allowedFactors = showAllFactors
      ? allFactors
      : allFactors.filter(factor => factorIds.includes(parseInt(factor.id, 10)))
    const sortedFactors = allowedFactors.sort(
      (firstFactor, secondFactor) => secondFactor.diff - firstFactor.diff,
    )

    const minGap = gapCutoff ?? 0
    const itemLimit = noOfItems ?? 5

    const positiveGaps = sortedFactors
      .filter(factor => factor.diff > 0 && factor.diff >= minGap)
      .slice(0, itemLimit).map((gap, i) => ({ ...gap, rank: i + 1 }))
    const negativeGaps = sortedFactors
      .filter(factor => factor.diff < 0 && factor.diff <= -minGap)
      .slice(-itemLimit)
      .reverse().map((gap, i) => ({ ...gap, rank: i + 1 }))

    return [positiveGaps, negativeGaps]
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
    if (showAllFactors) {
      return data.map((d, i) => ({
        ...d,
        name: allFactors[i]?.name ?? '',
      }))
    }
    return factorIds.map((id, i) => ({
      ...data[i],
      name: allFactors.find(factor => factor.id === id)?.name ?? '',
    }))
  }

  // If no factors are selected, by default consider all factors
  const providedFactorIds = factorIds && factorIds.length > 0 ? factorIds : getAllFactors()


  const [positiveGaps, negativeGaps] = ResultStore.realResults
    ? calculateGaps(assessment_id, leftFilter, rightFilter, providedFactorIds)
    : [mockedResult(MOCK_POSITIVE_GAPS), mockedResult(MOCK_NEGATIVE_GAPS)]

  const showPositiveGapTable = paginationContext
    ? !!paginationContext?.rowIds?.top?.length : (gapType === GapType.ALL || gapType === GapType.POSITIVE)
  const showNegativeGapTable = paginationContext
    ? !!paginationContext?.rowIds?.bottom?.length : (gapType === GapType.ALL || gapType === GapType.NEGATIVE)
  const showTitle = gapType === GapType.ALL
  const styleProp = { fontSize: style?.fontSize, fontFamily: style?.fontFamily, color: style?.fontColor }

  return (
    <div className={cs(styles.table, styles[tableStyle])} style={styleProp}>
      <table>
        <tbody>
          {showPositiveGapTable && (
            <>
              <THeader
                title={
                  (showTitle && !_.get(tableColumns, 'positive_gaps.hide'))
                    ? I18nStore.tTableColumns(model, 'Factor', 'positive_gaps.label')
                    : ''
                }
                leftFilter={leftFilter}
                rightFilter={rightFilter}
                hideValues={hideValues}
                columnsHeaderData={columnsHeaderData}
              />
              <TBody
                gaps={positiveGaps}
                emptyText={I18nStore.t(
                  'reports.modules.gap_assessment.no_positive_gaps',
                )}
                hideValues={hideValues}
                precision={precision}
                columnsHeaderData={columnsHeaderData}
                type="top"
                paginationContext={paginationContext}
              />
            </>
          )}
          {showNegativeGapTable && (
            <>
              <THeader
                title={
                  (showTitle && !_.get(tableColumns, 'negative_gaps.hide'))
                    ? I18nStore.tTableColumns(model, 'Factor', 'negative_gaps.label')
                    : ''
                }
                leftFilter={leftFilter}
                rightFilter={rightFilter}
                hideValues={hideValues}
                columnsHeaderData={columnsHeaderData}
              />
              <TBody
                gaps={negativeGaps}
                emptyText={I18nStore.t(
                  'reports.modules.gap_assessment.no_negative_gaps',
                )}
                hideValues={hideValues}
                precision={precision}
                columnsHeaderData={columnsHeaderData}
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

interface THeaderProps {
  title: string
  leftFilter: typeof AppStore.report.filters[0]
  rightFilter: typeof AppStore.report.filters[0]
  hideValues: boolean
  columnsHeaderData: ColumnsHeaderData
}

const THeader: FC<THeaderProps> = ({
  leftFilter, rightFilter, title, hideValues, columnsHeaderData,
}) => (
  <>
    {title.length !== 0 && (
      <tr className={styles.title} data-header>
        <th colSpan={hideValues ? 3 : 6}>
          {title}
        </th>
      </tr>
    )}
    <tr className={styles.headers} data-header>
      {!columnsHeaderData.rank.hide && (
        <th className={styles.label}>
          {columnsHeaderData.rank.label}
        </th>
      )}
      {!columnsHeaderData.indicator.hide && (
        <th className={styles.label}>
          {columnsHeaderData.indicator.label}
        </th>
      )}
      {!hideValues && (
        <>
          <th className={styles.label}>{I18nStore.tFilterName(leftFilter)}</th>
          <th className={styles.label}>{I18nStore.tFilterName(rightFilter)}</th>
          {!columnsHeaderData.gap.hide && (
            <th className={styles.label}>
              {columnsHeaderData.gap.label}
            </th>
          )}
        </>
      )}
    </tr>
  </>
)

interface TBodyProps {
  gaps: Array<Gap>
  emptyText: string
  hideValues: boolean
  precision?: number
  columnsHeaderData: ColumnsHeaderData
  type: 'top' | 'bottom'
  paginationContext: PageData | null
}

const TBody: FC<TBodyProps> = ({
  gaps,
  emptyText,
  hideValues,
  precision,
  columnsHeaderData,
  type,
  paginationContext,
}) => {
  if (gaps.length === 0) {
    return (
      <tr data-row={0} data-type={type}>
        <td colSpan={5}>{emptyText}</td>
      </tr>
    )
  }


  const gapValue = (diff) => {
    if (diff === 0) { return 0 }

    return (diff > 0 ? '+' : '') + Utils.round(diff, precision ?? 2)
  }

  const data = paginationContext ? paginationContext.rowIds[type].map(id => gaps[id]) : gaps

  return (
    <>
      {data.map((gap, i) => (
        <tr key={i} className={styles.row} data-row={i} data-type={type}>
          {!columnsHeaderData.rank.hide && <td>{paginationContext ? gap.rank : (i + 1)}</td>}
          {!columnsHeaderData.indicator.hide && <td>{I18nStore.tFactorName(gap)}</td>}
          {!hideValues && (
            <>
              <td dir="ltr">{Utils.round(gap.left, precision ?? 2)}</td>
              <td dir="ltr">{Utils.round(gap.right, precision ?? 2)}</td>
              {!columnsHeaderData.gap.hide && <td dir="ltr">{gapValue(gap.diff)}</td>}
            </>
          )}
        </tr>
      ))}
    </>
  )
}

export default Factor

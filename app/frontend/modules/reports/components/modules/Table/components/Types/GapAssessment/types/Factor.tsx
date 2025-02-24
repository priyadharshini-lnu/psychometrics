import { CSSProperties, FC } from 'react'
import reduce from 'lodash/reduce'
import meanBy from 'lodash/meanBy'
import isEmpty from 'lodash/isEmpty'
import cs from 'classnames'
import { GapType, PropertiesModel, TableStyleType } from '~/modules/reports/interfaces/tables/Gap'

import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import Utils from '~/modules/reports/utils'

import styles from './styles.less'
import { PageData } from '../PaginationContext'

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
  paginationContext,
  style,
}) => {
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
                showTitle
                  ? I18nStore.t('reports.modules.gap_assessment.positive_gap')
                  : ''
              }
                leftFilter={leftFilter}
                rightFilter={rightFilter}
                hideValues={hideValues}
              />
              <TBody
                gaps={positiveGaps}
                emptyText={I18nStore.t(
                  'reports.modules.gap_assessment.no_positive_gaps',
                )}
                hideValues={hideValues}
                precision={precision}
                type="top"
                paginationContext={paginationContext}
              />
            </>
          )}
          {showNegativeGapTable && (
            <>
              <THeader
                title={
                  showTitle
                    ? I18nStore.t('reports.modules.gap_assessment.negative_gap')
                    : ''
                }
                leftFilter={leftFilter}
                rightFilter={rightFilter}
                hideValues={hideValues}
              />
              <TBody
                gaps={negativeGaps}
                emptyText={I18nStore.t(
                  'reports.modules.gap_assessment.no_negative_gaps',
                )}
                hideValues={hideValues}
                precision={precision}
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
}

const THeader: FC<THeaderProps> = ({
  leftFilter, rightFilter, title, hideValues,
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
      <th className={styles.label}>
        {I18nStore.t('reports.modules.gap_assessment.rank')}
      </th>
      <th className={styles.label}>
        {I18nStore.t('reports.modules.gap_assessment.item')}
      </th>
      {!hideValues && (
        <>
          <th className={styles.label}>{I18nStore.tFilterName(leftFilter)}</th>
          <th className={styles.label}>{I18nStore.tFilterName(rightFilter)}</th>
          <th className={styles.label}>
            {I18nStore.t('reports.modules.gap_assessment.gap')}
          </th>
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
  type: 'top' | 'bottom'
  paginationContext: PageData | null
}

const TBody: FC<TBodyProps> = ({
  gaps,
  emptyText,
  hideValues,
  precision,
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
          <td>{gap.rank}</td>
          <td>{I18nStore.tFactorName(gap)}</td>
          {!hideValues && (
            <>
              <td dir="ltr">{Utils.round(gap.left, precision ?? 2)}</td>
              <td dir="ltr">{Utils.round(gap.right, precision ?? 2)}</td>
              <td dir="ltr">{gapValue(gap.diff)}</td>
            </>
          )}
        </tr>
      ))}
    </>
  )
}

export default Factor

import _ from 'lodash'
import cs from 'classnames'
import { Flex } from 'antd'
import I18nStore from '~/modules/reports/store/I18nStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'
import styles from '../styles.less'
import MilestoneTd from './MilestoneTd'
import buildFakeData from '../buildFakeData'
import Legend from '../Legend'
import BarChart from './BarChart'

const FILTER_ROW_HEIGHT = 24
const DESC_COLUMN_WIDTH = 29

export default function Factor ({ model, filters, paginationContext }) {
  const getFactorMap = () => {
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const dimensionId = assessment && assessment.dimensionId
    return _.keyBy(AppStore.factors[dimensionId], f => f.id)
  }

  const enhanceFiltersByValue = (factor) => {
    if (!ResultStore.realResults) {
      const { milestones } = model.props
      return buildFakeData({ filters, milestones })
    }

    const enhancedFilters = filters.map((filter) => {
      const scoring = _.get(ResultStore, [
        'results',
        model.assessment_id,
        'resultsByFilter',
        filter.id,
        'scoring',
        factor.id,
      ])

      if (!scoring) return { ...filter, value: 0 }

      const nonZeroResults = _.filter(scoring.results, res => res.getValue())
      const value = _.round(_.meanBy(nonZeroResults, res => res.getValue()), 2)
      return { ...filter, value }
    })

    return enhancedFilters
  }

  const factorIds = model.props.allFactors
    ? AppStore.factorsByAssessmentId(model.assessment_id).map(f => f.id)
    : model.props.factorIds
  const {
    milestones, mainHeaderColor, secondHeaderColor, showAsBarChart,
    hideHeader, borderColor,
  } = model.props

  if (!filters.length || !factorIds.length) return null

  const filterIdsHavingResults = new Set()
  const filtersHavingResults = () => filters.filter(f => filterIdsHavingResults.has(f.id))
  const factorMap = getFactorMap()
  const milestoneColumnWidth = (100 - DESC_COLUMN_WIDTH) / milestones.length
  const getDescStyle = results => ({ minHeight: `${FILTER_ROW_HEIGHT * results.length}px` })
  const { fontSize, fontFamily, fontColor } = model.props.style
  const style = {
    fontSize,
    fontFamily,
    color: fontColor,
  }
  if (borderColor) {
    style.borderColor = borderColor
  }

  const paginatedFactorIds = paginationContext?.factorIds?.length
    ? factorIds.filter(id => paginationContext.factorIds.includes(id.toString())) : factorIds
  return (
    <>
      <div className={styles.table} style={style}>
        <table>
          {!hideHeader && (
            <thead data-table-header>
              <tr>
                <td
                  rowSpan={2}
                  className={cs(styles.label, styles.competencyLabel)}
                  width={`${DESC_COLUMN_WIDTH}%`}
                  style={{ color: mainHeaderColor }}
                >
                  {I18nStore.t('reports.modules.single_value_cluster.competency')}
                </td>
                <td
                  colSpan={milestones.length}
                  className={cs(styles.label, styles.factorLabel)}
                  style={{ color: mainHeaderColor }}
                >
                  {I18nStore.t('reports.modules.single_value_cluster.developmental_rating')}
                </td>
              </tr>
              <tr>
                {milestones.map(m => (
                  <td
                    key={m.id}
                    className={cs(styles.label, styles.milestoneLabel)}
                    style={{ borderBottomColor: `${m.color}`, color: secondHeaderColor }}
                    width={`${milestoneColumnWidth}%`}
                  >
                    {I18nStore.tMilestone(model, m)}
                  </td>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {paginatedFactorIds.map((id, i) => {
              const factor = factorMap[id]
              if (!factor) return null
              const results = enhanceFiltersByValue(factor).filter(r => r.value > 0)
              results.forEach(r => filterIdsHavingResults.add(r.id))
              const descStyle = getDescStyle(results)
              return (
                <tr key={id} data-row={i} data-factor-id={id}>
                  <td className={styles.factorcell}>
                    <div className={styles.factor} style={{ color: secondHeaderColor }}>
                      <Flex align="center" gap={5}>
                        {factor.icon && <div className="vertical-align"><img src={factor.icon} /></div>}
                        <span>{I18nStore.tFactor(factor, 'name')}</span>
                      </Flex>
                    </div>
                    <div className={styles.description} style={descStyle} width={`${DESC_COLUMN_WIDTH}%`}>
                      {I18nStore.tFactor(factor, 'description')}
                    </div>
                  </td>
                  {showAsBarChart
                    ? (
                      <BarChart filters={results} model={model} milestones={milestones} />
                    )
                    : milestones.map((m, i) => (
                      <MilestoneTd
                        columnWidth={milestoneColumnWidth}
                        filters={results}
                        milestoneIndex={i}
                        key={m.id}
                        model={model}
                        milestone={m}
                      />
                    ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!model.props?.hideLegend && <Legend filters={filtersHavingResults()} model={model} />}
    </>
  )
}

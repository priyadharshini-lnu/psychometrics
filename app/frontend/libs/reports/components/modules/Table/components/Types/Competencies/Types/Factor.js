import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import I18nStore from 'rb/store/I18nStore'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import styles from '../styles.scss'
import MilestoneTd from './MilestoneTd'
import buildFakeData from '../buildFakeData'

const LARGE_FILTER_ROW_HEIGHT = 24
const SMALL_FILTER_ROW_HEIGHT = 12
const DESC_COLUMN_WIDTH = 29

export default function Factor ({ model, filters }) {
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

    return _.sortBy(enhancedFilters, 'value')
  }

  const {
    milestones, factorIds, mainHeaderColor, secondHeaderColor, showValues,
  } = model.props

  if (!filters.length || !factorIds.length) return null
  const factorMap = getFactorMap()
  const milestoneColumnWidth = (100 - DESC_COLUMN_WIDTH) / milestones.length
  const rowHeight = showValues ? LARGE_FILTER_ROW_HEIGHT : SMALL_FILTER_ROW_HEIGHT
  const descStyle = { minHeight: `${rowHeight * filters.length}px` }
  const { fontSize, fontFamily } = model.props.style
  const style = {
    fontSize,
    fontFamily,
  }

  return (
    <div className={styles.table} style={style}>
      <table>
        <thead>
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
                {m.name}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {factorIds.map((id) => {
            const factor = factorMap[id]
            return (
              <tr key={id}>
                <td className={styles.factorcell}>
                  <div className={styles.factor} style={{ color: secondHeaderColor }}>
                    <div className="display-flex">
                      {factor.icon && <div className="vertical-align"><img src={factor.icon} /></div>}
                      <span className="mls">{I18nStore.tFactor(factor, 'name')}</span>
                    </div>
                  </div>
                  <div className={styles.description} style={descStyle}>{I18nStore.tFactor(factor, 'description')}</div>
                </td>
                {milestones.map((m, i) => (
                  <MilestoneTd
                    filters={filters}
                    milestoneIndex={i}
                    results={enhanceFiltersByValue(factor)}
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
  )
}

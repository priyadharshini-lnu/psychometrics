import React from 'react'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'
import ResultStore from 'rb/store/ResultStore'
import PreviewStore from 'rb/store/PreviewStore'
import math from 'rb/utils/math'
import styles from '../styles.scss'

const Factor = ({ model }) => {
  const assessment = AppStore.getAssessmentById(model.assessment_id)
  const factor = AppStore.factors[assessment.dimensionId].find(f => f.id === model.props.factorId)
  if (!factor || !model.props.filter) return null
  return (
    <div>
      {model.props.filter.map(filterId => (
        <Table factor={factor} key={filterId} filterId={filterId} model={model} />
      ))}
    </div>
  )
}

const ROWS = ['min', 'max', 'sum', 'mean', 'variance', 'standardDeviation', 'totalResponses', 'items']

const MOCK_RESULTS = {
  min: 0,
  max: 29,
  sum: 100,
  mean: 20.5,
  variance: 153.37,
  standardDeviation: 12.38,
  totalResponses: 6,
  items: 30,
}

function Table ({ filterId, model, factor }) {
  const filter = AppStore.report.filters.find(f => f.id === filterId)

  const displayNumber = number => (_.isNumber(number) ? _.round(number, 2) : '-')

  const getResults = () => {
    if (!ResultStore.realResults) return MOCK_RESULTS

    const scoring = _.get(
      ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id, 'scoring', factor.id],
    )
    if (!scoring) return null

    const results = scoring.results.map(r => r.value)
    const min = _.min(results)
    const max = _.max(results)
    const mean = _.mean(results)
    const sum = _.sum(results)
    const variance = math.variance(results)
    const standardDeviation = math.standardDeviation(results)
    const assessment = _.get(PreviewStore, ['assessment', 'assessments']).find(a => a.id === model.assessment_id) || {}
    return {
      min: displayNumber(min),
      max: displayNumber(max),
      sum: displayNumber(sum),
      mean: displayNumber(mean),
      variance: displayNumber(variance),
      standardDeviation: displayNumber(standardDeviation),
      totalResponses: scoring.results.length,
      items: assessment.factor_scoring_counters[factor.id] || 0,
    }
  }

  const results = getResults()
  if (!results) { return null }

  return (
    <table className={styles.table}>
      <tbody>
        <tr>
          <td className={styles.label} colSpan={2}>
            {I18nStore.tFilterName(filter)}
          </td>
        </tr>
        <tr>
          <td className={styles.label}>{I18nStore.t('reports.modules.three_sixty_default.statistic')}</td>
          <td className={styles.label}>{I18nStore.t('reports.modules.three_sixty_default.value')}</td>
        </tr>
        {ROWS.map((row, i) => (
          <tr key={i}>
            <td>{I18nStore.t(`reports.modules.three_sixty_default.factor.${row}`)}</td>
            <td>{results[row]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Factor

import React from 'react'
import cs from 'classnames'
import { getIn } from 'utils/immutable'
import I18nStore from 'rb/store/I18nStore'
import AppStore from 'rb/store/AppStore'
import ResultStore from 'rb/store/ResultStore'
import _ from 'lodash'
import styles from './styles.scss'

export default function ThreeSixtyReportSummary ({ model }) {
  const buildResults = (filters) => {
    const evaluatorsByFilter = filters.reduce((res, filter) => {
      const evaluators = (getIn(ResultStore, ['campaignDetails', 'evaluators']) || [])
        .filter(evaluator => filter.correctByFilter(evaluator))
      return { ...res, [filter.id]: evaluators }
    }, {})
    return filters.map(filter => ({
      ...filter,
      completed: countCompleted(evaluatorsByFilter[filter.id]),
      invited: countInvited(evaluatorsByFilter[filter.id]),
    }
    )).filter(filter => filter.invited > 0)
  }

  const buildTotal = results => results.reduce((total, result) => ({
    invited: result.invited + total.invited,
    completed: result.completed + total.completed,
  }), { invited: 0, completed: 0 })

  const countCompleted = (evaluators) => {
    if (!ResultStore.realResults) return 5


    if (ResultStore.campaignDetails.options.canApprovesEvaluations) {
      return _.countBy(evaluators, r => r.managerEvaluationStatus).approved || 0
    }

    return _.countBy(evaluators, r => r.status).completed || 0
  }

  const countInvited = (evaluators) => {
    if (!ResultStore.realResults) return 9

    return evaluators.length || 0
  }


  let filters = (model.props.filter || []).map(id => _.find(AppStore.report.filters, { id }))
  filters = _.compact(filters)

  if (!filters.length) return null

  const results = buildResults(filters)
  const total = buildTotal(results)

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={cs(styles.label, styles.tdLeft)}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.relationships')}
            </th>
            <th className={cs(styles.label, styles.tdRight)}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.invited')}
            </th>
            <th className={cs(styles.label, styles.tdRight)}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.completed')}
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <FilterRow key={result.id} filter={result} model={model} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className={styles.tdLabel}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.total')}
            </td>
            <td className={styles.tdValue}>{total.invited}</td>
            <td className={styles.tdValue}>{total.completed}</td>
          </tr>
        </tfoot>
      </table>
      <div className={styles.footNote}>{I18nStore.t('reports.modules.three_sixty_report_summary.footnote')}</div>
    </div>
  )
}

function FilterRow ({ filter }) {
  const getCompleted = () => {
    if (filter.minRequiredResponses > filter.completed && filter.completed > 0) {
      return (
        <span>
          {filter.completed}
          <span className={styles.star}>*</span>
        </span>
      )
    }

    return filter.completed
  }

  return (
    <tr>
      <td className={styles.tdLabel}>
        {filter.name}
      </td>
      <td className={styles.tdValue}>{filter.invited}</td>
      <td className={styles.tdValue}>{getCompleted()}</td>
    </tr>
  )
}

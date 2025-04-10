import cs from 'classnames'
import _ from 'lodash'
import { getIn } from '~/utils/immutable'
import I18nStore from '~/modules/reports/store/I18nStore'
import AppStore from '~/modules/reports/store/AppStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import styles from './styles.less'
import DefaultTableColumns from '~/modules/reports/consts/DefaultTableColumns'

export default function ThreeSixtyReportSummary ({ model }) {
  const { fontFamily, fontSize, fontColor } = model.props.style
  const styleProp = { fontFamily, fontSize, color: fontColor }

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

  const tableColumns = _.get(model, 'props.tableColumns')
      || DefaultTableColumns[model.props.type]?.defaultTableColumns(I18nStore) || {}
  const showRelationships = !_.get(tableColumns, 'relationships.hide')
  const showInvited = !_.get(tableColumns, 'invited.hide')
  const showCompleted = !_.get(tableColumns, 'completed.hide')

  let filters = (Array.isArray(model.props.filter) ? model.props.filter : [])
    .map(id => _.find(AppStore.report.filters, { id }))
  filters = _.compact(filters)

  if (!filters.length) return null

  const results = buildResults(filters)
  const total = buildTotal(results)

  return (
    <div className={styles.container} style={styleProp}>
      <table className={styles.table}>
        <thead>
          <tr>
            {showRelationships && (
              <th className={cs(styles.label, styles.tdLeft)}>
                {I18nStore.tTableColumns(model, '', 'relationships.label')}
              </th>
            )}
            {showInvited && (
              <th className={cs(styles.label, styles.tdRight)}>
                {I18nStore.tTableColumns(model, '', 'invited.label')}
              </th>
            )}
            {showCompleted && (
              <th className={cs(styles.label, styles.tdRight)}>
                {I18nStore.tTableColumns(model, '', 'completed.label')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <FilterRow
              key={result.id}
              filter={result}
              showRelationships={showRelationships}
              showInvited={showInvited}
              showCompleted={showCompleted}
            />
          ))}
        </tbody>
        <tfoot>
          <tr>
            { showRelationships && (
              <td className={styles.tdLabel}>
                {I18nStore.t('reports.modules.three_sixty_report_summary.total')}
              </td>
            )}
            {showInvited && <td className={styles.tdValue}>{total.invited}</td>}
            { showCompleted && <td className={styles.tdValue}>{total.completed}</td>}
          </tr>
        </tfoot>
      </table>
      <div className={styles.footNote}>{I18nStore.t('reports.modules.three_sixty_report_summary.footnote')}</div>
    </div>
  )
}

function FilterRow ({
  filter, showRelationships, showInvited, showCompleted,
}) {
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
      {showRelationships && (
        <td className={styles.tdLabel}>
          {I18nStore.tFilterName(filter)}
        </td>
      )}
      {showInvited && <td className={styles.tdValue}>{filter.invited}</td>}
      {showCompleted && <td className={styles.tdValue}>{getCompleted()}</td>}
    </tr>
  )
}

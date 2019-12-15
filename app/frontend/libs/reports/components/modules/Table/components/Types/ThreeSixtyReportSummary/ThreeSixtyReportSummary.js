import React, { Component } from 'react'
import I18nStore from 'rb/store/I18nStore'
import AppStore from 'rb/store/AppStore'
import ResultStore from 'rb/store/ResultStore'
import _ from 'lodash'
import styles from './styles.scss'

const MOCK_CAMPAIGN_DETAILS = {
  invitedEvaluators: 6,
  receivedEvaluations: 4,
  totalEvaluatorsForAssessment: 10,
}

const MOCK_USER_RESULTS = {
  email: 'tempuser@gmail.com',
}

export default class ThreeSixtyReportSummary extends Component {
  getCampaignDetails () {
    return ResultStore.campaignDetails || MOCK_CAMPAIGN_DETAILS
  }

  getUser () {
    return ResultStore.user || MOCK_USER_RESULTS
  }

  render () {
    const { model } = this.props
    if (!model.props.filter) return null

    const filters = AppStore.report.filters.filter(f => model.props.filter.includes(f.id))
    return (
      <table className={styles.table}>
        <tbody>
          <tr>
            <td className={styles.label} colSpan={2}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.title')}
            </td>
          </tr>
          {/* <tr>
            <td>{I18nStore.t('reports.modules.three_sixty_report_summary.subject')}</td>
            <td>{userPresenter.getFullNameWithEmail(this.getUser())}</td>
          </tr> */}
          <tr>
            <td className={styles.tdLabel}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.number_of_evaluators_invited')}
            </td>
            <td className={styles.tdValue}>{this.getCampaignDetails().invitedEvaluators}</td>
          </tr>
          <tr>
            <td className={styles.tdLabel}>
              {I18nStore.t('reports.modules.three_sixty_report_summary.number_of_evaluators_received')}
            </td>
            <td className={styles.tdValue}>{this.getCampaignDetails().receivedEvaluations}</td>
          </tr>
          {/* <tr>
            <td>{I18nStore.t('reports.modules.three_sixty_report_summary.total_evaluations')}</td>
            <td>{this.getCampaignDetails().totalEvaluatorsForAssessment}</td>
          </tr> */}
          {filters.map(filter => (
            <FilterRow key={filter.id} filter={filter} model={model} />
          ))}
        </tbody>
      </table>
    )
  }
}

function FilterRow ({ filter, model }) {
  const getResult = () => {
    if (!ResultStore.realResults) return 9

    const result = _.get(ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id])
    if (!result) return '-'

    if (ResultStore.campaignDetails.options.canApprovesEvaluations) {
      return _.countBy(result.rawResults, r => r.manager_evaluation_status).approved || 0
    }

    return _.countBy(result.rawResults, r => r.status).completed || 0
  }

  return (
    <tr>
      <td className={styles.tdLabel}>
        {I18nStore.t('reports.modules.three_sixty_report_summary.number_by_filter_evaluations_received', {
          filter: filter.name,
        })}
      </td>
      <td className={styles.tdValue}>{getResult()}</td>
    </tr>
  )
}

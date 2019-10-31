import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import styles from './HighestLowest.scss'
import Text from '../../Table/CellTypes/Text/Text'

const MockData = [
  { avg: 5.0, name: 'Customer First' },
  { avg: 4.83, name: 'Game Changer' },
  { avg: 3.90, name: 'Greater Together' },
  { avg: 3.30, name: 'Leads Transformation' },
  { avg: 3.00, name: 'Passion For Results' },
]

export default class FactorHighestLowest extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    const { module } = this.props
    let data = []
    if (ResultStore.realResults) {
      data = ResultStore.results[module.assessment_id].getAverageFactorScore(module.props.filter)
    } else {
      data = MockData
    }

    const sorted = _.sortBy(data, d => d.avg)
    this.topData = _.reverse(_.takeRight(sorted, 5))
    this.bottomData = _.take(sorted, 5)
  }

  renderScores (data) {
    return _.map(data, ({ avg, name }, i) => (
      <tr key={i}>
        <Text model={{ text: i + 1 }} />
        <Text model={{ text: name }} />
        <Text model={{ value: avg }} />
      </tr>
    ))
  }

  render () {
    this.prepareRows()
    if (_.isEmpty(this.topData)) {
      return <div>There are no assessment responses that matches the filter to show highest/lowest factor table</div>
    }
    return (
      <div className={styles.table}>
        <table>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={4}>
                {I18nStore.t('reports.modules.highest_lowest.highest_scores')}
              </td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.category')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.result')}</td>
            </tr>
            {this.renderScores(this.topData)}
            <tr>
              <td className={styles.label} colSpan={4}>
                {I18nStore.t('reports.modules.highest_lowest.lowest_scores')}
              </td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.category')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.result')}</td>
            </tr>
            {this.renderScores(this.bottomData)}
          </tbody>
        </table>
      </div>
    )
  }
}

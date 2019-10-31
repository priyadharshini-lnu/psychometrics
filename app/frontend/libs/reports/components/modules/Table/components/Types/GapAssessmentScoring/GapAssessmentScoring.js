import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'
import Utils from 'rb/utils'
import Scoring from 'rb/models/Scoring'
import Text from '../../Table/CellTypes/Text/Text'
import styles from './GapAssessmentScoring.scss'

const MockData = {
  1: {
    scoring: {
      1: {
        name: 'Factor1',
        results: [
          new Scoring({ value: 2.57 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 5 }),
        ],
      },
      2: {
        name: 'Factor 2',
        results: [
          new Scoring({ value: 3.87 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 5 }),
        ],
      },
      3: {
        name: 'Factor 4',
        results: [
          new Scoring({ value: 3.27 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 0.87 }),
        ],
      },
      4: {
        name: 'Factor 5',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 0.87 }),
        ],
      },
      460: {
        name: 'Factor 6',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 1.57 }),
        ],
      },
      459: {
        name: 'Factor 7',
        results: [
          new Scoring({ value: 2.17 }),
          new Scoring({ value: 1 }),
          new Scoring({ value: 1.57 }),
        ],
      },
    },
  },
  2: {
    scoring: {
      1: {
        name: 'Factor1',
        results: [
          new Scoring({ value: 3.57 }),
          new Scoring({ value: 3 }),
          new Scoring({ value: 2 }),
        ],
      },
      2: {
        name: 'Factor 2',
        results: [
          new Scoring({ value: 1.87 }),
          new Scoring({ value: 2 }),
          new Scoring({ value: 3 }),
        ],
      },
      3: {
        name: 'Factor 4',
        results: [
          new Scoring({ value: 4.27 }),
          new Scoring({ value: 2 }),
          new Scoring({ value: 3.87 }),
        ],
      },
      4: {
        name: 'Factor 5',
        results: [
          new Scoring({ value: 2.17 }),
          new Scoring({ value: 1 }),
          new Scoring({ value: 3.87 }),
        ],
      },
      460: {
        name: 'Factor 6',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 2 }),
          new Scoring({ value: 2.57 }),
        ],
      },
      459: {
        name: 'Factor 7',
        results: [
          new Scoring({ value: 2.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 3.57 }),
        ],
      },
    },
  },
}

class ResponseSummary extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      data = ResultStore.results[module.assessment_id].resultsByFilter
    } else {
      data = MockData
      const filterIds = module.props.filter
      _.each(filterIds, (id, i) => {
        data[id] = data[i + 1] || { scoring: {} }
      })
    }

    const filters = {}
    _.each(data, (filter, filterId) => {
      _.each(filter.scoring, (scoring) => {
        const sum = _.reduce(scoring.results, (sum, obj) => sum + obj.getValue(), 0)
        scoring.mean = sum / scoring.results.length
      })
      filters[filterId] = filter
    })
    const filterIds = _.take(module.props.filter, 2)
    const left = filters[filterIds[0]]
    const right = filters[filterIds[1]]
    if (!left || !right) { return }
    _.each(left.scoring, (scoring, id) => {
      scoring.rightValue = right.scoring[id].mean
      scoring.diff = scoring.mean - right.scoring[id].mean
      scoring.id = parseInt(id, 10)
    })

    const sorted = _.sortBy(left.scoring, d => -d.diff)
    const top = _.take(_.takeWhile(sorted, d => d.diff > 0), 5)
    const bottom = _.take(_.takeRightWhile(sorted, d => d.diff < 0), 5)
    this.topData = top
    this.bottomData = bottom
  }

  render () {
    const { module } = this.props
    this.prepareRows()
    const filters = _.take(module.props.filter, 2)
    const left = _.find(AppStore.report.filters, { id: filters[0] })
    const right = _.find(AppStore.report.filters, { id: filters[1] })
    if (!left || !right) { return null }
    return (
      <div className={styles.table}>
        <div className={styles.table}>
          <table>
            <tbody>
              <tr>
                <td className={styles.label} colSpan={6}>
                  {I18nStore.t('reports.modules.gap_assessment.positive_gap')}
                </td>
              </tr>
              <tr>
                <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.rank')}</td>
                <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.item')}</td>
                <td className={styles.label}>{I18nStore.tFilterName(left)}</td>
                <td className={styles.label}>{I18nStore.tFilterName(right)}</td>
                <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.gap')}</td>
              </tr>
              {_.map(this.topData, (data, i) => {
                if (data.diff < 0) {
                  return
                }
                return (
                  <tr key={i}>
                    <Text model={{ text: i + 1 }} />
                    <Text model={{ text: I18nStore.tFactorName(data) }} />
                    <Text model={{ value: Utils.round(data.mean) }} />
                    <Text model={{ value: Utils.round(data.rightValue) }} />
                    <Text model={{ value: Utils.round(data.diff) }} />
                  </tr>
                )
              })}
            </tbody>
          </table>
          <table className={styles.bottom}>
            <tbody>
              <tr>
                <td className={styles.label} colSpan={6}>
                  {I18nStore.t('reports.modules.gap_assessment.negative_gap')}
                </td>
              </tr>
              <tr>
                <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.rank')}</td>
                <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.item')}</td>
                <td className={styles.label}>{I18nStore.tFilterName(left)}</td>
                <td className={styles.label}>{I18nStore.tFilterName(right)}</td>
                <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.gap')}</td>
              </tr>
              {_.map(this.bottomData, (data, i) => {
                if (data.diff > 0) {
                  return
                }
                return (
                  <tr key={i}>
                    <Text model={{ text: i + 1 }} />
                    <Text model={{ text: I18nStore.tFactorName(data) }} />
                    <Text model={{ value: Utils.round(data.mean) }} />
                    <Text model={{ value: Utils.round(data.rightValue) }} />
                    <Text model={{ value: Utils.round(data.diff) }} />
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default ResponseSummary

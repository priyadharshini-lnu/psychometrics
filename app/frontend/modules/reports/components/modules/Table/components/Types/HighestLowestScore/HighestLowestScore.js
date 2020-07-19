import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import Utils from 'rb/utils'
import Scoring from 'rb/models/Scoring'
import Text from '../../Table/CellTypes/Text/Text'
import styles from './HighestLowestScore.scss'

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
      459: {
        name: 'Factor 5',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 0.87 }),
        ],
      },
      5: {
        name: 'Factor 6',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 1.57 }),
        ],
      },
    },
  },
}

class HighestLowestScore extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      data = ResultStore.results[module.assessment_id].scoring
    } else {
      data = MockData[1].scoring
    }
    _.each(data, (d, factorId) => {
      const sum = d.results.reduce((a, b) => a + b.getValue(), 0)
      d.meanScore = Utils.round(sum / d.results.length, 2)
      d.id = parseInt(factorId, 10)
    })
    const sorted = _.sortBy(data, d => -d.meanScore)
    const top = _.take(sorted, 5)
    const bottom = _.takeRight(sorted, 5)
    this.topData = top
    this.bottomData = bottom
  }

  render () {
    this.prepareRows()

    return (
      <div className={styles.table}>
        <table>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={3}>{I18nStore.t('reports.modules.highest_lowest.top_5')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.sub_competenties')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.mean_score')}</td>
            </tr>
            {_.map(this.topData, (data, i) => (
              <tr key={i}>
                <Text model={{ text: i + 1 }} />
                <Text model={{ text: I18nStore.tFactorName(data) }} />
                <Text model={{ text: data.meanScore }} />
              </tr>
            ))}
          </tbody>
        </table>
        <table className={styles.bottom}>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={3}>{I18nStore.t('reports.modules.highest_lowest.bottom_5')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.sub_competenties')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.mean_score')}</td>
            </tr>
            {_.map(this.bottomData, (data, i) => (
              <tr key={i}>
                <Text model={{ text: 5 - i }} />
                <Text model={{ text: I18nStore.tFactorName(data) }} />
                <Text model={{ text: data.meanScore }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default HighestLowestScore

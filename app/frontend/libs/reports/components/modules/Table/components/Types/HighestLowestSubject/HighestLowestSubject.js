import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import Utils from 'rb/utils'
import Text from '../../Table/CellTypes/Text/Text'
import styles from './HighestLowestSubject.scss'

const MockData = {
  3: {
    firstName: 'FirstName1',
    lastName: 'LastName1',
    email: 'user1@email.com',
    scoring: 3.6,
  },
  4: {
    firstName: 'FirstName2',
    lastName: 'LastName2',
    email: 'user2@email.com',
    scoring: 3.1,
  },
  5: {
    firstName: 'FirstName3',
    lastName: 'LastName3',
    email: 'user3@email.com',
    scoring: 1.1,
  },
  6: {
    firstName: 'FirstName4',
    lastName: 'LastName4',
    email: 'user4@email.com',
    scoring: 4.2,
  },
  7: {
    firstName: 'FirstName5',
    lastName: 'LastName5',
    email: 'user5@email.com',
    scoring: 2.7,
  },
  8: {
    firstName: 'FirstName6',
    lastName: 'LastName6',
    email: 'user6@email.com',
    scoring: 3.4,
  },
}

class HighestLowestQuestion extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      if (module.props.filter) {
        data = ResultStore.results[module.assessment_id].resultsByFilter[module.props.filter].usersScoring
      } else {
        data = ResultStore.results[module.assessment_id].usersScoring
      }
    } else {
      data = MockData
    }
    const sorted = _.sortBy(data, d => -d.scoring)
    const top = _.take(sorted, 5)
    const bottom = _.takeRight(sorted, 5)
    this.topData = top
    this.bottomData = bottom.reverse()
  }

  render () {
    this.prepareRows()
    return (
      <div className={styles.table}>
        <table>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={5}>
                {I18nStore.t('reports.modules.highest_lowest.highest_scores')}
              </td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.first_name')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.last_name')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.email')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.score')}</td>
            </tr>
            {_.map(this.topData, (data, i) => (
              <tr key={i}>
                <Text model={{ text: i + 1 }} />
                <Text model={{ text: data.firstName }} />
                <Text model={{ text: data.lastName }} />
                <Text model={{ value: data.email }} />
                <Text model={{ value: Utils.round(data.scoring, 2) }} />
              </tr>
            ))}
          </tbody>
        </table>
        <table className={styles.bottom}>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={5}>
                {I18nStore.t('reports.modules.highest_lowest.lowest_scores')}
              </td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.first_name')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.last_name')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.email')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.score')}</td>
            </tr>
            {_.map(this.bottomData, (data, i) => (
              <tr key={i}>
                <Text model={{ text: i + 1 }} />
                <Text model={{ text: data.firstName }} />
                <Text model={{ text: data.lastName }} />
                <Text model={{ value: data.email }} />
                <Text model={{ value: Utils.round(data.scoring, 2) }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default HighestLowestQuestion

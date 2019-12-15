/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import styles from './AgileFactors.scss'
import Img1 from './images/1.png'
import Img2 from './images/2.png'
import Img3 from './images/3.png'

const MockData = [
  {
    id: 471,
    name: 'Receptive',
    alias: 'Receptive',
    icon: Img1,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    name: 'Contemplative',
    alias: 'Contemplative',
    icon: Img2,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    name: 'Conceptual',
    alias: 'Conceptual',
    icon: Img3,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
]

class ResponseSummary extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareData () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      const ids = _.result(module.props, 'source.id')
      if (ids) {
        data = ResultStore.results[module.assessment_id].getTopAgileFactors(
          ids, module.props.group, module.props.count,
        )
      }
    } else {
      data = _.take(MockData, module.props.count)
    }
    this.rowData = data || []
  }

  render () {
    this.prepareData()
    const data = this.rowData
    return (
      <div className={styles.table}>
        <table>
          <tbody>
            {_.map(data, (factor, id) => (
              <tr key={id}>
                <td className={styles.factor}>
                  <div className={styles.lines}>
                    <div className={styles.name}>
                      <img src={factor.icon} />
                      <div className={styles.text}>{I18nStore.tFactor(factor, 'alias')}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.textTop}>
                  {I18nStore.tFactor(factor, 'description')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ResponseSummary

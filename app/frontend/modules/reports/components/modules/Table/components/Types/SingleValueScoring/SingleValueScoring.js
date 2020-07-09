import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Utils from 'rb/utils'
import AppStore from 'rb/store/AppStore'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import Scoring from 'rb/models/Scoring'
import styles from './SingleValueScoring.scss'

const MockData = {
  3: {
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
      5: {
        name: 'Factor 6',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 1.57 }),
        ],
      },
      6: {
        name: 'Factor 7',
        results: [
          new Scoring({ value: 2.17 }),
          new Scoring({ value: 1 }),
          new Scoring({ value: 1.57 }),
        ],
      },
    },
  },
  4: {
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
      5: {
        name: 'Factor 6',
        results: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 2 }),
          new Scoring({ value: 2.57 }),
        ],
      },
      6: {
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

  prepareData () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      data = ResultStore.results[module.assessment_id].resultsByFilter
    } else {
      data = MockData

      const filterIds = module.props.filter
      _.each(filterIds, (id) => {
        data[id] = data[id] || { scoring: {} }
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

    this.rowData = filters
  }

  render () {
    this.prepareData()
    const { module: model } = this.props
    const factors = _.result(model.props, 'source.factors') || []
    const filterIds = model.props.filter || []
    const { filters } = AppStore.report

    return (
      <div className={styles.table}>
        <table>
          <thead style={{ visibility: !model.props.showHeader ? 'hidden' : 'visible' }}>
            <tr>
              <td style={{ width: '15%' }} />
              {factors.map((factor, i) => (
                <td key={i} style={{ width: '10%' }}>{I18nStore.tFactorName(factor)}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {filterIds.map((id) => {
              const filter = _.find(filters, { id })
              const filterData = this.rowData[id]
              return (
                <tr key={id}>
                  <td>{I18nStore.tFilterName(filter)}</td>
                  {_.map(factors, (factor, i) => {
                    const scoring = (filterData.scoring && filterData.scoring[factor.id]) || {}
                    return (
                      <td key={i}>{Utils.round(scoring.mean, 2) || '-'}</td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ResponseSummary

import React, { Component } from 'react'
import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import Utils from 'rb/utils'
import ResultStore from 'rb/store/ResultStore'
import styles from '../styles.scss'

const MOCK_POSITIVE_FACTORS = [
  {
    name: 'Customer First',
    left: 5.0,
    right: 3.83,
    diff: 1.17,
  },
  {
    name: 'Leads Transformation',
    left: 4.83,
    right: 3.53,
    diff: 1.3,
  },
  {
    name: 'Greater Together',
    left: 4.83,
    right: 3.73,
    diff: 1.1,
  },
  {
    name: 'Game Changer',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
  },
  {
    name: 'Game Changer (1)',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
  },
]
const MOCK_NEGATIVE_FACTORS = [
  {
    name: 'Leads Transformation',
    left: 1.83,
    right: 0.72,
    diff: 1.11,
  },
  {
    name: 'Greater Together',
    left: 1.83,
    right: 0.71,
    diff: 1.12,
  },
  {
    name: 'Game Changer',
    left: 1.83,
    right: 0.7,
    diff: 1.13,
  },
  {
    name: 'Customer First',
    left: 2.0,
    right: 0.83,
    diff: 1.17,
  },
  {
    name: 'Customer First (1)',
    left: 2.0,
    right: 0.83,
    diff: 1.17,
  },
]
export default class Factor extends Component {
  getResults = () => {
    const {
      model,
      filters: [left, right],
    } = this.props
    if (!ResultStore.realResults) return [MOCK_POSITIVE_FACTORS, MOCK_NEGATIVE_FACTORS]

    const scoringLeft = _.get(ResultStore, ['results', model.assessment_id, 'resultsByFilter', left.id, 'scoring'])
    const scoringRight = _.get(ResultStore, ['results', model.assessment_id, 'resultsByFilter', right.id, 'scoring'])
    if (!scoringLeft || !scoringRight) return [[], []]

    let factors = _.reduce(
      scoringLeft,
      (result, factor) => {
        const leftMean = _.meanBy(factor.results, r => r.getValue())
        const rightMean = _.meanBy(scoringRight[factor.id].results, r => r.getValue())
        return [
          ...result,
          {
            diff: leftMean - rightMean,
            left: leftMean,
            right: rightMean,
            ...factor,
          },
        ]
      },
      [],
    )
    factors = _.sortBy(factors, d => -d.diff)
    const positive = _.take(_.takeWhile(factors, d => d.diff > 0), 5)
    const negative = _.take(_.takeRightWhile(factors, d => d.diff < 0), 5)

    return [positive, negative]
  }

  render () {
    const { filters } = this.props

    const [positive, negative] = this.getResults()
    return (
      <div className={styles.table}>
        <div className={styles.table}>
          <Table
            title={I18nStore.t('reports.modules.gap_assessment.positive_gap')}
            emptyText={I18nStore.t('reports.modules.gap_assessment.no_positive_gaps')}
            filters={filters}
            factors={positive}
          />
          <Table
            title={I18nStore.t('reports.modules.gap_assessment.negative_gap')}
            emptyText={I18nStore.t('reports.modules.gap_assessment.no_negative_gaps')}
            filters={filters}
            factors={negative}
          />
        </div>
      </div>
    )
  }
}

function Table ({
  filters: [left, right], title, factors, emptyText,
}) {
  return (
    <table>
      <thead>
        <tr>
          <td className={styles.label} colSpan={6}>
            {title}
          </td>
        </tr>
        <tr>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.rank')}</td>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.item')}</td>
          <td className={styles.label}>{I18nStore.tFilterName(left)}</td>
          <td className={styles.label}>{I18nStore.tFilterName(right)}</td>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.gap')}</td>
        </tr>
      </thead>
      <TBody factors={factors} emptyText={emptyText} />
    </table>
  )
}

function TBody ({ factors, emptyText }) {
  if (!factors.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={5}>{emptyText}</td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {_.map(factors, (factor, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{I18nStore.tFactorName(factor)}</td>
          <td>{Utils.round(factor.left, 2)}</td>
          <td>{Utils.round(factor.right, 2)}</td>
          <td>{Utils.round(factor.diff, 2)}</td>
        </tr>
      ))}
    </tbody>
  )
}

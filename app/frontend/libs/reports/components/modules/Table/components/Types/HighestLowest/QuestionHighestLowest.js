/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import Utils from 'rb/utils/Utils'
import Text from '../../Table/CellTypes/Text/Text'
import styles from './HighestLowest.scss'

const QUESTIONS = {
  1: { props: { questionText: 'Invest in global relationship by building strong key customer relationshios at the highest levels' } },
  2: { props: { questionText: 'Instils pride and commitment by cultivating a continous learning culture' } },
  3: { props: { questionText: 'Demonstatres organisational resillience by addressing change resistance and mitigating potential risks' } },
  4: { props: { questionText: 'Fosters a change mindset and supports to build change capablities acress the organization' } },
  5: { props: { questionText: 'Create a powerful startergy for transformation that will deliver short term result as well as build sustainable differentiation and performance in the longer run' } },
  6: { props: { questionText: 'Influences and mobilises all in organization to embrace fundamental change to our customer value propositions and End2End processes' } },
  7: { props: { questionText: 'Actively builds a culture where experimenting, failing and learning are seen as necessary to deiver innovation and growth' } },
}

const MockData = [
  { id: 1, avg: 5.0, factorName: 'Customer First' },
  { id: 2, avg: 4.83, factorName: 'Game Changer' },
  { id: 3, avg: 4.83, factorName: 'Greater Together' },
  { id: 4, avg: 4.83, factorName: 'Leads Transformation' },
  { id: 5, avg: 4.83, factorName: 'Leads Transformation' },
  { id: 6, avg: 4.44, factorName: 'Passion For Results' },
  { id: 7, avg: 4.1, factorName: 'Passion For Results' },
  { id: 8, avg: 3.2, factorName: 'Game Changer' },
]

export default class QuestionHighestLowest extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      data = ResultStore.results[module.assessment_id].questionScoringWithoutFactors(module.props.filter)
    } else {
      data = MockData
    }

    const sorted = _.sortBy(data, d => d.avg)
    this.topData = _.reverse(_.takeRight(sorted, 5))
    this.bottomData = _.take(sorted, 5)
  }

  renderScores (data) {
    const { module } = this.props
    const assessmentId = module.assessment_id
    const questions = ResultStore.realResults ? AssessmentStore.questions[assessmentId] : QUESTIONS
    return _.map(data, ({ id, avg, factorName }, i) => {
      const question = questions[id]
      return (
        <tr key={i}>
          <Text model={{ text: i + 1 }} />
          <Text model={{ text: factorName }} />
          <td>{Utils.stripHTML(_.result(question, 'props.questionText'))}</td>
          <Text model={{ value: avg }} />
        </tr>
      )
    })
  }

  render () {
    this.prepareRows()
    if (_.isEmpty(this.topData)) {
      return <div>There are no assessment responses that matches the filter to show highest/lowest question table</div>
    }
    return (
      <div className={styles.table}>
        <table>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={4}>{I18nStore.t('reports.modules.highest_lowest.highest_scores')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.scoring_category')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.item')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.average')}</td>
            </tr>
            {this.renderScores(this.topData)}
            <tr>
              <td className={styles.label} colSpan={4}>{I18nStore.t('reports.modules.highest_lowest.lowest_scores')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.scoring_category')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.item')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.average')}</td>
            </tr>
            {this.renderScores(this.bottomData)}
          </tbody>
        </table>
      </div>
    )
  }
}

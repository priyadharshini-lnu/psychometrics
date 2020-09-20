/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store'
import { getQuestions } from 'modules/reports/core/builder/selectors'
import Utils from 'rb/utils/Utils'
import AppStore from 'rb/store/AppStore'
import Text from '../../Table/CellTypes/Text/Text'
import styles from './HighestLowest.scss'

const QUESTIONS = {
  1: { questionId: 1, choice: 0, name: 'Invest in global relationship by building strong key customer relationshios at the highest levels' },
  2: { questionId: 2, choice: 0, name: 'Instils pride and commitment by cultivating a continous learning culture' },
  3: { questionId: 3, choice: 0, name: 'Demonstatres organisational resillience by addressing change resistance and mitigating potential risks' },
  4: { questionId: 4, choice: 0, name: 'Fosters a change mindset and supports to build change capablities acress the organization' },
  5: { questionId: 5, choice: 0, name: 'Create a powerful startergy for transformation that will deliver short term result as well as build sustainable differentiation and performance in the longer run' },
  6: { questionId: 6, choice: 0, name: 'Influences and mobilises all in organization to embrace fundamental change to our customer value propositions and End2End processes' },
  7: { questionId: 7, choice: 0, name: 'Actively builds a culture where experimenting, failing and learning are seen as necessary to deiver innovation and growth' },
}

const MockData = [
  {
    id: 1, value: 5.0, factorName: 'Customer First', choice: 0,
  },
  {
    id: 2, value: 4.83, factorName: 'Game Changer', choice: 0,
  },
  {
    id: 3, value: 4.83, factorName: 'Greater Together', choice: 0,
  },
  {
    id: 4, value: 4.83, factorName: 'Leads Transformation', choice: 0,
  },
  {
    id: 5, value: 4.83, factorName: 'Leads Transformation', choice: 0,
  },
  {
    id: 6, value: 4.44, factorName: 'Passion For Results', choice: 0,
  },
  {
    id: 7, value: 4.1, factorName: 'Passion For Results', choice: 0,
  },
]

const AVAILABLE_QUESTION_TYPES = ['MatrixTable', 'SideBySide']

export default class QuestionHighestLowest extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  findQuestions = () => {
    const { module } = this.props
    const assessmentId = module.assessment_id
    return _.filter(
      getQuestions(store.getState().report, assessmentId),
      question => AVAILABLE_QUESTION_TYPES.includes(question.type),
    )
  }

  findQuestionChoices = () => {
    const questions = this.findQuestions()
    return _.flatMap(questions, question => _.times(question.props.choices, id => ({
      questionId: question.id,
      name: I18nStore.tQuestion(question, `choicesTexts${id + 1}`, { choice: id }),
      choice: id,
    })))
  }

  prepareRows () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      const questionChoices = this.findQuestionChoices()
      const assessment = AppStore.getAssessmentById(module.assessment_id)
      const dimensionId = assessment && assessment.dimensionId
      const factorMap = _.keyBy(AppStore.factors[dimensionId], f => f.id)
      data = questionChoices.map((choice) => {
        let factor
        const results = _.get(ResultStore, [
          'results',
          module.assessment_id,
          'resultsByFilter',
          module.props.filter,
          'rawResults',
        ], []).map((r) => {
          const answers = _.get(r, ['results', choice.questionId, 'answers'], [])
          return answers.filter(a => a.choice === choice.choice)
        }).filter(r => r.length)
        const value = _.meanBy(_.compact(results), (choiceAnswers) => {
          factor = _.find(factorMap, f => f.question_ids.includes(choice.questionId))
          return _.meanBy(choiceAnswers, (a) => {
            if (a.values) {
              return _.meanBy(a.values, val => val.recode_value)
            }
            return a.recode_value
          })
        })
        return {
          id: choice.questionId, choice: choice.choice, factorName: factor && factor.name, value: _.round(value, 2) || 0,
        }
      })
    } else {
      data = MockData
    }
    const sorted = _.sortBy(data, d => d.value)
    this.topData = _.reverse(_.takeRight(sorted, 5))
    this.bottomData = _.take(sorted, 5)
  }

  renderScores (data) {
    const questions = ResultStore.realResults ? this.findQuestionChoices() : QUESTIONS
    return _.map(data, ({
      id, choice, value, factorName,
    }, i) => {
      const question = _.find(questions, { questionId: id, choice })
      return (
        <tr key={i}>
          <Text model={{ text: i + 1 }} />
          <Text model={{ text: factorName }} />
          <td>{Utils.stripHTML(question.name)}</td>
          <Text model={{ value: value.toFixed(2) }} />
        </tr>
      )
    })
  }

  render () {
    const { module: { props: { filter: filterId } } } = this.props
    const filter = _.find(AppStore.report.filters, { id: filterId })
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
              <td className={styles.label}>{I18nStore.tFilterName(filter)}</td>
            </tr>
            {this.renderScores(this.topData)}
            <tr>
              <td className={styles.label} colSpan={4}>{I18nStore.t('reports.modules.highest_lowest.lowest_scores')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.scoring_category')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.item')}</td>
              <td className={styles.label}>{I18nStore.tFilterName(filter)}</td>
            </tr>
            {this.renderScores(this.bottomData)}
          </tbody>
        </table>
      </div>
    )
  }
}

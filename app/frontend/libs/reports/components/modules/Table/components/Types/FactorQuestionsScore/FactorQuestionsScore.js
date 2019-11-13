import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Utils from 'rb/utils'
import AssessmentStore from 'rb/store/AssessmentStore'
import AppStore from 'rb/store/AppStore'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import Question from 'rb/models/Question'
import Scoring from 'rb/models/Scoring'
import styles from './FactorQuestionsScore.scss'

const QUESTIONS = {
  309: { type: 'MultipleChoice', id: 309, props: { questionText: 'Test text1' } },
  310: { type: 'MultipleChoice', id: 310, props: { questionText: 'Test text2' } },
  312: { type: 'MultipleChoice', id: 312, props: { questionText: 'Test text3' } },
  313: { type: 'MultipleChoice', id: 313, props: { questionText: 'Test text4' } },
  331: { type: 'MultipleChoice', id: 331, props: { questionText: 'Test text5' } },
  332: { type: 'MultipleChoice', id: 332, props: { questionText: 'Test text6' } },
  334: { type: 'MultipleChoice', id: 334, props: { questionText: 'Test text7' } },
}

const FACTOR_QUESTIONS = {

}

const MockData = {
  1: {
    questionScoring: {
      1: {
        309: [
          new Scoring({ value: 2.57 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 5 }),
        ],
        310: [
          new Scoring({ value: 3.87 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 5 }),
        ],
        312: [
          new Scoring({ value: 3.27 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 0.87 }),
        ],
        313: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 0.87 }),
        ],
        331: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 1.57 }),
        ],
        332: [
          new Scoring({ value: 2.17 }),
          new Scoring({ value: 1 }),
          new Scoring({ value: 1.57 }),
        ],
        334: [

        ],
      },
    },
  },
  2: {
    questionScoring: {
      1: {
        309: [
          new Scoring({ value: 2.57 }),
          new Scoring({ value: 3 }),
          new Scoring({ value: 5 }),
        ],
        310: [
          new Scoring({ value: 3.87 }),
          new Scoring({ value: 5 }),
          new Scoring({ value: 5 }),
        ],
        312: [
          new Scoring({ value: 3.27 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 2.87 }),
        ],
        313: [
          new Scoring({ value: 3.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 1.87 }),
        ],
      },
      2: {
        331: [
          new Scoring({ value: 1.17 }),
          new Scoring({ value: 4 }),
          new Scoring({ value: 1.57 }),
        ],
        332: [
          new Scoring({ value: 4.17 }),
          new Scoring({ value: 1 }),
          new Scoring({ value: 1.57 }),
        ],
        334: [

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
      _.each(filterIds, (id, i) => {
        data[id] = data[i + 1] || { questionScoring: {} }
      })
    }

    const questions = {}
    _.each(data, (filter, filterId) => {
      questions[filterId] = {}
      _.each(filter.questionScoring, (scoring, factorId) => {
        _.each(scoring, (results, qId) => {
          const sum = _.reduce(results, (sum, obj) => sum + obj.getValue(), 0)
          questions[filterId][qId] = {
            value: (sum / results.length) || 0,
            scoring: factorId,
          }
        })
      })
    })
    this.data = questions
  }

  render () {
    this.prepareData()
    const { module: model } = this.props
    const factors = _.result(model.props, 'source.factors') || []
    if (!ResultStore.realResults) {
      _.each(factors, (factor) => {
        if (!FACTOR_QUESTIONS[factor.id]) {
          FACTOR_QUESTIONS[factor.id] = { question_ids: _.sampleSize(_.keys(QUESTIONS), Utils.rand(1, 7)) }
        }
      })
    }
    const filterIds = model.props.filter
    const { filters } = AppStore.report
    const assessmentId = model.assessment_id
    const questions = ResultStore.realResults ? AssessmentStore.questions[assessmentId] : QUESTIONS
    if (!filterIds) { return null }
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    return (
      <div className={styles.table}>
        <table>
          <thead style={{ visibility: !model.props.showHeader ? 'hidden' : 'visible' }}>
            <tr>
              <td style={{ width: '15%', visibility: 'hidden' }} />
              <td style={{ width: '35%' }} />
              {filterIds.map((id, i) => {
                const filter = _.find(filters, { id })
                return (
                  <td style={{ width: '10%' }} key={i}>{I18nStore.tFilterName(filter)}</td>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {factors.map((factor) => {
              const factorQuestions = ResultStore.realResults
                ? _.find(AppStore.factors[dimensionId], { id: factor.id })
                : FACTOR_QUESTIONS[factor.id]
              return factorQuestions.question_ids.map((questionId, i) => {
                const question = questions[questionId] || { props: { questionText: 'Demo Question text' } }
                return (
                  <tr key={i}>
                    {i === 0 && (
                      <td rowSpan={i === 0 ? factorQuestions.question_ids.length : 0}>
                        {I18nStore.tFactorName(factor)}
                      </td>
                    )}
                    <td>{I18nStore.tQuestion(new Question(question), 'questionText')}</td>
                    {filterIds.map((id, i) => {
                      const data = this.data[id][questionId]
                      return (
                        <td key={i}>{data && Utils.round(data.value, 2)}</td>
                      )
                    })}
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ResponseSummary

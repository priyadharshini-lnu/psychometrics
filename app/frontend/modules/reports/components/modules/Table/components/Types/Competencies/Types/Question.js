import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import I18nStore from 'rb/store/I18nStore'
import ResultStore from 'rb/store/ResultStore'
import { connect } from 'react-redux'
import { getQuestions } from 'modules/reports/core/builder/selectors'
import styles from '../styles.scss'
import MilestoneTd from './MilestoneTd'
import buildFakeData from '../buildFakeData'
import Legend from '../Legend'

const FILTER_ROW_HEIGHT = 24
const DESC_COLUMN_WIDTH = 29

function Question ({ filters, model, questions }) {
  const enhanceFiltersByValue = (question, choice) => {
    if (!ResultStore.realResults) {
      const { milestones } = model.props
      return buildFakeData({ filters, milestones })
    }

    const enhancedFilters = filters.map((filter) => {
      const answers = _.get(ResultStore, [
        'results',
        model.assessment_id,
        'resultsByFilter',
        filter.id,
        'questions',
        question.id,
      ], [])
      const values = _.map(answers, (answer) => {
        const choiceAnswers = answer.filter(a => a.choice === choice.id)
        return _.meanBy(choiceAnswers, (a) => {
          if (a.values) {
            return _.meanBy(a.values, val => val.recode_value)
          }
          return a.recode_value
        })
      }).filter(v => v)
      const value = _.mean(values)
      return { ...filter, value: _.round(value, 2) }
    })

    return _.sortBy(enhancedFilters, 'value')
  }

  const findQuestion = () => _.find(
    questions, question => question.id === model.props.questionId,
  )

  const findQuestionChoices = () => {
    const question = findQuestion()
    return model.props.questionChoiceIds.map(id => ({
      name: I18nStore.tQuestion(question, `choicesTexts${id + 1}`, { choice: id }),
      id,
    }))
  }

  const {
    milestones, mainHeaderColor, secondHeaderColor,
  } = model.props
  if (!filters.length) return null
  const filterIdsHavingResults = new Set()
  const filtersHavingResults = () => filters.filter(f => filterIdsHavingResults.has(f.id))

  const question = findQuestion()

  if (!question) return null

  const questionChoices = findQuestionChoices()

  const milestoneColumnWidth = (100 - DESC_COLUMN_WIDTH) / milestones.length
  const getDescStyle = results => ({ minHeight: `${FILTER_ROW_HEIGHT * results.length}px` })
  const { fontSize, fontFamily } = model.props.style
  const style = {
    fontSize,
    fontFamily,
  }

  return (
    [
      <div className={styles.table} style={style}>
        <table>
          <thead>
            <tr>
              <td
                rowSpan={2}
                className={cs(styles.label, styles.competencyLabel)}
                style={{ color: mainHeaderColor }}
              >
                {I18nStore.t('reports.modules.single_value_cluster.questions')}
              </td>
              <td
                colSpan={milestones.length}
                className={cs(styles.label, styles.questionLabel)}
                style={{ color: mainHeaderColor }}
              >
                {I18nStore.t('reports.modules.single_value_cluster.developmental_rating')}
              </td>
            </tr>
            <tr>
              {milestones.map(m => (
                <td
                  key={m.id}
                  className={cs(styles.label, styles.milestoneLabel)}
                  style={{ borderBottomColor: m.color, color: secondHeaderColor }}
                  width={`${milestoneColumnWidth}%`}
                >
                  {m.name}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {questionChoices.map((questionChoice) => {
              const results = enhanceFiltersByValue(question, questionChoice).filter(r => r.value > 0)
              results.forEach(r => filterIdsHavingResults.add(r.id))
              const descStyle = getDescStyle(results)
              return (
                <tr key={questionChoice.id}>
                  <td>
                    <div className={styles.description} style={descStyle}>{questionChoice.name}</div>
                  </td>
                  {milestones.map((m, i) => (
                    <MilestoneTd
                      filters={results}
                      milestoneIndex={i}
                      key={m.id}
                      milestone={m}
                      model={model}
                    />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>,
      <Legend filters={filtersHavingResults()} model={model} />,
    ]
  )
}


export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Question)

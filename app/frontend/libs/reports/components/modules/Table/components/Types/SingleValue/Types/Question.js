import React from 'react'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import I18nStore from 'rb/store/I18nStore'
import styles from '../styles.scss'

const VALUES = [[2.69, 3.51, 2.7], [2.3, 3.24, 2.52], [2.03, 3.8, 2.19]]

export default function Question ({ model, filters }) {
  const findQuestion = () => _.find(
    AssessmentStore.questions[model.assessment_id], question => question.id === model.props.questionId,
  )

  const findQuestionChoices = () => {
    const question = findQuestion()
    return model.props.questionChoiceIds.map(id => ({
      name: I18nStore.tQuestion(question, `choicesTexts${id + 1}`, { choice: id }),
      id,
    }))
  }

  const getResults = () => {
    const question = findQuestion()
    if (!question) {
      return []
    }

    const questionChoices = findQuestionChoices()

    if (!ResultStore.realResults) {
      return questionChoices.map(({ name }, index) => {
        const valuesPull = VALUES[index % VALUES.length]
        const values = _.times(filters.length, i => valuesPull[i % valuesPull.length])
        return { name, values }
      })
    }
    return questionChoices.map((choice) => {
      const values = filters.map((filter) => {
        const answers = _.get(ResultStore, [
          'results',
          model.assessment_id,
          'resultsByFilter',
          filter.id,
          'rawResults',
        ], []).map(r => _.get(r, ['answers', question.id, 'answers'] || []))

        const value = _.meanBy(answers, (answer) => {
          const choiceAnswers = answer.filter(a => a.choice === choice.id)
          return _.meanBy(choiceAnswers, (a) => {
            if (a.values) {
              return _.meanBy(a.values, val => val.recode_value)
            }
            return a.recode_value
          })
        })
        return _.round(value, 2) || 0
      })
      return { name: choice.name, values }
    })
  }

  if (!filters.length) return null

  return (
    <div className={styles.table}>
      <table>
        <thead>
          <tr>
            <td className={styles.label}>{I18nStore.t('reports.modules.single_value.question_name')}</td>
            {filters.map(filter => (
              <td key={filter.id} className={styles.label}>
                {I18nStore.tFilterName(filter)}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {getResults().map(result => (
            <tr key={result.name}>
              <td>{result.name}</td>
              {result.values.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

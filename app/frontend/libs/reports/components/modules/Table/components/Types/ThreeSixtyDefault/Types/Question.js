import _ from 'lodash'
import React from 'react'
import AppStore from 'rb/store/AppStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import I18nStore from 'rb/store/I18nStore'
import Utils from 'rb/utils'
import ResultStore from 'rb/store/ResultStore'
import styles from '../styles.scss'

const Question = ({ model }) => {
  if (!model.props.filter) return null
  const question = _.find(AssessmentStore.questions[model.assessment_id], q => q.id === model.props.questionId)
  if (!question) return null
  const { fontSize, fontFamily } = model.props.style
  const style = {
    fontSize,
    fontFamily,
  }

  return (
    <div style={style}>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.question}>{Utils.stripHTML(_.get(question, 'props.questionText'))}</td>
          </tr>
        </thead>
        {model.props.filter.map(filterId => (
          <FilterTable key={filterId} filterId={filterId} model={model} />
        ))}
      </table>
    </div>
  )
}

const MOCK_RESULTS = ['First answer', 'Second answer']

function FilterTable ({ filterId, model }) {
  const filter = AppStore.report.filters.find(f => f.id === filterId)
  const question = _.find(AssessmentStore.questions[model.assessment_id], q => q.id === model.props.questionId)
  if (!question) return null

  const getResults = () => {
    if (!ResultStore.realResults) return MOCK_RESULTS

    const answers = _.get(
      ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id, 'questions', question.id],
    )
    if (!answers) return null
    return answers.map(answer => answer[0].value)
  }

  const results = getResults()
  if (!results) { return null }

  return (
    <tbody>
      <tr>
        <td className={styles.filter}>
          {I18nStore.tFilterName(filter)}
        </td>
      </tr>
      {results.map((r, i) => (
        <tr key={i}>
          <td className={styles.answer}>{r}</td>
        </tr>
      ))}
    </tbody>
  )
}

export default Question

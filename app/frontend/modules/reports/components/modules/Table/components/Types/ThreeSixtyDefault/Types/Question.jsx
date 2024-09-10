import _ from 'lodash'
import cs from 'classnames'
import { connect } from 'react-redux'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import Utils from '~/modules/reports/utils'
import ResultStore from '~/modules/reports/store/ResultStore'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import styles from '../styles.less'

const Question = ({ model, questions }) => {
  if (!model.props.filter) return null
  const question = _.find(questions, q => q.id === model.props.questionId)
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
            <td className={styles.question}>
              {Utils.stripHTML(I18nStore.tQuestion(question, 'questionText'))}
            </td>
          </tr>
        </thead>
        {model.props.filter.map(filterId => (
          <FilterTable key={filterId} filterId={filterId} model={model} questions={questions} />
        ))}
      </table>
    </div>
  )
}

const MOCK_RESULTS = ['First answer', 'Second answer']

function FilterTable ({ filterId, model, questions }) {
  const filter = AppStore.report.filters.find(f => f.id === filterId)
  const question = _.find(questions, q => q.id === model.props.questionId)
  if (!question) return null

  const getResults = () => {
    if (!ResultStore.realResults) return MOCK_RESULTS

    if (question.type === 'FactorSelect') {
      const answers = _.get(
        ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id, 'questions', question.id, 0],
      )
      if (!answers) return null

      const assessment = AppStore.getAssessmentById(model.assessment_id)
      const factors = AppStore.factors[assessment.dimensionId]

      return _.compact(answers.map((id) => {
        const factor = factors.find(f => f.id === id)
        return factor?.name
      }))
    }

    const answers = _.get(
      ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id, 'questions', question.id],
    )

    if (!answers) return null

    return _.compact(answers).map(answer => answer[0].value)
  }

  return (
    <tbody>
      <tr>
        <td className={styles.filter}>
          {I18nStore.tFilterName(filter)}
        </td>
      </tr>
      <Results results={getResults()} />
    </tbody>
  )
}

const Results = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <tr>
        <td className={cs([styles.answer, styles.noResponse])}>
          {I18nStore.t('reports.modules.three_sixty_default.question.no_response')}
        </td>
      </tr>
    )
  }

  return results.map((r, i) => (
    <tr key={i}>
      <td className={styles.answer}>{r}</td>
    </tr>
  ))
}

export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Question)

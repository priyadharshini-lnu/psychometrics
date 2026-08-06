import _ from 'lodash'
import cs from 'classnames'
import { connect } from 'react-redux'
import seedrandom from 'seedrandom'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import { PaginationContext } from './PaginationContext'
import styles from '../styles.less'
import { useModulePagination } from '~/hooks/useModulePagination'
import { SafeHTML } from '~/components/SafeHTML'
import array from '~/utils/array'

const Question = ({
  model, questions, insertPaginationPage, preview, aiTranslation,
}) => {
  if (!model.props.filter) return null
  const question = _.find(questions, q => q.id === model.props.questionId)
  if (!question) return null
  const { fontSize, fontFamily, fontColor } = model.props.style
  const styleProp = { fontSize, fontFamily, color: fontColor }

  const { paginationContext } = useModulePagination(
    model, `[data-table="${model.id}"]`, PaginationContext, insertPaginationPage, preview,
  )

  const filters = paginationContext?.filterId?.length ? [...paginationContext?.filterId] : model.props.filter
  return (
    <div style={styleProp} data-table={model.id}>
      <table className={styles.table}>
        <thead data-table-header>
          <tr>
            <td className={styles.question}>
              <SafeHTML html={I18nStore.tQuestion(question, 'questionText')} />
            </td>
          </tr>
        </thead>
        {filters.map(filterId => (
          <FilterTable
            key={filterId}
            filterId={filterId}
            model={model}
            questions={questions}
            paginationContext={paginationContext}
            aiTranslation={aiTranslation}
          />
        ))}
      </table>
    </div>
  )
}

const MOCK_RESULTS = ['First answer', 'Second answer']

function FilterTable ({
  filterId, model, questions, paginationContext, aiTranslation,
}) {
  const filter = AppStore.report.filters.find(f => f.id === filterId)
  const question = _.find(questions, q => q.id === model.props.questionId)
  if (!question) return null

  const getResults = () => {
    if (!ResultStore.realResults) return MOCK_RESULTS

    let results
    if (question.type === 'FactorSelect') {
      const answers = _.get(
        ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id, 'questions', question.id, 0],
      )
      if (!answers) return null

      const assessment = AppStore.getAssessmentById(model.assessment_id)
      const factors = AppStore.factors[assessment.dimensionId]
      results = _.compact(answers.map((id) => {
        const factor = factors.find(f => f.id === id)
        return factor?.name
      }))

      if (model.props.randomizeAnswers) {
        results = array.shuffle(results, seedrandom(ResultStore.user.id.toString() + model.id))
      }
      return results
    }

    const answers = _.get(
      ResultStore, ['results', model.assessment_id, 'resultsByFilter', filter.id, 'questions', question.id],
    )

    if (!answers) return null

    results = _.compact(answers).flatMap(answer => answer.map(item => item.value))

    if (model.props.randomizeAnswers) {
      results = array.shuffle(results, seedrandom(ResultStore.user.id.toString() + model.id))
    }

    return results
  }

  const results = getResults()
  // Hide entire row (including header) if hideRolesWithNoData is true and no results
  if (model.props.hideRolesWithNoData && (!results || results.length === 0)) {
    return null
  }

  return (
    <tbody data-paginatable={1} data-filter-id={filter.id}>
      <tr data-filter-header>
        <td className={styles.filter}>
          {I18nStore.tFilterName(filter)}
        </td>
      </tr>
      <Results
        filterId={filterId}
        results={results}
        paginationContext={paginationContext}
        aiTranslation={aiTranslation}
      />
    </tbody>
  )
}

const Results = ({
  results, filterId, paginationContext, aiTranslation,
}) => {
  if (!results || results.length === 0) {
    return (
      <tr data-paginatable={2}>
        <td className={cs([styles.answer, styles.noResponse])}>
          {I18nStore.t('reports.modules.three_sixty_default.question.no_response')}
        </td>
      </tr>
    )
  }

  if (paginationContext) {
    return (
      paginationContext.resultIndexes[filterId].map(i => (
        <tr>
          <td key={i} className={styles.answer}>
            <SafeHTML
              html={aiTranslation?.[`${filterId}-${i}`] || results[i]}
              data-ai-translation={`${filterId}-${i}`}
            />
          </td>
        </tr>
      ))
    )
  }

  return results.map((r, i) => (
    <tr key={i} data-index={i} data-paginatable={2}>
      <td className={styles.answer}>
        <SafeHTML html={aiTranslation?.[i] || r} data-ai-translation={i} />
      </td>
    </tr>
  ))
}

export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Question)

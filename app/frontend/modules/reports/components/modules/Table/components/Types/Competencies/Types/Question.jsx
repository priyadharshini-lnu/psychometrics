import _ from 'lodash'
import cs from 'classnames'
import { connect } from 'react-redux'
import I18nStore from '~/modules/reports/store/I18nStore'
import ResultStore from '~/modules/reports/store/ResultStore'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import styles from '../styles.less'
import MilestoneTd from './MilestoneTd'
import BarChart from './BarChart'
import buildFakeData from '../buildFakeData'
import Legend from '../Legend'

const FILTER_ROW_HEIGHT = 24
const DESC_COLUMN_WIDTH = 29

const connector = connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}))

const QuestionComponent = ({ filters, model, questions }) => {
  const { props: { questionsChoices, showAsBarChart } } = model

  const enhanceFiltersByValue = (questionId, choiceId) => {
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
        questionId,
      ], [])
      const values = _.map(answers, (answer) => {
        const choiceAnswers = answer.filter(a => a.choice === choiceId)
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

    return enhancedFilters
  }

  const {
    milestones, mainHeaderColor, secondHeaderColor,
    hideHeader, borderColor,
  } = model.props
  if (!filters.length) return null
  const filterIdsHavingResults = new Set()
  const filtersHavingResults = () => filters.filter(f => filterIdsHavingResults.has(f.id))

  const filteredQuestionsChoices = questionChoicesToTableValues(questionsChoices, questions)

  const milestoneColumnWidth = (100 - DESC_COLUMN_WIDTH) / (milestones.length || 1)
  const getDescStyle = results => ({ minHeight: `${FILTER_ROW_HEIGHT * results.length}px` })
  const { fontSize, fontFamily } = model.props.style
  const style = {
    fontSize,
    fontFamily,
  }
  if (borderColor) {
    style.borderColor = borderColor
  }

  return (
    <>
      <div className={styles.table} style={style}>
        <table>
          {!hideHeader && (
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
          )}
          <tbody>
            {filteredQuestionsChoices.map((questionChoice) => {
              const results = enhanceFiltersByValue(questionChoice.questionId, questionChoice.choiceId)
                .filter(r => r.value > 0)

              results.forEach(r => filterIdsHavingResults.add(r.id))
              const descStyle = getDescStyle(results)
              return (
                <tr key={`${questionChoice.questionId}_${questionChoice.choiceId}`}>
                  <td width={`${DESC_COLUMN_WIDTH}%`}>
                    <div className={styles.description} style={descStyle}>{questionChoice.name}</div>
                  </td>
                  {showAsBarChart
                    ? <BarChart filters={results} model={model} milestones={milestones} />
                    : milestones.map((m, i) => (
                      <MilestoneTd
                        columnWidth={milestoneColumnWidth}
                        filters={results}
                        milestoneIndex={i}
                        key={m.id}
                        milestone={m}
                        model={model}
                      />
                    ))
                  }
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Legend filters={filtersHavingResults()} model={model} />
    </>
  )
}

export const questionChoicesToTableValues = (questionsChoices = [], allQuestions = {}) => {
  const filteredQuestionsChoics = []

  questionsChoices.forEach((questionChoices) => {
    const { questionId, choiceIds } = questionChoices

    if (Object.values(allQuestions).length > 0) {
      const question = allQuestions?.[questionId] ?? null

      if (question) {
        choiceIds.forEach((choiceId) => {
          filteredQuestionsChoics.push({
            questionId,
            choiceId,
            name: I18nStore.tQuestion(question, `choicesTexts${choiceId + 1}`, { choice: choiceId }),
          })
        })
      }
    }
  })

  return filteredQuestionsChoics
}

const Question = connector(QuestionComponent)

export default Question

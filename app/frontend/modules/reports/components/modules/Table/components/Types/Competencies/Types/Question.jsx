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

const QuestionComponent = ({
  filters, model, questions, paginationContext,
}) => {
  const { props: { questionsChoices, showAsBarChart } } = model
  const tableColumns = _.get(model, 'props.tableColumns.Question')
      || _.get(model, 'props.defaultTableColumns.Question') || {}
  const showQuestions = !_.get(tableColumns, 'questions.hide')
  const showDevelopmentalRating = !_.get(tableColumns, 'developmental_rating.hide')

  const columnLabelData = {
    questions: I18nStore.tTableColumns(model, 'Question', 'questions.label'),
    developmental_rating: I18nStore.tTableColumns(model, 'Question', 'developmental_rating.label'),
  }

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
        const choiceAnswers = answer?.filter(a => a.choice === choiceId) || []
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
  const getMinDataCellHeight = results => `${FILTER_ROW_HEIGHT * results.length}px`
  const getDescStyle = results => ({ minHeight: `${FILTER_ROW_HEIGHT * results.length}px` })
  const { fontSize, fontFamily, fontColor } = model.props.style
  const style = {
    fontSize,
    fontFamily,
    color: fontColor,
  }
  if (borderColor) {
    style.borderColor = borderColor
  }

  const paginatedData = paginationContext?.factorIds?.length
    ? filteredQuestionsChoices.filter(
      s => paginationContext.factorIds.includes(`${s.questionId}_${s.choiceId}`),
    )
    : filteredQuestionsChoices
  return (
    <>
      <div className={styles.table} style={style}>
        <table>
          {!hideHeader && (
            <thead data-table-header>
              <tr>
                {showQuestions && (
                  <td
                    rowSpan={2}
                    className={cs(styles.label, styles.competencyLabel)}
                    style={{ color: mainHeaderColor }}
                  >
                    {columnLabelData.questions}
                  </td>
                )}
                {showDevelopmentalRating && (
                  <td
                    colSpan={milestones.length}
                    className={cs(styles.label, styles.questionLabel)}
                    style={{ color: mainHeaderColor }}
                  >
                    {columnLabelData.developmental_rating}
                  </td>
                )}
              </tr>
              { showDevelopmentalRating && (
                <tr>
                  {milestones.map(m => (
                    <td
                      key={m.id}
                      className={cs(styles.label, styles.milestoneLabel)}
                      style={{ borderBottomColor: m.color, color: secondHeaderColor }}
                      width={`${milestoneColumnWidth}%`}
                    >
                      {I18nStore.tMilestone(model, m)}
                    </td>
                  ))}
                </tr>
              )}
            </thead>
          )}
          <tbody>
            {paginatedData.map((questionChoice, i) => {
              const results = enhanceFiltersByValue(questionChoice.questionId, questionChoice.choiceId)
                .filter(r => r.value > 0)

              results.forEach(r => filterIdsHavingResults.add(r.id))
              const descStyle = getDescStyle(results)
              const minDataCellHeight = !showQuestions
                ? getMinDataCellHeight(results) : 'auto'

              return (
                <tr
                  key={`${questionChoice.questionId}_${questionChoice.choiceId}`}
                  data-row={i}
                  data-factor-id={`${questionChoice.questionId}_${questionChoice.choiceId}`}
                >
                  {showQuestions && (
                    <td width={`${DESC_COLUMN_WIDTH}%`}>
                      <div className={styles.description} style={descStyle}>{questionChoice.name}</div>
                    </td>
                  )}
                  {showDevelopmentalRating && (showAsBarChart
                    ? <BarChart filters={results} model={model} milestones={milestones} />
                    : milestones.map((m, i) => (
                      <MilestoneTd
                        columnWidth={milestoneColumnWidth}
                        filters={results}
                        milestoneIndex={i}
                        key={m.id}
                        milestone={m}
                        model={model}
                        dataCellHeight={minDataCellHeight}
                      />
                    )))
                  }
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!model.props?.hideLegend && <Legend filters={filtersHavingResults()} model={model} />}
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

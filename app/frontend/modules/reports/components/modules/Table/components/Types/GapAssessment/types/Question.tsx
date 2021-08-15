import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import keyBy from 'lodash/keyBy'
import compact from 'lodash/compact'
import round from 'lodash/round'
import get from 'lodash/get'
import find from 'lodash/find'
import meanBy from 'lodash/meanBy'

import { RootState } from 'modules/reports/core/rootReducers'
import { getQuestions } from 'modules/reports/core/builder/selectors'
import { GapType, PropertiesModel } from 'modules/reports/interfaces/tables/Gap'
import { BasePropertiesModel as BaseQuestionModelInProperties } from 'modules/survey/interfaces/questions/Base'

import ResultStore from 'modules/reports/store/ResultStore'
import AppStore from 'modules/reports/store/AppStore'
import I18nStore from 'modules/reports/store/I18nStore'
import Utils from 'modules/reports/utils'

import styles from './styles.scss'

const MOCK_POSITIVE_GAPS: Array<Gap> = [
  {
    factorName: 'Customer First',
    questionName: 'Rallies, aligns and inspires',
    left: 5.0,
    right: 3.83,
    diff: 1.17,
    factor: {},
  },
  {
    factorName: 'Leads Transformation',
    questionName: 'Demonstrates organisational resilience',
    left: 4.83,
    right: 3.53,
    diff: 1.3,
    factor: {},
  },
  {
    factorName: 'Greater Together',
    questionName: 'Creates strategic business partnerships',
    left: 4.83,
    right: 3.73,
    diff: 1.1,
    factor: {},
  },
  {
    factorName: 'Game Changer',
    questionName: 'Fosters a change mindset',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
    factor: {},
  },
  {
    factorName: 'Game Changer (1)',
    questionName: 'Cascades organisational',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
    factor: {},
  },
]
const MOCK_NEGATIVE_GAPS: Array<Gap> = []
const AVAILABLE_QUESTION_TYPES = ['MatrixTable', 'SideBySide']

const connector = connect((state: RootState) => ({
  getQuestions: (assessmentId: number) => getQuestions(state.report, assessmentId),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  filters: typeof AppStore.report.filters
  gapType: PropertiesModel['props']['gapType']
  assessment_id: PropertiesModel['assessment_id']
  questionsChoices: PropertiesModel['props']['questionsChoices']
}

type Props = PropsFromRedux & OwnProps

const QuestionComponent: FC<Props> = ({
  filters: [leftFilter, rightFilter],
  gapType,
  assessment_id,
  questionsChoices,
  getQuestions,
}) => {
  const calculateGaps = (
    questionsChoicesTableValues: QuestionsChoicesTableValues,
  ): Array<Array<Gap>> => {
    const assessment = AppStore.getAssessmentById(assessment_id)
    const dimensionId = assessment?.dimensionId ?? 0
    const factorMap = keyBy(AppStore.factors[dimensionId], f => f.id)

    const results = questionsChoicesTableValues.map((choice) => {
      let factor
      const values = [leftFilter, rightFilter].map((filter) => {
        const results = get(
          ResultStore,
          [
            'results',
            assessment_id,
            'resultsByFilter',
            filter.id,
            'rawResults',
          ],
          [],
        )
          .map((r) => {
            const answers = get(
              r,
              ['results', choice.questionId, 'answers'],
              [],
            )
            return answers.filter(a => a.choice === choice.id)
          })
          .filter(r => r.length)

        const value = meanBy(
          compact(results),
          (
            choiceAnswers: Array<{
              choice: number
              recode_value: number
              values?: Array<{ recode_value: number }>
            }>,
          ) => {
            factor = find(factorMap, f => f.question_ids.includes(choice.questionId))
            return meanBy(choiceAnswers, (a) => {
              if (a.values) {
                return meanBy(a.values, val => val.recode_value)
              }
              return a.recode_value
            })
          },
        )
        return round(value, 2) || 0
      })

      if (!factor) {
        return null
      }

      const row = { left: values[0], right: values[1] }
      return {
        ...row,
        factorName: factor.name,
        questionName: choice.name,
        factor,
        diff: round(row.left - row.right, 2),
      }
    })

    const resultsWithoutHoles = results.filter(
      (result): result is Gap => result !== null,
    )
    const sortedResults = resultsWithoutHoles.sort(
      (firstResult, secondResult) => secondResult.diff - firstResult.diff,
    )
    const positiveGaps = sortedResults
      .filter(result => result.diff > 0)
      .slice(0, 5)
    const negativeGaps = sortedResults
      .filter(result => result.diff < 0)
      .slice(-5)
      .reverse()

    return [positiveGaps, negativeGaps]
  }

  const allQuestions = getQuestions(assessment_id)

  // If no question choices are selected then by default consider all questions choices
  const providedQuestionChoices = questionsChoices && questionsChoices.length > 0
    ? selectedQuestionsChoicesToTableValues(allQuestions, questionsChoices)
    : getAllQuestionsChoices(allQuestions)

  const [positiveGaps, negativeGaps] = ResultStore.realResults
    ? calculateGaps(providedQuestionChoices)
    : [MOCK_POSITIVE_GAPS, MOCK_NEGATIVE_GAPS]

  const showPositiveGapTable = gapType === GapType.ALL || gapType === GapType.POSITIVE
  const showNegativeGapsTable = gapType === GapType.ALL || gapType === GapType.NEGATIVE
  const showTitle = gapType === GapType.ALL

  return (
    <div className={styles.table}>
      {showPositiveGapTable && (
        <Table
          title={
            showTitle
              ? I18nStore.t('reports.modules.gap_assessment.positive_gap')
              : ''
          }
          emptyText={I18nStore.t(
            'reports.modules.gap_assessment.no_positive_gaps',
          )}
          leftFilter={leftFilter}
          rightFilter={rightFilter}
          gaps={positiveGaps}
        />
      )}
      {showNegativeGapsTable && (
        <Table
          title={
            showTitle
              ? I18nStore.t('reports.modules.gap_assessment.negative_gap')
              : ''
          }
          emptyText={I18nStore.t(
            'reports.modules.gap_assessment.no_negative_gaps',
          )}
          leftFilter={leftFilter}
          rightFilter={rightFilter}
          gaps={negativeGaps}
        />
      )}
    </div>
  )
}

type QuestionsChoicesTableValues = Array<{
  questionId: number
  name: string
  id: number
}>

// Gap table can be shown to those questions which contains many choice options
interface BaseQuestionProps {
  choicesTexts: Array<string>
}

const selectedQuestionsChoicesToTableValues = (
  allQuestions: Record<
    number,
    BaseQuestionModelInProperties<BaseQuestionProps>
  >,
  questionsChoices: PropertiesModel['props']['questionsChoices'],
): QuestionsChoicesTableValues => {
  if (Object.keys(allQuestions).length === 0 || questionsChoices.length === 0) {
    return []
  }

  const filteredQuestions = Object.values(allQuestions)
    .filter(question => AVAILABLE_QUESTION_TYPES.includes(question.type))

  if (filteredQuestions.length === 0) {
    return []
  }

  const questionsChoicesTableValues: QuestionsChoicesTableValues = []

  questionsChoices.forEach((questionChoice) => {
    const question = filteredQuestions.find(
      question => question.id === questionChoice.questionId,
    )

    if (question) {
      questionChoice.choiceIds.forEach((choice) => {
        questionsChoicesTableValues.push({
          questionId: questionChoice.questionId,
          id: choice,
          name: I18nStore.tQuestion(question, `choicesTexts${choice + 1}`, {
            choice,
          }),
        })
      })
    }
  })

  return questionsChoicesTableValues
}

const getAllQuestionsChoices = (
  allQuestions: Record<
    number,
    BaseQuestionModelInProperties<BaseQuestionProps>
  >,
) => {
  const filteredQuestions = Object.values(allQuestions)
    .filter(question => AVAILABLE_QUESTION_TYPES.includes(question.type))

  if (filteredQuestions.length === 0) {
    return []
  }

  const allQuestionsChoices: QuestionsChoicesTableValues = []

  filteredQuestions.forEach((filteredQuestion) => {
    const {
      props: { choices },
    } = filteredQuestion

    if (choices !== 0) {
      Array.from({ length: choices }, (_, choiceIndex) => {
        allQuestionsChoices.push({
          questionId: filteredQuestion.id,
          id: choiceIndex,
          name: I18nStore.tQuestion(
            filteredQuestion,
            `choicesTexts${choiceIndex + 1}`,
            {
              choice: choiceIndex,
            },
          ),
        })
      })
    }
  })

  return allQuestionsChoices
}

type Gap = {
  factorName: string
  questionName: string
  left: number
  right: number
  diff: number
  factor: Record<string, unknown>
}

interface TableProps {
  title: string
  leftFilter: typeof AppStore.report.filters[0]
  rightFilter: typeof AppStore.report.filters[0]
  gaps: Array<Gap>
  emptyText: string
}

const Table: FC<TableProps> = ({
  title,
  emptyText,
  leftFilter,
  rightFilter,
  gaps,
}) => (
  <table>
    <thead>
      {title.length === 0 && (
        <tr>
          <td className={styles.label} colSpan={6}>
            {title}
          </td>
        </tr>
      )}
      <tr>
        <td className={styles.label}>
          {I18nStore.t('reports.modules.gap_assessment.rank')}
        </td>
        <td className={styles.label}>
          {I18nStore.t('reports.modules.gap_assessment.scoring_category')}
        </td>
        <td className={styles.label}>
          {I18nStore.t('reports.modules.gap_assessment.item')}
        </td>
        <td className={styles.label}>{I18nStore.tFilterName(leftFilter)}</td>
        <td className={styles.label}>{I18nStore.tFilterName(rightFilter)}</td>
        <td className={styles.label}>
          {I18nStore.t('reports.modules.gap_assessment.gap')}
        </td>
      </tr>
    </thead>
    <TBody gaps={gaps} emptyText={emptyText} />
  </table>
)

const TBody: FC<Pick<TableProps, 'gaps' | 'emptyText'>> = ({
  gaps,
  emptyText,
}) => {
  if (gaps.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={6}>{emptyText}</td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {gaps.map((gap, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{gap.factorName}</td>
          <td>{gap.questionName}</td>
          <td>{Utils.round(gap.left, 2)}</td>
          <td>{Utils.round(gap.right, 2)}</td>
          <td>{Utils.round(gap.diff, 2)}</td>
        </tr>
      ))}
    </tbody>
  )
}

const Question = connector(QuestionComponent)

export default Question

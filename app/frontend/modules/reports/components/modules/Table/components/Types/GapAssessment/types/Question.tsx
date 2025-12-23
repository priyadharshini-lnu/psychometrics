import _ from 'lodash'
import { CSSProperties, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import keyBy from 'lodash/keyBy'
import compact from 'lodash/compact'
import round from 'lodash/round'
import cs from 'classnames'
import get from 'lodash/get'
import find from 'lodash/find'
import meanBy from 'lodash/meanBy'

import { RootState } from '~/modules/reports/core/rootReducers'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import {
  GapType, PropertiesModel, TableStyleType, PreviewModel,
} from '~/modules/reports/interfaces/tables/Gap'
import { BasePropertiesModel as BaseQuestionModelInProperties } from '~/modules/survey/interfaces/questions/Base'

import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import Utils from '~/modules/reports/utils'
import { ColumnData, ColumnsHeaderData } from '~/modules/reports/core/interfaces/TableColumn'

import styles from './styles.less'
import { PageData } from '../PaginationContext'
import DefaultTableColumns from '~/modules/reports/consts/DefaultTableColumns'

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
  hideLeftFilter: boolean | null,
  hideRightFilter: boolean | null,
  gapType: PropertiesModel['props']['gapType']
  assessment_id: number
  tableStyle: TableStyleType
  questionsChoices: PropertiesModel['props']['questionsChoices']
  hideValues: boolean
  noOfItems: number | null
  gapCutoff: number | null
  precision?: number
  model: PreviewModel
  paginationContext: PageData | null

  style?: CSSProperties & { fontColor: string }
}

type Props = PropsFromRedux & OwnProps

const QuestionTypeComponent: FC<Props> = ({
  filters: [leftFilter, rightFilter],
  hideLeftFilter,
  hideRightFilter,
  gapType,
  assessment_id,
  tableStyle,
  questionsChoices,
  getQuestions,
  hideValues,
  noOfItems,
  gapCutoff,
  precision,
  model,
  paginationContext,
  style,
}) => {
  const tableColumns = _.get(model, 'props.tableColumns.Question')
    || _.get(DefaultTableColumns[model.props.type]?.defaultTableColumns(I18nStore), 'Question') || {} as ColumnData

  const columnsHeaderData: ColumnsHeaderData = {
    rank: {
      label: I18nStore.tTableColumns(model, 'Question', 'rank.label'),
      hide: _.get(tableColumns, 'rank.hide'),
    },
    indicator: {
      label: I18nStore.tTableColumns(model, 'Question', 'indicator.label'),
      hide: _.get(tableColumns, 'indicator.hide'),
    },
    competency: {
      label: I18nStore.tTableColumns(model, 'Question', 'competency.label'),
      hide: _.get(tableColumns, 'competency.hide'),
    },
    gap: {
      label: I18nStore.tTableColumns(model, 'Question', 'gap.label'),
      hide: _.get(tableColumns, 'gap.hide'),
    },
  }
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
              ['answers', choice.questionId, 'answers'],
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
        return _.isFinite(value) ? round(value, precision ?? 2) : null
      })

      if (!factor) {
        return null
      }

      const row = { left: values[0], right: values[1] }
      return {
        ...row,
        factorName: factor ? I18nStore.tFactorName(factor) : '',
        questionName: choice.name,
        factor,
        diff: round((row.left || 0) - (row.right || 0), precision ?? 2),
      }
    })

    const resultsWithoutHoles = results.filter(
      (result): result is Gap => result !== null,
    )
    const sortedResults = resultsWithoutHoles.sort(
      (firstResult, secondResult) => secondResult.diff - firstResult.diff,
    )

    const minGap = gapCutoff ?? 0
    const itemLimit = noOfItems ?? 5

    const positiveGaps = sortedResults
      .filter(result => result.diff > 0 && result.diff >= minGap)
      .slice(0, itemLimit).map((gap, i) => ({ ...gap, rank: i + 1 }))
    const negativeGaps = sortedResults
      .filter(result => result.diff < 0 && result.diff <= -minGap)
      .slice(-itemLimit)
      .reverse().map((gap, i) => ({ ...gap, rank: i + 1 }))

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

  const showPositiveGapTable = paginationContext
    ? !!paginationContext?.rowIds?.top?.length : (gapType === GapType.ALL || gapType === GapType.POSITIVE)
  const showNegativeGapsTable = paginationContext
    ? !!paginationContext?.rowIds?.bottom?.length : (gapType === GapType.ALL || gapType === GapType.NEGATIVE)

  const showTitle = gapType === GapType.ALL
  const styleProp = { fontSize: style?.fontSize, fontFamily: style?.fontFamily, color: style?.fontColor }
  const headerStyleProp = { color: styleProp.color }

  return (
    <div className={cs(styles.table, styles[tableStyle])} style={styleProp}>
      <table>
        <tbody>
          {showPositiveGapTable && (
            <>
              <THeader
                title={(showTitle && !_.get(tableColumns, 'positive_gaps.hide'))
                  ? I18nStore.tTableColumns(model, 'Question', 'positive_gaps.label') : ''}
                leftFilter={leftFilter}
                rightFilter={rightFilter}
                hideLeftFilter={hideLeftFilter}
                hideRightFilter={hideRightFilter}
                hideValues={hideValues}
                columnsHeaderData={columnsHeaderData}
                headerStyleProp={headerStyleProp}
              />
              <TBody
                gaps={positiveGaps}
                emptyText={I18nStore.t(
                  'reports.modules.gap_assessment.no_positive_gaps',
                )}
                hideValues={hideValues}
                hideLeftFilter={hideLeftFilter}
                hideRightFilter={hideRightFilter}
                columnsHeaderData={columnsHeaderData}
                type="top"
                paginationContext={paginationContext}
              />
            </>
          )}
          {showNegativeGapsTable && (
            <>
              <THeader
                title={(showTitle && !_.get(tableColumns, 'negative_gaps.hide'))
                  ? I18nStore.tTableColumns(model, 'Question', 'negative_gaps.label') : ''}
                leftFilter={leftFilter}
                rightFilter={rightFilter}
                hideLeftFilter={hideLeftFilter}
                hideRightFilter={hideRightFilter}
                hideValues={hideValues}
                columnsHeaderData={columnsHeaderData}
                headerStyleProp={headerStyleProp}
              />
              <TBody
                gaps={negativeGaps}
                emptyText={I18nStore.t(
                  'reports.modules.gap_assessment.no_negative_gaps',
                )}
                hideValues={hideValues}
                hideLeftFilter={hideLeftFilter}
                hideRightFilter={hideRightFilter}
                precision={precision}
                columnsHeaderData={columnsHeaderData}
                type="bottom"
                paginationContext={paginationContext}
              />
            </>
          )}
        </tbody>
      </table>
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
  allQuestions: Record<number, BaseQuestionModelInProperties<BaseQuestionProps>>,
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

interface THeaderProps {
  title: string
  leftFilter: typeof AppStore.report.filters[0]
  rightFilter: typeof AppStore.report.filters[0]
  hideLeftFilter: boolean | null
  hideRightFilter: boolean | null
  hideValues: boolean
  columnsHeaderData: ColumnsHeaderData
  headerStyleProp: CSSProperties
}

const THeader: FC<THeaderProps> = ({
  title, leftFilter, rightFilter, hideLeftFilter, hideRightFilter, hideValues, columnsHeaderData, headerStyleProp,
}) => (
  <>
    {title.length !== 0 && (
      <tr className={styles.title} data-header>
        <th colSpan={hideValues ? 3 : 6}>
          {title}
        </th>
      </tr>
    )}
    <tr className={styles.headers} style={headerStyleProp} data-header>
      {!columnsHeaderData.rank.hide && (
        <th className={styles.label}>
          {columnsHeaderData.rank.label}
        </th>
      )}
      {!columnsHeaderData.competency.hide && (
        <th className={styles.label}>
          {columnsHeaderData.competency.label}
        </th>
      )}
      {!columnsHeaderData.indicator.hide && (
        <th className={styles.label}>
          {columnsHeaderData.indicator.label}
        </th>
      )}
      {!hideValues && (
        <>
          {!hideLeftFilter && <th className={styles.label}>{I18nStore.tFilterName(leftFilter)}</th>}
          {!hideRightFilter && <th className={styles.label}>{I18nStore.tFilterName(rightFilter)}</th>}
          {!columnsHeaderData.gap.hide && (
            <th className={styles.label}>
              {columnsHeaderData.gap.label}
            </th>
          )}
        </>
      )}
    </tr>
  </>
)

interface TBodyProps {
  gaps: Array<Gap>
  emptyText: string
  hideValues: boolean
  hideLeftFilter: boolean | null
  hideRightFilter: boolean | null
  precision?: number
  type: 'top' | 'bottom'
  paginationContext: PageData | null
  columnsHeaderData: ColumnsHeaderData
}

const TBody: FC<TBodyProps> = ({
  gaps, emptyText, hideValues, precision, type, paginationContext, columnsHeaderData, hideLeftFilter, hideRightFilter,
}) => {
  if (gaps.length === 0) {
    return (
      <tr data-row={0} data-type={type}>
        <td colSpan={6}>{emptyText}</td>
      </tr>
    )
  }

  const gapStyle = (diff) => {
    if (diff === 0) { return }
    return (diff > 0 ? styles.positive : styles.negative)
  }

  const gapValue = (diff) => {
    if (diff === 0) { return 0 }

    return (diff > 0 ? '+' : '') + Utils.round(diff, precision ?? 2)
  }

  const data = paginationContext ? paginationContext.rowIds[type].map(id => gaps[id]) : gaps

  return (
    <>
      {data.map((gap, i) => (
        <tr key={i} className={styles.row} data-row={i} data-type={type}>
          {!columnsHeaderData.rank.hide && <td>{paginationContext ? gap.rank : (i + 1)}</td>}
          {!columnsHeaderData.competency.hide && <td>{gap.factorName}</td>}
          {!columnsHeaderData.indicator.hide && <td>{gap.questionName}</td>}
          {!hideValues && (
            <>
              {!hideLeftFilter && (
                <td dir="ltr">
                  {gap.left !== null
                    ? Utils.round(gap.left, precision ?? 2) : I18nStore.t('reports.modules.factors_table.na')}
                </td>
              )}
              {!hideRightFilter && (
                <td dir="ltr">
                  {gap.right !== null
                    ? Utils.round(gap.right, precision ?? 2) : I18nStore.t('reports.modules.factors_table.na')}
                </td>
              )}
              { !columnsHeaderData.gap.hide && (
                <td dir="ltr" className={gapStyle(gap.diff)}>
                  {gapValue(gap.diff)}
                </td>
              )}
            </>
          )}
        </tr>
      ))}
    </>
  )
}

const QuestionType = connector(QuestionTypeComponent)

export default QuestionType

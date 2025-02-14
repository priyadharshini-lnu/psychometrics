import { CSSProperties, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import find from 'lodash/find'
import compact from 'lodash/compact'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import meanBy from 'lodash/meanBy'
import round from 'lodash/round'
import cs from 'classnames'
import _ from 'lodash'
import { PageData } from '../../GapAssessment/PaginationContext'

import { RootState } from '~/modules/reports/core/rootReducers'
import { PreviewModel, TableSectionsType, TableStyleType } from '~/modules/reports/interfaces/tables/HighestLowest'
import { BasePreviewModel as BaseQuestionModelInPreview } from '~/modules/survey/interfaces/questions/Base'

import ResultStore from '~/modules/reports/store/ResultStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import AppStore from '~/modules/reports/store/AppStore'

import styles from './styles.less'

const MOCK_HIGHEST_LOWEST_DATA = [
  {
    questionId: 1,
    questionName: 'Instils pride and commitment by cultivating a continous learning culture',
    value: 5.0,
    factorName: 'Customer First',
    choice: 0,
  },
  {
    questionId: 2,
    questionName: 'Actively builds a culture where experimenting',
    value: 4.83,
    factorName: 'Game Changer',
    choice: 0,
  },
  {
    questionId: 3,
    questionName: 'Influences and mobilises all in organization to embrace fundamental changes',
    value: 4.83,
    factorName: 'Greater Together',
    choice: 0,
  },
  {
    questionId: 4,
    questionName: 'Create a powerful startergy for transformation',
    value: 4.83,
    factorName: 'Leads Transformation',
    choice: 0,
  },
  {
    questionId: 5,
    questionName: 'Fosters a change mindset',
    value: 4.83,
    factorName: 'Leads Transformation',
    choice: 0,
  },
  {
    questionId: 6,
    questionName: 'Demonstatres organisational resillience',
    value: 4.44,
    factorName: 'Passion For Results',
    choice: 0,
  },
  {
    questionId: 7,
    questionName: 'Invest in global relationship by building strong key customer relationshios',
    value: 4.1,
    factorName: 'Passion For Results',
    choice: 0,
  },
]

const AVAILABLE_QUESTION_TYPES = ['MatrixTable', 'SideBySide']

const connector = connect((state: RootState) => ({
  getQuestions: (assessmentId: number) => getQuestions(state.report, assessmentId),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  assessment_id: PreviewModel['assessment_id']
  filterId: PreviewModel['props']['filter']
  questionsChoices: PreviewModel['props']['questionsChoices']
  sections: TableSectionsType
  tableStyle: TableStyleType
  hideValues: boolean
  noOfItems: number | null
  scoreCutoff: number | null
  model: PreviewModel
  paginationContext: PageData | null
  style?: CSSProperties & { fontColor: string }
}

type Props = PropsFromRedux & OwnProps

const QuestionTypeComponent: FC<Props> = ({
  filterId,
  assessment_id,
  questionsChoices,
  getQuestions,
  sections,
  tableStyle,
  hideValues,
  noOfItems = 5,
  scoreCutoff,
  paginationContext,
  model,
  style,
}) => {
  const calculateHighestLowest = (
    questionsChoicesTableValues: QuestionsChoicesTableValues,
  ) => {
    const assessment = AppStore.getAssessmentById(assessment_id)
    const dimensionId = assessment?.dimensionId ?? 0
    const factorMap = keyBy(AppStore.factors[dimensionId], f => f.id)

    const results = questionsChoicesTableValues.map((choice) => {
      let factor

      type RawResult = {
        choice: number
        recode_value: number
        scale: number
        value: boolean
      }
      const data: Array<RawResult> = get(
        ResultStore,
        ['results', assessment_id, 'resultsByFilter', filterId, 'rawResults'],
        [],
      )
        .map((r) => {
          const answers = get(r, ['answers', choice.questionId, 'answers'], [])

          return answers.filter(
            a => a.choice === choice.id && a.recode_value !== undefined,
          )
        })
        .filter(r => r.length)

      const value = meanBy(compact(data), (choiceAnswers) => {
        factor = find(factorMap, f => f.question_ids.includes(choice.questionId))

        return meanBy(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          choiceAnswers,
          (a: {
            values?: Array<RawResult>
            choice: number
            recode_value: number
            scale: number
            value: boolean
          }) => {
            if (a.values) {
              return meanBy(a.values, val => val.recode_value)
            }
            return a.recode_value
          },
        )
      })

      return {
        questionId: choice.questionId,
        questionName: choice.name,
        choice: choice.id,
        factorName: factor ? I18nStore.tFactorName(factor) : '',
        value: round(value, 2) || 0,
      }
    }).filter(r => r.value > 0)

    const sortedResults = results.sort(
      (firstResult, secondResult) => secondResult.value - firstResult.value,
    )

    const itemLimit = noOfItems ?? 5
    // splice to exclude highestScore entries from lowest
    // eslint-disable-next-line max-len
    const highestScoreChoices = _.remove(sortedResults, (r, i) => r.value >= (scoreCutoff ?? -Infinity) && i < itemLimit)
    const lowestScoreChoices = sortedResults
      .filter(x => x.value < (scoreCutoff || Infinity))
      .slice(-(noOfItems ?? 5)).reverse()

    return [highestScoreChoices, lowestScoreChoices]
  }

  const allQuestions = getQuestions(assessment_id)

  // If no question choices are selected then by default consider all questions choices
  const providedQuestionChoices = questionsChoices && questionsChoices.length > 0
    ? selectedQuestionsChoicesToTableValues(allQuestions, questionsChoices)
    : getAllQuestionsChoices(allQuestions)

  const [highestChoices, lowestChoices] = ResultStore.realResults
    ? calculateHighestLowest(providedQuestionChoices)
    : [MOCK_HIGHEST_LOWEST_DATA.slice(0, 5), MOCK_HIGHEST_LOWEST_DATA.slice(-5).reverse()]

  const filter = AppStore.report.filters.find(
    filter => filter.id === filterId,
  )

  const filterName = filter ? I18nStore.tFilterName(filter) : ''
  const showHighest = paginationContext
    ? !!paginationContext?.rowIds?.top?.length : (sections !== TableSectionsType.LOWEST)
  const showLowest = paginationContext
    ? !!paginationContext?.rowIds?.bottom?.length : (sections !== TableSectionsType.HIGHEST)
  const styleProp = { fontSize: style?.fontSize, fontFamily: style?.fontFamily, color: style?.fontColor }

  return (
    <div className={cs(styles.table, styles[tableStyle])} style={styleProp}>
      <table data-table={model.id}>
        <tbody>
          {showHighest && (
            <>
              <THeaders
                title={I18nStore.t('reports.modules.highest_lowest.highest_scores')}
                filterName={filterName}
                hideValues={hideValues}
              />
              <TBody data={highestChoices} hideValues={hideValues} type="top" paginationContext={paginationContext} />
            </>
          )}
          {showLowest && (
            <>
              <THeaders
                title={I18nStore.t('reports.modules.highest_lowest.lowest_scores')}
                filterName={filterName}
                hideValues={hideValues}
              />
              <TBody data={lowestChoices} hideValues={hideValues} type="bottom" paginationContext={paginationContext} />
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

interface BaseQuestionProps {
  choicesTexts: Array<string>
}

const selectedQuestionsChoicesToTableValues = (
  allQuestions: Record<number, BaseQuestionModelInPreview<BaseQuestionProps>>,
  questionsChoices: PreviewModel['props']['questionsChoices'],
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
  allQuestions: Record<number, BaseQuestionModelInPreview<BaseQuestionProps>>,
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

interface THeadersProps {
  title: string
  filterName: string
  hideValues: boolean
}

const THeaders: FC<THeadersProps> = ({ title, filterName, hideValues }) => (
  <>
    <tr className={styles.title} data-header>
      <th colSpan={hideValues ? 3 : 4}>
        {title}
      </th>
    </tr>
    <tr className={styles.headers} data-header>
      <th className={styles.label}>
        {I18nStore.t('reports.modules.highest_lowest.rank')}
      </th>
      <th className={styles.label}>
        {I18nStore.t('reports.modules.highest_lowest.scoring_category')}
      </th>
      <th className={styles.label}>
        {I18nStore.t('reports.modules.highest_lowest.item')}
      </th>
      {!hideValues && <th className={cs(styles.label, styles.number)}>{filterName}</th>}
    </tr>
  </>
)

interface TBodyProps {
  data: Array<{
    questionId: number
    questionName: string
    choice: number
    factorName: string
    value: number
  }>
  hideValues: boolean
  type: 'top' | 'bottom'
  paginationContext: PageData | null
}

const TBody: FC<TBodyProps> = ({
  data, hideValues, type, paginationContext,
}) => {
  const ranks = data.reduce((acc, _, i) => ({ ...acc, [i]: i + 1 }), {})
  const paginatedData = paginationContext
    ? paginationContext.rowIds[type].map(id => ({ ...data[id], rank: ranks[id] })) : data

  return (
    <>
      {paginatedData.map(({
        factorName, questionName, value, rank,
      }, index) => (
        <tr key={index} className={styles.row} data-row={index} data-type={type}>
          <td>{rank}</td>
          <td>{factorName}</td>
          <td>{questionName}</td>
          {!hideValues && <td className={styles.number}>{value.toFixed(2)}</td>}
        </tr>
      ))}
    </>
  )
}


const QuestionType = connector(QuestionTypeComponent)

export default QuestionType

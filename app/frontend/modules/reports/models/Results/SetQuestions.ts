import _ from 'lodash'
import { QuestionScoringObject, RawResult } from './interfaces'
import { QuestionsResult } from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]) => _.reduce(
    rawResults,
    (result: QuestionScoringObject, data: RawResult) => _.reduce(data.answers, (
      result: QuestionScoringObject,
      questionsResults: QuestionsResult,
      questionId: string,
    ) => {
      const questionsData = result[questionId] || []
      return { ...result, [questionId]: [...questionsData, questionsResults.answers] }
    }, result),
    {},
  ) as QuestionScoringObject,
}

import _ from 'lodash'
import { setIn } from 'utils/immutable'

import { ScoringData } from 'modules/reports/models/Results/interfaces/ResultScoring'
import AppStore from '../../store/AppStore'
import ResultScoring from './interfaces/ResultScoring'
import QuestionScoringWithoutFactorsObject, { QuestionScoring } from './interfaces/QuestionScoringWithoutFactorsObject'
import Scoring from '../Scoring'

export default {
  run: (
    assessmentId: number,
    questionScoring: ResultScoring,
    dimensionId: number,
    questions,
  ): QuestionScoringWithoutFactorsObject => {
    const assessmentQuestions = questions

    const result = _.reduce(questionScoring, (
      result: QuestionScoringWithoutFactorsObject,
      questions: ScoringData,
      factorId: string,
    ) => _.reduce(questions, (result: QuestionScoringWithoutFactorsObject, value: Scoring[], id: string) => {
      if (!assessmentQuestions[id]) return result

      const scoringValues = value.map((v: Scoring) => v.getValue())

      if (result[id]) {
        return setIn(result, [id, 'values'], [...result[id].values, ...scoringValues])
      }
      const factorName = _.get(AppStore.mapFactors, [dimensionId, factorId, 'name'])
      return { ...result, [id]: { id, values: scoringValues, factorName } }
    }, result), {})


    return _.reduce(result, (result: QuestionScoringWithoutFactorsObject, scoring: QuestionScoring, id: string) => {
      const sum = _.sum(scoring.values)
      const avg = _.round(sum / scoring.values.length, 2)
      return { ...result, [id]: { ...scoring, sum, avg } }
    }, {})
  },
}

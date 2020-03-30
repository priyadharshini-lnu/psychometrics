import _ from 'lodash'
import AppStore from '../../store/AppStore'
import Scoring from '../Scoring'
import { ScoringResult } from './interfaces/RawResult'
import { ScoringByQuestion, RawResult, Factor } from './interfaces'
import { setIn } from '../../utils/immutable'

export default {
  run: (rawResults: RawResult[], dimensionId: number): ScoringByQuestion => _.reduce(
    rawResults,
    (result: ScoringByQuestion, data: RawResult) => _.reduce(
      AppStore.mapFactors[dimensionId],
      (result: ScoringByQuestion, factor: Factor, factorId: string) => {
        const scoringResults = data.scoring[factorId]
        if (!scoringResults) return result

        if (!result[factorId]) {
          result = { ...result, [factorId]: { name: factor.alias } }
        }

        return _.reduce(
          scoringResults.results,
          (result: ScoringByQuestion, obj: ScoringResult): ScoringByQuestion => {
            const scoringByQuestion = _.get(result, [factorId, obj.question_id]) || []
            return setIn(
              result,
              [factorId, obj.question_id],
              [...scoringByQuestion, new Scoring(obj)],
            )
          },
          result,
        )
      },
      result,
    ),
    {},
  ),
}

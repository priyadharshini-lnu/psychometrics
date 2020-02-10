import _ from 'lodash'
import AppStore from '../../store/AppStore'
import Scoring from '../Scoring'
import { RawResult, ResultScoring, Factor } from './interfaces'
import { setIn } from '../../utils/immutable'

export default {
  run: (rawResults: RawResult[], dimensionId: number): ResultScoring => _.reduce(
    rawResults,
    (result: ResultScoring, data: RawResult) => extendScoringByData(result, data, dimensionId),
    {},
  ),
}

const extendScoringByData = (scoring: ResultScoring, data: RawResult, dimensionId: number): ResultScoring => _.reduce(
  AppStore.mapFactors[dimensionId],
  (result: ResultScoring, factor: Factor, factorId: number) => {
    const scoringResults = data.scoring[factorId]
    if (!scoringResults) return result
    const scoring = new Scoring({
      value: scoringResults.score,
      norm: scoringResults.norm_score,
    })

    const factorResults = _.get(result, [factorId, 'results']) || []

    if (!result[factorId]) {
      result = { ...result, [factorId]: { id: factorId, name: factor.alias } }
    }
    return setIn(result, [factorId, 'results'], [...factorResults, scoring])
  },
  scoring,
)

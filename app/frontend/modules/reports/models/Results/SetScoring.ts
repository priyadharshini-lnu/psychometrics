import _ from 'lodash'
import { setIn } from '~/utils/immutable'
import AppStore from '../../store/AppStore'
import Scoring from '../Scoring'
import { RawResult, ResultScoring, Factor } from './interfaces'

export default {
  run: (rawResults: RawResult[], dimensionId: number): ResultScoring => _.reduce(
    rawResults,
    (result: ResultScoring, data: RawResult) => extendScoringByData(result, data, dimensionId),
    {},
  ),
}

const extendScoringByData = (scoring: ResultScoring, data: RawResult, dimensionId: number) => _.reduce(
  AppStore.mapFactors[dimensionId],
  (result: ResultScoring, factor: Factor, factorId: number) => {
    const scoringResults = _.get(data, ['scoring', factorId])
    if (!scoringResults) return result
    const scoring = new Scoring({
      value: scoringResults.score,
      norm: scoringResults.norm_score,
    })

    const factorResults = _.get(result, [factorId, 'results']) || []

    if (!result[factorId]) {
      result = { ...result, [factorId]: { id: factorId, name: factor.alias } }
    }
    let factorData = [...factorResults]
    if (_.isNumber(scoringResults.score) || _.isNumber(scoringResults.norm_score)) {
      factorData = [...factorResults, scoring]
    }
    return setIn(result, [factorId, 'results'], factorData)
  },
  scoring,
) as ResultScoring

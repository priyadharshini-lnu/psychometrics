import _ from 'lodash'
import { ScoringData } from './interfaces/ResultScoring'
import { ResultScoring, AverageFactor } from './interfaces'
import AppStore from '../../store/AppStore'

export default {
  run: (scoring: ResultScoring, dimensionId: number): AverageFactor[] => {
    const factors = _.reduce(scoring, (factors: AverageFactor[], score: ScoringData, factorId: string) => {
      const factorData = AppStore.mapFactors[dimensionId][factorId]
      if (factorData) {
        return [...factors, { id: factorData.id, avg: _.round(_.meanBy(score.results, 'value'), 2), name: score.name }]
      }
      return factors
    }, [])
    return _.orderBy(factors, ['avg'], ['desc'])
  },
}

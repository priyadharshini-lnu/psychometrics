import _ from 'lodash'
import AppStore from '../../store/AppStore'
import { ScoringData } from './interfaces/ResultScoring'
import { ResultsByFilter, TopFactor } from './interfaces'

export default {
  run: (
    from: number,
    to: number,
    factorIds: number[],
    areSubfactors: boolean,
    resultsByFilter: ResultsByFilter,
    dimensionId: number,
  ): TopFactor[] => {
    if (!resultsByFilter.individual) { return [] }
    const filtered = _.pick(resultsByFilter.individual.scoring, factorIds)
    const factors = _.reduce(filtered, (factors: TopFactor[], d: ScoringData, factorId: string) => {
      const factorData = AppStore.mapFactors[dimensionId][factorId]

      if (factorData && areSubfactors === AppStore.isSubfactor(parseInt(factorId, 10))) {
        return [...factors, {
          meanRawScore: _.round(_.meanBy(d.results, 'value'), 2),
          meanNormScore: _.round(_.meanBy(d.results, 'norm'), 2),
          id: parseInt(factorId, 10),
          alias: d.name,
          description: factorData.description,
          icon: factorData.icon,
        }]
      }
      return factors
    }, [])
    const sorted = _.orderBy(factors, ['meanNormScore', 'meanRawScore', 'alias'], ['desc', 'desc', 'asc'])
    return _.filter(sorted, (r: TopFactor, i: number) => i + 1 >= from && i < to)
  },
}

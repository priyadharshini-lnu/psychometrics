import _ from 'lodash'
import AppStore from '../../store/AppStore'
import { ResultsByFilter, Factor, OccupationFactor } from './interfaces'

export default {
  run: (rank: number, resultsByFilter: ResultsByFilter, dimensionId: number): OccupationFactor[] | null => {
    const occupation = _.cloneDeep(AppStore.sortedOccupations[dimensionId][rank - 1])
    if (!occupation) { return null }

    let factors = _.reduce(occupation.factors, (factors: OccupationFactor[], f: Factor) => {
      const factorScoring = resultsByFilter.individual.scoring[f.id]
      if (!factorScoring || !AppStore.isSubfactor(f.id)) return factors

      // business requirements: only subfactors
      return [
        ...factors,
        {
          id: f.id,
          alias: factorScoring.name,
          position: f.position,
          meanNormScore: factorScoring.results[0] ? factorScoring.results[0].norm : 0,
          meanRawScore: factorScoring.results[0] ? factorScoring.results[0].value : 0,
        },
      ]
    }, [])

    factors = _.orderBy(
      factors,
      ['position', 'meanNormScore', 'meanRawScore', 'alias'],
      ['asc', 'desc', 'desc', 'asc'],
    )
    return { ...occupation, factors }
  },
}

import _ from 'lodash'
import Utils from '~/modules/reports/utils/Utils'
import AppStore from '../../store/AppStore'
import { ScoringData } from './interfaces/ResultScoring'
import { ResultsByFilter, TopFactor, TopFactorType } from './interfaces'

export default {
  run: (
    from: number,
    to: number,
    factorIds: number[],
    factorType: TopFactorType,
    resultsByFilter: ResultsByFilter,
    dimensionId: number,
    minValue = -Infinity,
    maxValue = Infinity,
    relationship = 'individual',
    includesCurrentJob?: boolean,
    includesTargetJob?: boolean,
  ): TopFactor[] => {
    if (!resultsByFilter[relationship]) { return [] }
    const filtered = _.pick(resultsByFilter[relationship].scoring, factorIds)
    const factors = _.reduce(filtered, (factors: TopFactor[], d: ScoringData, factorId: string) => {
      const factorData = AppStore.mapFactors[dimensionId][factorId]
      const isSubFactor = AppStore.isSubfactor(parseInt(factorId, 10))
      const isValidFactorType = factorType === TopFactorType.Any
        || (factorType === TopFactorType.SubFactor && isSubFactor)
        || (factorType === TopFactorType.Factor && !isSubFactor)
      if (factorData && isValidFactorType) {
        const factor: TopFactor = {
          meanRawScore: Utils.nanFallback(_.round(_.meanBy(d.results, 'value'), 2)),
          meanNormScore: Utils.nanFallback(_.round(_.meanBy(d.results, 'norm'), 2)),
          id: parseInt(factorId, 10),
          alias: d.name,
          description: factorData.description,
          icon: factorData.icon,
          jobRoles: factorData?.job_roles || undefined,
        }

        // Apply job role filtering if specified
        if (includesCurrentJob || includesTargetJob) {
          const currentJobIncluded = !includesCurrentJob || factor.jobRoles?.current_job_role?.included === true
          const targetJobIncluded = !includesTargetJob || factor.jobRoles?.target_job_role?.included === true

          if (!(currentJobIncluded && targetJobIncluded)) {
            return factors
          }
        }

        return [...factors, factor]
      }
      return factors
    }, [])
    const sorted = _.orderBy(factors, ['meanNormScore', 'meanRawScore', 'alias'], ['desc', 'desc', 'asc'])
    return _(sorted)
      .filter((r: TopFactor, i: number) => i + 1 >= from && i < to).value()
      // apply score range after getting top min and max items, otherwise the factor ranking becomes undeterministic
      .filter((r: TopFactor) => _.inRange(r.meanNormScore || r.meanRawScore, minValue, maxValue))
  },
}

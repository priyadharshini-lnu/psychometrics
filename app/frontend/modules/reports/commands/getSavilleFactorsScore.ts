import find from 'lodash/find'
import keyBy from 'lodash/keyBy'
import compact from 'lodash/compact'
import { SavilleScore } from 'modules/reports/models/Result'
import { Factor } from 'modules/reports/core/interfaces/Factor'
import I18nStore from '../store/I18nStore'

type ScoreKeys = 'score' | 'y'

interface Inputs {
  scores: SavilleScore[]
  scoreType: string
  valueType: string
  scoreForFactorIds: string[]
  assessmentId: number
  allFactors: Factor[]
  scoreKey?: ScoreKeys
}

type ScoreOutput ={ name: string } & Record<ScoreKeys, number>

export function getSavilleFactorsScore ({
  scores, scoreType, valueType, scoreForFactorIds, assessmentId, allFactors, scoreKey = 'score',
}: Inputs): ScoreOutput[] {
  const factorsById = keyBy(allFactors, f => f.id)
  const data = (scoreForFactorIds || []).map((f) => {
    const externalScore = find(scores, score => (
      score.id === f && score.score_type === scoreType && score.value_type === valueType
    ))
    const factor = factorsById[f]
    if (externalScore && factor) {
      return {
        name: I18nStore.tSavilleFactorName(assessmentId, factor),
        [scoreKey]: externalScore.score,
      } as { name: string } & Record<ScoreKeys, number>
    }
    return null
  })
  return compact(data)
}

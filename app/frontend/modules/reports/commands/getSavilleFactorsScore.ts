import find from 'lodash/find'
import keyBy from 'lodash/keyBy'
import compact from 'lodash/compact'
import { SavilleScore } from '~/modules/reports/models/Result'
import { Factor } from '~/modules/reports/core/interfaces/Factor'
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
  addBarColor?: (value: number) => string | undefined
}

type ScoreOutput ={ name: string, color: string | undefined } & Record<ScoreKeys, number>

export function getSavilleFactorsScore ({
  scores, scoreType, valueType, scoreForFactorIds, assessmentId, allFactors, scoreKey = 'score', addBarColor,
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
        color: addBarColor ? addBarColor(externalScore.score) : undefined,
      } as { name: string, color: string | undefined } & Record<ScoreKeys, number>
    }
    return null
  })
  return compact(data)
}

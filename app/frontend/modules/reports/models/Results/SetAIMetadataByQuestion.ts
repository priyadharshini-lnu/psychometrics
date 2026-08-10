import _ from 'lodash'
import AppStore from '../../store/AppStore'
import { RawResult } from './interfaces'

export interface AIMetadataCitation {
  text: string
  sentiment?: string
  start_time?: number
  end_time?: number
}

export interface AIFactorMetadata {
  factorId: number
  factorName: string
  rationale: string | null
  citations: AIMetadataCitation[]
  confidence: number | null
  score: number | null
}

export interface AIMetadataByQuestion {
  [questionId: string]: AIFactorMetadata[]
}

export default {
  run: (rawResults: RawResult[], dimensionId: number): AIMetadataByQuestion => _.reduce(
    rawResults,
    (result: AIMetadataByQuestion, data: RawResult) => {
      const factors = AppStore.mapFactors[dimensionId] || {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoring = data.scoring as any

      _.each(scoring, (scoringResults, factorId) => {
        if (!scoringResults?.results) return

        _.each(scoringResults.results, (entry) => {
          if (!entry.ai_metadata || !entry.question_id) return

          const questionId = String(entry.question_id)
          const factor = factors[factorId]
          const factorName = factor?.name || factor?.alias || `Factor ${factorId}`

          const metadata: AIFactorMetadata = {
            factorId: Number(factorId),
            factorName,
            rationale: entry.ai_metadata.rationale || null,
            citations: Array.isArray(entry.ai_metadata.citations) ? entry.ai_metadata.citations : [],
            confidence: entry.ai_metadata.confidence ?? null,
            score: entry.value ?? null,
          }

          if (!result[questionId]) {
            result = { ...result, [questionId]: [metadata] }
          } else {
            result = { ...result, [questionId]: [...result[questionId], metadata] }
          }
        })
      })

      return result
    },
    {},
  ),
}

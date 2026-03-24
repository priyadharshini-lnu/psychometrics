import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import { getSavilleFactorsScore } from '~/modules/reports/commands/getSavilleFactorsScore'
import AppStore from '~/modules/reports/store/AppStore'

const GetSavilleScore = {
  run (module): number | null {
    const {
      assessment_id: assessmentId,
      props: {
        source: { factors, type, valueType },
      },
    } = module
    const factorId = factors && factors[0]
    if (factorId) {
      const externalScoring = _.get(ResultStore, ['results', assessmentId, 'externalScoring'])
      const scoreType = type.replace('Saville#', '')
      const assessment = AppStore.getAssessmentById(assessmentId)
      const scores = getSavilleFactorsScore({
        scoreType,
        valueType,
        scores: externalScoring,
        assessmentId,
        allFactors: assessment.factors,
        scoreForFactorIds: [factorId],
      })
      return scores?.length ? scores[0].score : null
    }
    return null
  },
}


export default GetSavilleScore

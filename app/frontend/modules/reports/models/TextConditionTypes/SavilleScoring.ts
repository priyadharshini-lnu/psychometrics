import isNil from 'lodash/isNil'
import AppStore from '~/modules/reports/store/AppStore'
import { getSavilleFactorsScore } from '~/modules/reports/commands/getSavilleFactorsScore'
import BaseType from './BaseType'

export class SavilleScoring extends BaseType {
  isFilled () {
    const {
      predicate, valueType, factorId, value,
    } = this.condition.props
    return !!(predicate && valueType && factorId && (value || value === 0))
  }

  isValid () {
    return this.isFilled() && this.compareScore()
  }

  compareScore () {
    const { type, props: { valueType, factorId } } = this.condition
    const scoreType = type.replace('Saville#', '')
    const assessment = AppStore.getAssessmentById(this.assessmentId)
    const scores = getSavilleFactorsScore({
      scoreType,
      valueType,
      scores: this.getResults().externalScoring,
      assessmentId: this.assessmentId,
      allFactors: assessment.factors,
      scoreForFactorIds: [factorId],
    })
    const value = scores?.length ? scores[0].score : null
    if (isNil(value)) return false

    return this.compare(value)
  }

  compare (score: number) {
    const value = parseFloat(this.condition.props.value)

    if (isNaN(value) || isNaN(score)) { return false }

    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return score === value
      case 'NotEqualTo':
        return score !== value
      case 'GreaterThen':
        return score > value
      case 'GreaterThenOrEqual':
        return score >= value
      case 'LessThen':
        return score < value
      case 'LessThenOrEqual':
        return score <= value
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  }
}

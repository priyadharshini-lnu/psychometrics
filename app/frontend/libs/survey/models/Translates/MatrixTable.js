import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class MatrixTable extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (field === 'notApplicableLabel') {
      return this.question.props.notApplicableLabel
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
    if (/^scalePointsTexts/.test(field)) {
      return this.question.props.scalePointsTexts[extraData.scale]
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    if (this.question.props.notApplicable) {
      result.notApplicableLabel = this.question.props.notApplicableLabel
    }
    _.times(this.question.props.choices, (i) => {
      result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
    })
    _.times(this.question.props.scalePoints, (i) => {
      result[`scalePointsTexts${i + 1}`] = this.question.props.scalePointsTexts[i]
    })
    return result
  }
}

export default MatrixTable

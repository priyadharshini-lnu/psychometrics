import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class MatrixTable extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
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

import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class MultipleChoice extends BaseTranslate {
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
    return result
  }
}

export default MultipleChoice

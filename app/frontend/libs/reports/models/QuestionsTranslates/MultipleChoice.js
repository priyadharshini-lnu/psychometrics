import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class MultipleChoice extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    _.times(this.question.props.choices, (i) => {
      result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
    })
    return result
  }
}

export default MultipleChoice

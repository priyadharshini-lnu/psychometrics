import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class ConstantSum extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
    if (/^labelsTexts/.test(field)) {
      return this.question.props.labelsTexts[extraData.label]
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    _.times(this.question.props.choices, (i) => {
      result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
    })
    _.times(this.question.props.labels, (i) => {
      result[`labelsTexts${i + 1}`] = this.question.props.labelsTexts[i]
    })
    return result
  }
}

export default ConstantSum

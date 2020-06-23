import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class GapAnalysis extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (field === 'tellUsText') {
      return this.question.props.tellUsText
    }
    if (field === 'categoriesText') {
      return this.question.props.categoriesText
    }
    if (/^categoriesDataText/.test(field)) {
      return this.question.props.categoriesData[extraData.choice].texts[extraData.i]
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
      tellUsText: this.question.props.tellUsText,
      categoriesText: this.question.props.categoriesText,
    }
    _.each(this.question.props.categoriesData, (data, i) => {
      _.each(data.texts, (value, j) => {
        result[`categoriesDataText${i + 1}_${j + 1}`] = value
      })
    })
    return result
  }
}

export default GapAnalysis

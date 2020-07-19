/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
import _ from 'lodash'

const SideBySide = function (result) {
  this.result = result
}

_.extend(SideBySide.prototype, {
  answer (scale) {
    const columnData = this.result.question.props.columnsData[scale]
    this[columnData.type].apply(this, arguments)
  },

  // Force Response
  requiredValidation () {
    const scaleCount = this.result.question.props.columnsData.length
    // All columns should have answered choices
    return this.result.answers.length >= (scaleCount * this.result.question.props.choices)
  },

  Likert (scale, choice, answer, value, checked) {
    const columnData = this.result.question.props.columnsData[scale]
    if (columnData.likertType === 'MultipleAnswer') {
      this.multipleAnswer(scale, choice, answer, checked)
    } else if (columnData.likertType === 'DropDown') {
      this.singleAnswer(scale, choice, value, value)
    } else {
      this.singleAnswer(scale, choice, answer, checked)
    }
  },

  Text (scale, choice, answer, value, checked) {
    this.multipleAnswer(scale, choice, answer, value, checked)
  },

  multipleAnswer (scale, choice, answer, value) {
    let object = _.find(this.result.answers, { choice, scale })
    if (object) {
      _.remove(object.values, { index: answer })
      if (value) {
        object.values.push({ index: answer, value })
      }
      if (!object.values.length) {
        _.remove(this.result.answers, { choice, scale })
      }
    } else {
      object = { choice, scale, values: [] }
      object.values.push({ index: answer, value })
      this.result.answers.push(object)
    }
  },

  singleAnswer (scale, choice, answer, value) {
    let object = _.find(this.result.answers, { choice, scale })
    let defaultValue = {}
    if (object) {
      [defaultValue] = object.values
      if (defaultValue) {
        if (!value) {
          _.remove(this.result.answers, { choice, scale })
        } else {
          defaultValue.value = value
          defaultValue.index = answer
        }
      } else {
        object.values.push({ index: answer, value })
      }
    } else {
      object = { choice, scale, values: [] }
      object.values.push({ index: answer, value })
      this.result.answers.push(object)
    }
  },
})

export default SideBySide

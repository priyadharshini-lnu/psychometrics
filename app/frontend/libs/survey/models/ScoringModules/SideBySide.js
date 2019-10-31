import _ from 'lodash'
import BaseScoringModule from './BaseScoringModule'
import SideBySideTypes from './SideBySideTypes'

class SideBySide extends BaseScoringModule {
  fill (question) {
    _.times(question.props.choices, (choice) => {
      _.times(question.props.scalePoints, (scale) => {
        if (this.isSupported(question, scale)) {
          const object = { scale, choice, values: [] }
          _.times(question.props.columnsData[scale].answers, (answer) => {
            object.values.push({ index: answer, value: answer + 1 })
          })
          this.scoring.props.push(object)
        }
      })
    })
  }

  isEmptyValues () {
    return !_.some(this.scoring.props, object => object.values.length)
  }

  changeValue (scale, choice, answer, value) {
    const object = _.find(this.scoring.props, { scale, choice })
    let answerData = null
    if (object) {
      answerData = _.find(object.values, { index: answer })
    }
    if (value && value >= 0) {
      if (answerData) {
        answerData.value = value
      } else if (object) {
        object.values.push({ index: answer, value })
      } else {
        this.scoring.props.push({ scale, choice, values: [{ index: answer, value }] })
      }
    } else if (answerData) {
      _.remove(object.values, { index: answer })
      if (!object.values.length) {
        _.remove(this.scoring.props, { scale, choice })
      }
    }
  }

  createType (filter) {
    let type = null
    if (filter.scale !== undefined) { type = 'Scale' }
    if (filter.choice !== undefined) { type = 'Choice' }
    if (filter.answer !== undefined) { type = 'Answer' }
    return new SideBySideTypes[type](this.scoring)
  }

  toggle (filter, question) {
    const type = this.createType(filter)
    type.toggle(filter, question)
  }

  asc (filter, question) {
    const type = this.createType(filter)
    type.asc(filter, question)
  }

  desc (filter, question) {
    const type = this.createType(filter)
    type.desc(filter, question)
  }

  /**
   * Set value to all row of scales or choices
   *
   * @param {Object} filter
   * @param {number} value
   * @param {Question} question
   */
  setTemplate (filter, value, question) {
    const type = this.createType(filter)
    type.setTemplate(filter, value, question)
  }

  clear (filter, question) {
    const type = this.createType(filter)
    type.clear(filter, question)
  }

  isSupported (question, scale) {
    return question.props.columnsData[scale].type !== 'Text'
  }

  findAnswer (filter, index) {
    const object = _.find(this.scoring.props, filter)
    if (object) {
      return _.find(object.values, { index }) || {}
    }
    return {}
  }
}

export default SideBySide

import _ from 'lodash'
import BaseScoringModule from './BaseScoringModule'

class MatrixTable extends BaseScoringModule {
  fill (question) {
    _.times(question.props.choices, (choice) => {
      _.times(question.props.scalePoints, (scale) => {
        this.scoring.props.push({ scale, choice, value: scale + 1 })
      })
    })
  }

  changeValue (scale, choice, value) {
    if (value && value >= 0) {
      const object = _.find(this.scoring.props, { scale, choice })
      if (object) {
        object.value = value
      } else {
        this.scoring.props.push({ scale, choice, value })
      }
    } else {
      _.remove(this.scoring.props, { scale, choice })
    }
  }

  toggle (filter, question) {
    const objects = _.filter(this.scoring.props, filter)
    if (this.isSorted(objects, filter.scale === undefined ? 'scale' : 'choice')) {
      this.desc(filter, question)
    } else if (objects.length) {
      _.remove(this.scoring.props, filter)
    } else {
      this.asc(filter, question)
    }
  }

  asc (filter, question) {
    this.changeRow('asc', filter, 1, question)
  }

  desc (filter, question) {
    this.changeRow('desc', filter,
      filter.scale !== undefined ? question.props.choices : question.props.scalePoints, question)
  }

  /**
   * Set value to all row of scales or choices
   *
   * @param {Object} filter
   * @param {number} value
   * @param {Question} question
   */
  setTemplate (filter, value, question) {
    this.changeRow('const', filter, value, question)
  }

  clear (filter) {
    _.remove(this.scoring.props, filter)
  }

  changeRow (type, filter, value, question) {
    _.remove(this.scoring.props, filter)
    if (filter.scale !== undefined) {
      _.times(question.props.choices, (choice) => {
        this.scoring.props.push({ scale: filter.scale, choice, value })
        if (type === 'asc') {
          value += 1
        }
        if (type === 'desc') {
          value -= 1
        }
      })
    }
    if (filter.choice !== undefined) {
      _.times(question.props.scalePoints, (scale) => {
        this.scoring.props.push({ choice: filter.choice, scale, value })
        if (type === 'asc') {
          value += 1
        }
        if (type === 'desc') {
          value -= 1
        }
      })
    }
  }

  isSorted (objects, type) {
    if (objects.length) {
      const sortedObjects = _.sortBy(objects, data => data[type])
      return _.every(sortedObjects, (object, index, array) => index === 0 || array[index - 1].value < object.value)
    }
    return false
  }
}

export default MatrixTable

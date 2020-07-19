import _ from 'lodash'
import BaseType from './BaseType'

class Answer extends BaseType {
  toggle (filter, question) {
    const objects = this.getAnswerObjects(filter.scale, filter.answer, question)
    if (this.isSorted(objects, question)) {
      this.desc(filter, question)
    } else if (objects.length) {
      this.clear(filter, question)
    } else {
      this.asc(filter, question)
    }
  }

  getValueByTemplate (type, question, choice, value) {
    switch (type) {
      case 'const':
        return value
      case 'asc':
        return choice + 1
      case 'desc':
        return question.props.choices - choice
      default:
    }
  }

  asc (filter, question) {
    this.changeRow('asc', filter, null, question)
  }

  desc (filter, question) {
    this.changeRow('desc', filter, null, question)
  }

  setTemplate (filter, value, question) {
    this.changeRow('const', filter, value, question)
  }

  changeRow (type, filter, value, question) {
    const { scale } = filter
    const { answer } = filter
    const objects = _.filter(this.scoring.props, { scale })
    _.each(objects, (object) => {
      _.remove(object.values, { index: answer })
    })
    _.times(question.props.choices, (choice) => {
      const object = _.find(this.scoring.props, { scale, choice })
      if (object) {
        object.values.push({ index: answer, value: this.getValueByTemplate(type, question, choice, value) })
      } else {
        this.scoring.props.push({
          scale,
          choice,
          values: [{ index: answer, value: this.getValueByTemplate(type, question, choice, value) }],
        })
      }
    })
  }

  clear (filter, question) {
    const { scale } = filter
    const { answer } = filter
    const objects = []
    _.times(question.props.choices, (choice) => {
      const object = _.find(this.scoring.props, { scale, choice })
      if (object) {
        _.remove(object.values, { index: answer })
        if (!object.values.length) {
          _.remove(this.scoring.props, { scale, choice })
        }
      }
    })
    return objects
  }

  getAnswerObjects (scale, answer, question) {
    const objects = []
    _.times(question.props.choices, (choice) => {
      const object = _.find(this.scoring.props, { scale, choice })
      if (object) {
        const answerData = _.find(object.values, { index: answer })
        if (answerData) {
          objects.push(answerData)
        }
      }
    })
    return objects
  }

  isSorted (objects, question) {
    if (objects.length !== question.props.choices) {
      return false
    }
    return _.every(objects, (object, index, array) => index === 0 || array[index - 1].value < object.value)
  }
}

export default Answer

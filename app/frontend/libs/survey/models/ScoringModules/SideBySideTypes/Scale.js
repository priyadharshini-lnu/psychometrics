import _ from 'lodash'
import BaseType from './BaseType'

class Scale extends BaseType {
  toggle (filter, question) {
    const objects = _.filter(this.scoring.props, filter)
    if (this.isSorted(objects)) {
      this.desc(filter, question)
    } else if (objects.length) {
      _.remove(this.scoring.props, filter)
    } else {
      this.asc(filter, question)
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
    _.remove(this.scoring.props, { scale })
    _.times(question.props.choices, (choice) => {
      const object = { scale, choice, values: [] }
      _.times(question.props.columnsData[scale].answers, (answer) => {
        object.values.push({ index: answer, value: this.getValueByTemplate(type, question, scale, answer, value) })
      })
      this.scoring.props.push(object)
    })
  }

  getValueByTemplate (type, question, scale, answer, value) {
    switch (type) {
      case 'const':
        return value
      case 'asc':
        return 1 + answer
      case 'desc':
        return question.props.columnsData[scale].answers - answer
      default:
        return null
    }
  }
}

export default Scale

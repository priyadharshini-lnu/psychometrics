import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './QuestionCondition.scss'

const TYPES = [
  'MultipleChoice',
  'MatrixTable',
  'Slider',
  'RankOrder',
  'SideBySide',
  'GapAnalysis',
  'ConstantSum',
  'PickGroupRank',
]
export default class QuestionSelect extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    questions: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  getQuestions () {
    const { questions } = this.props
    return _.filter(questions, question => _.includes(TYPES, question.type))
  }

  selectQuestion = (e) => {
    const { questions } = this.props
    const id = e.currentTarget.value
    if (!id) { return }
    const { condition } = this.props
    const question = questions[id]
    condition.subject = question.id
    condition.type = ''
    condition.answer = ''
    this.sync(condition)
  }

  stripHTML = (dirtyString) => {
    const str = _.unescape(dirtyString).replace(/<\/?[^>]+(>|$)|\\n|&nbsp;/g, '')
    return _.trim(str)
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  render () {
    const { condition } = this.props
    const questions = this.getQuestions()
    return (
      <div className={styles.questionSelect}>
        <select
          className="form-control"
          placeholder="Select Question..."
          value={condition.subject || ''}
          onChange={this.selectQuestion}
        >
          {!condition.subject && <option />}
          {_.map(questions, q => (
            <option key={q.id} value={q.id}>
              {`${q.name} ${this.stripHTML(q.props.questionText).substring(0, 80)}`}
            </option>
          ))}
        </select>
      </div>
    )
  }
}

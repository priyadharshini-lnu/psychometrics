import _ from 'lodash'
import React, { Component } from 'react'
import styles from './QuestionCondition.scss'
import AnswersSelector from './AnswersSelector'

class QuestionCondition extends Component {
  getAnswers (question) {
    return AnswersSelector[question.type](question)
  }

  changeAnswer = (answers, e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    if (!value) {
      condition.answer = ''
      condition.type = ''
      condition.predicate = ''
    } else {
      const answer = _.find(answers, { value })
      condition.answer = answer.value
      condition.predicate = ''
    }
    this.sync(condition)
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  render () {
    const { condition, questions } = this.props
    if (!condition.subject) { return null }
    const question = questions[condition.subject]
    if (!question) { return null }
    const answers = this.getAnswers(question)
    return (
      <div className={styles.answers}>
        {condition.subject
          && (
          <select
            className="form-control"
            value={condition.answer || ''}
            placeholder="Select Answer..."
            onChange={e => this.changeAnswer(answers, e)}
          >
            <option />
            {_.map(answers, (q, i) => <option key={i} value={q.value}>{q.label.replace(/(<([^>]+)>)/ig, '')}</option>)}
          </select>
          )}
      </div>
    )
  }
}

export default QuestionCondition

import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import store from 'rb/store/AssessmentStore'
import css from '../Condition.scss'

export default class Question extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  stripHTML = (dirtyString) => {
    const str = _.unescape(dirtyString).replace(/<\/?[^>]+(>|$)|\\n|&nbsp;/g, '')
    return _.trim(str)
  }

  renderQuestion () {
    const { condition: { subject } } = this.props
    const assessment = _.first(AppStore.assessments)
    const q = store.questions[assessment.id][subject]
    if (q) {
      return <div>{`${q.name} ${this.stripHTML(q.props.questionText).substring(0, 80)}`}</div>
    }
    return <div>Undefined</div>
  }

  renderAnswer () {
    const { condition: { subject, answer } } = this.props
    const assessment = _.first(AppStore.assessments)
    const question = store.questions[assessment.id][subject]
    if (question) {
      const text = question.props.choicesTexts[answer] || `${`Click to write Choice ${answer + 1}`}`
      return <div>{text}</div>
    }
    return <div>Undefined</div>
  }

  renderCondition () {
    const { condition: { type, predicate, value } } = this.props

    return (
      <div>
        [
        {type}
        {' '}
        <b>is</b>
        {' '}
        {predicate}
        {' '}
        {value}
        ]
      </div>
    )
  }

  render () {
    const { condition: { filterId } } = this.props
    const filter = _.find(AppStore.report.filters, { id: +filterId })
    return (
      <div className={`${css.preview} ${css.question}`}>
        <div className={css.filter}>
          (
          {filter ? filter.name : 'Unknown'}
          )
        </div>
        {this.renderQuestion()}
        {this.renderAnswer()}
        {this.renderCondition()}
      </div>
    )
  }
}

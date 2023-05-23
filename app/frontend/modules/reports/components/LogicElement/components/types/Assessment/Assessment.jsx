import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import css from './Assessment.less'

export default class Assessment extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  change = (cond) => {
    const { condition, onChange } = this.props
    condition.setProps(cond)
    onChange()
    this.forceUpdate()
  }

  changeAnswer = (e) => {
    const answer = e.currentTarget.value
    const { condition, onChange } = this.props
    condition.answer = answer
    onChange()
  }

  changeAssessment = (e) => {
    const { value } = e.currentTarget
    const { condition, onChange } = this.props
    condition.subject = value
    onChange()
  }

  render () {
    const { condition, assessments } = this.props
    return (
      <div className={css.assessment}>
        <div className={css.container}>
          <select
            className="form-control"
            placeholder="Select Subject..."
            value={condition.subject || ''}
            onChange={this.changeAssessment}
          >
            {!condition.subject && <option />}
            {_.map(assessments, (assessment, id) => (
              <option key={id} value={assessment.id}>
                {assessment.name}
              </option>
            ))}
          </select>
        </div>
        <div className={css.container}>
          <div className={css.label}>
            Status Is
          </div>
          <select
            className="form-control"
            placeholder="Select Value..."
            value={condition.answer || ''}
            onChange={this.changeAnswer}
          >
            {!condition.answer && <option />}
            <option value="Completed">Completed</option>
            <option value="NotCompleted">Not Completed</option>
            <option value="ResultAvailable">Result Available</option>
            <option value="ScoringAvailable">Scoring Available</option>
          </select>
        </div>
      </div>
    )
  }
}

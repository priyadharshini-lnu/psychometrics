import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AssessmentStore from 'rb/store/AssessmentStore'
import styles from '../../Condition.scss'
import embeddedStyles from './EmbeddedData.scss'

export class EmbeddedData extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.props.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeKey = (e) => {
    const { condition } = this.props
    condition.props.key = e.currentTarget.value
    this.forceUpdate()
  }

  changeCount = (e) => {
    const { condition } = this.props
    condition.props.count = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition, model } = this.props
    const assessmentId = model.module.assessment_id
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.key}
          className={`form-control ${embeddedStyles.keyInput}`}
          onChange={this.changeKey}
        >
          {!condition.props.key && <option />}
          {_.map(AssessmentStore.embeddedData[assessmentId], embeddedData => (
            <option key={embeddedData.value} value={embeddedData.value}>{embeddedData.value}</option>
          ))}
        </select>
        <span>Is</span>
        <select
          value={condition.props.predicate}
          className={`form-control ${embeddedStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          {!condition.props.predicate && <option />}
          <option value="EqualTo">Equal To</option>
          <option value="NotEqualTo">Not Equal To</option>
          <option value="GreaterThen">Greater Than</option>
          <option value="GreaterThenOrEqual">Greater Than Or Equal To</option>
          <option value="LessThen">Less Than</option>
          <option value="LessThenOrEqual">Less Than Or Equal To</option>
        </select>
        <input
          className={`form-control ${embeddedStyles.valueInput}`}
          value={condition.props.value || ''}
          onChange={this.changeValue}
        />
        <span className="margin-left-10">Count Greater Than</span>
        <input
          className={`form-control ${embeddedStyles.valueInput}`}
          value={condition.props.count || ''}
          onChange={this.changeCount}
        />
      </div>
    )
  }
}

export default EmbeddedData

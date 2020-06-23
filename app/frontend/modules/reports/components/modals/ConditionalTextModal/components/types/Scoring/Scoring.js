import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import { PSYCHOMETRIC } from 'rb/models/Assessment'
import { DATA_SHEET } from 'rb/models/Module'
import localStyles from './Scoring.scss'
import styles from '../../Condition.scss'

export class Scoring extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
  }

  getSubjects (assessment) {
    const { condition } = this.props
    if (condition.type === DATA_SHEET) {
      return AppStore.report.dataSheetColumns.map(column => ({ id: column.name, name: column.name }))
    }
    if (assessment.category === PSYCHOMETRIC) {
      return AppStore.factors[assessment.dimensionId]
    }

    return assessment.factors.filter(f => f.type === condition.type)
  }

  changeSubject = (e) => {
    const { condition } = this.props
    condition.props.subject = e.currentTarget.value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.props.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeOperation = (e) => {
    const { condition } = this.props
    condition.props.operation = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition, model } = this.props
    const { value } = condition.props
    const assessmentId = model.module.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })

    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.subject}
          onChange={this.changeSubject}
          className={`form-control ${localStyles.subjectSelect}`}
        >
          {!condition.props.subject && <option />}
          {this.getSubjects(assessment).map(factor => (
            <option key={factor.id} value={factor.id}>{factor.alias || factor.name}</option>
          ))}
        </select>
        <select
          value={condition.props.operation}
          onChange={this.changeOperation}
          className={`form-control ${localStyles.predicateSelect}`}
        >
          {!condition.props.operation && <option />}
          <option value="Mean">Mean</option>
          <option value="Max">Max</option>
          <option value="Min">Min</option>
        </select>
        <select
          value={condition.props.predicate}
          onChange={this.changePredicate}
          className={`form-control ${localStyles.predicateSelect}`}
        >
          {!condition.props.predicate && <option />}
          <option value="EqualTo">Equal To</option>
          <option value="NotEqualTo">Not Equal To</option>
          <option value="GreaterThen">Greater Than</option>
          <option value="GreaterThenOrEqual">Greater Than Or Equal To</option>
          <option value="LessThen">Less Than</option>
          <option value="LessThenOrEqual">Less Than Or Equal To</option>
        </select>
        <input className={`form-control ${localStyles.subjectSelect}`} value={value} onChange={this.changeValue} />
      </div>
    )
  }
}

export default Scoring

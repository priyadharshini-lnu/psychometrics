import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../../Condition.scss'
import localStyles from './Date.scss'

export class Date extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
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

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.subject}
          onChange={this.changeSubject}
          className={`form-control ${localStyles.subjectSelect}`}
        >
          <option value="StartDate">Assessment Start Date</option>
          <option value="EndDate">Assessment End Date</option>
        </select>
        <select
          value={condition.props.predicate}
          onChange={this.changePredicate}
          className={`form-control ${localStyles.predicateSelect}`}
        >
          {[
            'Is', 'Before', 'Since', 'Between',
          ].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={condition.props.value}
          onChange={this.changeValue}
          className={`form-control ${localStyles.valueSelect}`}
        >
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="7DaysAgo">7 Days Ago</option>
          <option value="30DaysAgo">30 Days Ago</option>
          <option value="60DaysAgo">60 Days Ago</option>
          <option value="120DaysAgo">120 Days Ago</option>
          <option value="365DaysAgo">365 Days Ago</option>
        </select>
      </div>
    )
  }
}

export default Date

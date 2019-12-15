import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Utils from 'rb/utils/Utils'
import styles from '../../Condition.scss'
import localStyles from './Scoring.scss'

export class Scoring extends Component {
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
    condition.props.value = Utils.parseFloat(e.currentTarget.value)
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
        <input
          className={`form-control ${localStyles.subjectSelect}`}
          value={condition.props.value || ''}
          onChange={this.changeValue}
        />
      </div>
    )
  }
}

export default Scoring

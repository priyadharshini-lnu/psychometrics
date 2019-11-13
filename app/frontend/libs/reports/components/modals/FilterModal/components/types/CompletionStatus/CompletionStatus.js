import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../../Condition.scss'
import localStyles from './CompletionStatus.scss'

export class CompletionStatus extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changeStatus = (e) => {
    const { condition } = this.props
    condition.props.status = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.status}
          onChange={this.changeStatus}
          className={`form-control ${localStyles.statusSelect}`}
        >
          <option value="All">All</option>
          <option value="Partial">Partial</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    )
  }
}

export default CompletionStatus

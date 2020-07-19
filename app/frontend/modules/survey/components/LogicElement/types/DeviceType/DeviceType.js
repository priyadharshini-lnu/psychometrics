import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../../Condition.scss'
import deviceStyles from './DeviceType.scss'

export default class DeviceType extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.predicate}
          onChange={this.changePredicate}
          className={`form-control ${deviceStyles.predicateSelect}`}
        >
          <option value="is">is</option>
          <option value="isNot">is not</option>
        </select>
        <select
          value={condition.value}
          onChange={this.changeValue}
          className={`form-control ${deviceStyles.valueSelect}`}
        >
          {[
            'Mobile', 'Blackberry', 'Android', 'iPad', 'iPhone', 'iPod',
            'Opera Mobile', 'Palm', 'Windows Mobile', 'Other Mobile',
          ].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    )
  }
}

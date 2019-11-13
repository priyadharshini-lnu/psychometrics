import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'store/AppStore'
import styles from '../../Condition.scss'
import embeddedStyles from './EvaluatorRelationship.scss'

export default class EvaluatorRelationship extends Component {
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
          className={`form-control ${embeddedStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          <option value="EqualTo">Is</option>
          <option value="NotEqualTo">Is Not</option>
        </select>
        <select
          className={`form-control ${embeddedStyles.valueInput}`}
          value={condition.value || ''}
          onChange={this.changeValue}
        >
          <option />
          {AppStore.relationships.map((relation, i) => <option key={i} value={relation.name}>{relation.name}</option>)}
        </select>
      </div>
    )
  }
}

import { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from '~/modules/reports/store/AppStore'
import styles from '../../Condition.less'
import localStyles from './RelationShip.less'

export default class RelationShip extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.props.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.predicate}
          className={`form-control ${localStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          {!condition.props.predicate && <option />}
          <option value="Is">Is</option>
          <option value="IsNot">Is Not</option>
        </select>

        <select
          value={condition.props.value || ''}
          className={`form-control ${localStyles.predicateSelect}`}
          onChange={this.changeValue}
        >
          {!condition.props.value && <option />}
          {AppStore.report.relationships.map(relation => (
            <option key={relation.id} value={relation.name}>
              {relation.name}
            </option>
          ))}
        </select>
      </div>
    )
  }
}

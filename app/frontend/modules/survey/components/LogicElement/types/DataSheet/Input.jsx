import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './DataSheet.less'

const PREDICATE = {
  IsSameAsSubject: 'Is Same as Subject',
  EqualTo: 'Equal To',
  NotEqualTo: 'Not Equal To',
  GreaterThen: 'Greater Than',
  GreaterThenOrEqual: 'Greater Than Or Equal To',
  LessThen: 'Less Than',
  LessThenOrEqual: 'Less Than Or Equal To',
}

export default class Input extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  changeType = (e) => {
    const { condition, onChange } = this.props
    condition.predicate = e.currentTarget.value
    onChange(condition)
  }

  changeValue = (e) => {
    const { condition, onChange } = this.props
    condition.value = e.currentTarget.value
    onChange(condition)
  }

  renderSelect () {
    const { condition } = this.props
    return (
      <select className="form-control" value={condition.predicate} onChange={this.changeType}>
        {!condition.predicate && <option />}
        {_.map(PREDICATE, (label, value) => (<option key={value} value={value}>{label}</option>))}
      </select>
    )
  }

  renderInput () {
    const { condition } = this.props
    if (condition.predicate && condition.predicate !== 'IsSameAsSubject') {
      return (
        <input
          type="text"
          className="form-control"
          defaultValue={condition.value}
          onChange={this.changeValue}
        />
      )
    }
    return <div className={styles.empty} />
  }

  render () {
    return (
      <div className={styles.predicates}>
        {this.renderSelect()}
        {this.renderInput()}
      </div>
    )
  }
}

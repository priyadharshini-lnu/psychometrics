import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './Condition.scss'
import Types from './types'

export class Condition extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
    disableRemove: PropTypes.bool,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  changeType = (e) => {
    const { condition } = this.props
    condition.setData({ conditionType: e.currentTarget.value })
    this.forceUpdate()
  }

  changePrefix = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.prefix = value
    this.forceUpdate()
  }

  add = () => {
    const { condition, onAdd } = this.props
    onAdd(condition)
  }

  remove = () => {
    const { condition, onRemove } = this.props
    onRemove(condition)
  }

  renderConditionType () {
    const { condition } = this.props
    const type = condition.conditionType
    const View = Types[type]
    return <View model={condition} />
  }

  renderLogicType () {
    const { condition, model } = this.props
    const first = condition === model.conditions[0]
    if (first) {
      return (
        <span className={styles.keyword}>if</span>
      )
    }
    return (
      <select value={condition.prefix} onChange={this.changePrefix} className={`form-control ${styles.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
      </select>
    )
  }

  renderTypeOptions () {
    const { condition } = this.props
    return (
      <select
        className={`form-control ${styles.selectType}`}
        onChange={this.changeType}
        value={condition.conditionType}
      >
        {_.map(['Question', 'Hris'], type => (<option key={type} value={type}>{type}</option>))}
      </select>
    )
  }

  renderRemoveButton () {
    const { disableRemove } = this.props
    if (disableRemove) {
      return (
        <span className={`btn fa fa-minus-circle ${styles.btn} ${styles.disabled}`} style={{ color: 'red' }} />
      )
    }
    return (
      <span onClick={this.remove} className={`btn fa fa-minus-circle ${styles.btn}`} style={{ color: 'red' }} />
    )
  }

  render () {
    return (
      <div className={styles.condition}>
        {this.renderLogicType()}
        {this.renderTypeOptions()}
        {this.renderConditionType()}
        <div className={styles.btns}>
          {this.renderRemoveButton()}
          <span onClick={this.add} className={`btn fa fa-plus-circle ${styles.btn}`} style={{ color: 'green' }} />
        </div>
      </div>
    )
  }
}

export default Condition

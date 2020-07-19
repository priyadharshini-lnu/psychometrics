import React, { Component } from 'react'
import PropTypes from 'prop-types'
import css from './Condition.scss'
import Types from './types'
import { DEFAULTS, TYPE_LABELS } from './Constants'

export default class Condition extends Component {
  static propTypes = {
    types: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
    disableRemove: PropTypes.bool,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    moveToNewConditionList: PropTypes.func.isRequired,
  }

  changeConditionType = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.reset()
    condition.conditionType = value
    Object.assign(condition, DEFAULTS[value])
    this.forceUpdate()
  }

  changePrefix = (e) => {
    const { condition, moveToNewConditionList } = this.props
    const { value } = e.currentTarget
    if (value === 'new') {
      moveToNewConditionList(condition)
    } else {
      condition.prefix = value
    }
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
    const View = Types[type] || Types.Question
    return <View {...this.props} />
  }

  renderLogicType () {
    const { condition, model } = this.props
    const first = condition === model.conditions[0]
    if (first) {
      return <span className={css.keyword}>if</span>
    }
    return (
      <select value={condition.prefix} onChange={this.changePrefix} className={`form-control ${css.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
        <option value="new">Move to a new Logic Set</option>
      </select>
    )
  }

  renderConditionTypeSelect () {
    const { condition } = this.props
    const { types } = this.props
    return (
      <select
        value={condition.conditionType}
        onChange={this.changeConditionType}
        className={`form-control ${css.condType}`}
      >
        {types.map((type, i) => (
          <option key={i} value={type}>{TYPE_LABELS[type]}</option>
        ))}
      </select>
    )
  }

  renderRemoveButton () {
    const { disableRemove } = this.props
    if (disableRemove) {
      return (
        <span className={`btn fa fa-minus-circle ${css.btn} ${css.disabled}`} style={{ color: 'red' }} />
      )
    }
    return (
      <span onClick={this.remove} className={`btn fa fa-minus-circle ${css.btn}`} style={{ color: 'red' }} />
    )
  }

  render () {
    return (
      <div className={css.condition}>
        {this.renderLogicType()}
        {this.renderConditionTypeSelect()}
        {this.renderConditionType()}
        <div className={css.btns}>
          {this.renderRemoveButton()}
          <span onClick={this.add} className={`btn fa fa-plus-circle ${css.btn}`} style={{ color: 'green' }} />
        </div>
      </div>
    )
  }
}

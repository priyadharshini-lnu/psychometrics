import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ConditionModel from 'models/logic/Condition'
import css from './ConditionList.scss'
import Condition from './Condition'

export default class ConditionList extends Component {
  static propTypes = {
    types: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    removeList: PropTypes.func.isRequired,
    addList: PropTypes.func.isRequired,
    safeFirstElement: PropTypes.bool,
    index: PropTypes.number.isRequired,
    conditionsCount: PropTypes.number.isRequired,
  }

  addCondition = () => {
    const { model } = this.props
    model.conditions.push(new ConditionModel({ prefix: 'And' }))
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    const { model, removeList } = this.props
    _.pull(model.conditions, condition)
    if (model.conditions.length === 1) {
      model.conditions[0].prefix = null
    }
    if (model.conditions.length === 0) {
      removeList(model)
    }
    this.forceUpdate()
  }

  moveToNewConditionList = (condition) => {
    const { addList } = this.props
    this.removeCondition(condition)
    addList(condition)
  }

  changePrefix = (e) => {
    const { model, addList } = this.props
    const { value } = e.currentTarget
    if (value === 'new') {
      addList()
    } else {
      model.prefix = value
    }
    this.forceUpdate()
  }

  renderPrefixType () {
    const { model, index } = this.props
    const first = index === 0
    if (first) {
      return <span className={css.keyword}>if</span>
    }
    return (
      <select value={model.prefix} onChange={this.changePrefix} className={`form-control ${css.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
        <option value="new">Add to a new Logic Set</option>
      </select>
    )
  }

  render () {
    const {
      model, types, conditionsCount, safeFirstElement,
    } = this.props
    const { conditions } = model
    return (
      <div className={css.logicBlock}>
        {conditionsCount > 1 && this.renderPrefixType()}
        <div className={`${css.logicList} ${conditionsCount > 1 ? css.shift : ''}`}>
          {_.map(conditions, (condition, i) => (
            <Condition
              key={i}
              types={types}
              model={model}
              condition={condition}
              onAdd={this.addCondition}
              onRemove={this.removeCondition}
              moveToNewConditionList={this.moveToNewConditionList}
              disableRemove={safeFirstElement && i === 0 && model.conditions.length === 1}
            />
          ))}
        </div>
      </div>
    )
  }
}

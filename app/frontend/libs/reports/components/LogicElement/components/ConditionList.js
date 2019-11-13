import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ConditionModel from 'rb/models/logic/Condition'
import css from './ConditionList.scss'
import Condition from './Condition'
import { MOVE_TO_NEW_ROW } from '../Constants'


export default class ConditionList extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    conditionsCount: PropTypes.number.isRequired,
    types: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    removeList: PropTypes.func.isRequired,
    addList: PropTypes.func.isRequired,
    safeFirstElement: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  addCondition = () => {
    const { model, onChange } = this.props
    model.conditions.push(new ConditionModel({ prefix: 'And' }))
    onChange()
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    const { model, removeList, onChange } = this.props
    _.pull(model.conditions, condition)
    if (model.conditions.length === 1) {
      model.conditions[0].prefix = null
    }
    if (model.conditions.length === 0) {
      removeList(model)
    }
    onChange()
    this.forceUpdate()
  }

  moveToNewConditionList = (condition) => {
    const { addList } = this.props
    this.removeCondition(condition)
    addList(condition)
  }

  changePrefix = (e) => {
    const { model, addList, onChange } = this.props
    const { value } = e.currentTarget
    if (value === MOVE_TO_NEW_ROW) {
      addList()
    } else {
      model.prefix = value
    }
    onChange()
    this.forceUpdate()
  }

  renderPrefixType () {
    const { index, model } = this.props
    const first = index === 0
    if (first) {
      return <span className={css.keyword}>if</span>
    }
    return (
      <select value={model.prefix} onChange={this.changePrefix} className={`form-control ${css.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
        <option value={MOVE_TO_NEW_ROW}>Add to a new Logic Set</option>
      </select>
    )
  }

  render () {
    const {
      model, conditionsCount, onChange, types, safeFirstElement,
    } = this.props
    const { conditions } = model
    const count = conditionsCount
    return (
      <div className={css.logicBlock}>
        {count > 1 && this.renderPrefixType()}
        <div className={`${css.logicList} ${count > 1 ? css.shift : ''}`}>
          {_.map(conditions, (condition, i) => (
            <Condition
              key={i}
              onChange={onChange}
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

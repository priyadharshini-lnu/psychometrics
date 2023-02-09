import { Component } from 'react'
import PropTypes from 'prop-types'
import css from './LogicElement.less'
import ConditionList from './ConditionList'

export default class LogicElement extends Component {
  static propTypes = {
    types: PropTypes.array.isRequired,
    logic: PropTypes.object.isRequired,
  }

  addNewList = (condition) => {
    const { logic } = this.props
    logic.addNewList(condition)
    this.forceUpdate()
  }

  removeList = (list) => {
    const { logic } = this.props
    logic.removeList(list)
    this.forceUpdate()
  }

  render () {
    const { logic, types } = this.props
    return (
      <div className={css.listWrapper}>
        {logic.conditions.map((conditionList, i) => (
          <ConditionList
            key={i}
            model={conditionList}
            index={i}
            types={types}
            conditionsCount={logic.conditions.length}
            safeFirstElement={logic.conditions.length === 1 && i === 0}
            addList={this.addNewList}
            removeList={this.removeList}
          />
        ))}
      </div>
    )
  }
}

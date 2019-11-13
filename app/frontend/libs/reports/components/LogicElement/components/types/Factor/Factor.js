import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import AliasStore from 'rb/store/modals/AliasStore'
import css from './Factor.scss'
import ConditionSelect from '../Question/ConditionSelect'
import FactorSelect from './FactorSelect'

export default class Factor extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  change = (cond) => {
    const { condition, onChange } = this.props
    condition.setProps(cond)
    onChange()
    this.forceUpdate()
  }

  changeFilter = (e) => {
    const { condition, onChange } = this.props
    const id = e.currentTarget.value
    condition.setProps({
      filterId: id,
      answer: '',
      type: '',
      value: '',
    })
    onChange()
    this.forceUpdate()
  }

  renderFilterSelect = (condition) => {
    const { filterId } = condition
    return (
      <select
        value={filterId}
        onChange={this.changeFilter}
        className={`form-control ${css.filter}`}
      >
        <option />
        {AppStore.report.filters.map((filter, i) => <option key={i} value={filter.id}>{filter.name}</option>)}
      </select>
    )
  }

  render () {
    const { condition } = this.props
    return (
      <div className={css.factor}>
        {this.renderFilterSelect(condition)}
        <div className={css.container}>
          <div className={css.factorBlock}>
            {condition.filterId && (
            <FactorSelect
              factors={AliasStore.getFactors()}
              condition={condition}
              onChange={this.change}
            />
            )}
          </div>
          <ConditionSelect condition={condition} onChange={this.change} />
        </div>
      </div>
    )
  }
}

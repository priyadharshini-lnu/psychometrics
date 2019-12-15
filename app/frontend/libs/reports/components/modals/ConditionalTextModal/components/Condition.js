import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import { SOURCE_TYPES } from 'rb/models/Report'
import styles from './Condition.scss'
import Types from './types'
import DefaultValues from './DefaultValues'

class Condition extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
    disableRemove: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  changeConditionType = ({ currentTarget }) => {
    const { condition } = this.props
    const { value } = currentTarget
    condition.type = value
    condition.props = { ...(DefaultValues[value] || {}), prefix: condition.props.prefix }
    this.forceUpdate()
  }

  changeFilterScope = ({ currentTarget }) => {
    const { condition } = this.props
    condition.props.filterScope = currentTarget.value
    this.forceUpdate()
  }

  changePrefix = ({ currentTarget }) => {
    const { condition } = this.props
    const { value } = currentTarget
    condition.props.prefix = value
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

  renderFilterScope () {
    const { condition } = this.props
    return (
      <select
        value={condition.props.filterScope || ''}
        onChange={this.changeFilterScope}
        className={`form-control ${styles.condType}`}
      >
        <option>All Responses</option>
        {_.map(AppStore.report.filters, filter => (
          <option key={filter.id} value={filter.id}>
            {filter.name}
          </option>
        ))}
      </select>
    )
  }

  renderLogicType () {
    const { condition, model } = this.props
    const first = condition === model.conditions[0]
    if (first) {
      return <span className={styles.keyword}>if</span>
    }
    return (
      <select value={condition.props.prefix} onChange={this.changePrefix} className={`form-control ${styles.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
      </select>
    )
  }

  renderConditionType () {
    const { condition } = this.props
    const type = condition.getType()
    const View = Types[type]
    if (View) {
      return <View {...this.props} />
    }
    return null
  }

  renderConditionTypeSelect () {
    const { condition, model } = this.props
    const assessmentId = model.module.assessment_id
    const { category } = AppStore.getAssessmentById(assessmentId)
    const options = SOURCE_TYPES[category].filter(o => o.condition)
    return (
      <select
        value={condition.getType() || ''}
        onChange={this.changeConditionType}
        className={`form-control ${styles.condType}`}
      >
        <option value="" disabled>
          Select Data Source...
        </option>
        <option value="DataSheet">Data Sheet</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  renderRemoveButton () {
    const { disableRemove } = this.props
    if (disableRemove) {
      return <span className={`btn fa fa-minus-circle ${styles.btn} ${styles.disabled}`} style={{ color: 'gray' }} />
    }
    return <span onClick={this.remove} className={`btn fa fa-minus-circle ${styles.btn}`} style={{ color: 'red' }} />
  }

  render () {
    return (
      <div className={styles.condition}>
        {this.renderLogicType()}
        {this.renderFilterScope()}
        {this.renderConditionTypeSelect()}
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

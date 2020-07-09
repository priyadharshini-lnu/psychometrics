import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Condition.scss'
import Types from './types'
import DefaultValues from './DefaultValues'

export class Condition extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
    disableRemove: PropTypes.bool,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  changeConditionType = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.type = value
    condition.props = DefaultValues[value]
    this.forceUpdate()
  }

  changePrefix = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.props.prefix = value
    this.forceUpdate()
  }

  changeFilterScope = (e) => {
    const { condition } = this.props
    condition.props.filterScope = e.currentTarget.value
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

  renderLogicType () {
    const { condition, model } = this.props
    const first = condition === model.conditions[0]
    if (!first) {
      return (
        <span>{condition.props.prefix}</span>
      )
    }
  }

  renderConditionType () {
    const View = Types.Scoring
    return <View {...this.props} />
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Condition.scss'
import Types from './types'
import DefaultValues from './DefaultValues'

class Condition extends Component {
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
    if (first) {
      return (
        <span className={styles.keyword}>if</span>
      )
    }
    return (
      <select value={condition.props.prefix} onChange={this.changePrefix} className={`form-control ${styles.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
      </select>
    )
  }

  renderConditionType () {
    const { condition: { type } } = this.props
    const View = Types[type] || Types.Question
    return <View {...this.props} />
  }

  renderConditionTypeSelect () {
    const { condition } = this.props
    return (
      <select
        value={condition.type}
        onChange={this.changeConditionType}
        className={`form-control ${styles.condType}`}
      >
        <option value="RelationShip">Filter By Relationship</option>
        {/* <option value="CompletionStatus">Filter By Completion Status</option> */}
        {/* <option value="Date">Filter By Date</option> */}
        {/* <option value="Scoring">Filter By Scoring</option> */}
        {/* <option value="EmbeddedData">Filter By Embedded Data</option> */}
        {/* <option value="HrisData">Filter By HRIS Data</option> */}
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
        {this.renderConditionTypeSelect()}
        {this.renderConditionType()}
        {false && (
        <div className={styles.btns}>
          {this.renderRemoveButton()}
          <span onClick={this.add} className={`btn fa fa-plus-circle ${styles.btn}`} style={{ color: 'green' }} />
        </div>
        )}
      </div>
    )
  }
}

export default Condition

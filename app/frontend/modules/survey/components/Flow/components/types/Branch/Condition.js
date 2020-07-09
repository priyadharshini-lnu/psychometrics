import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Settings from '../../Settings'
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

  changeConditionType = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.conditionType = value
    Object.assign(condition, Settings.Branch.defaultsConditions[value])
    this.forceUpdate()
  }

  changePrefix = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.prefix = value
    this.forceUpdate()
  }

  add = () => {
    const { onAdd, condition } = this.props
    onAdd(condition)
  }

  remove = () => {
    const { onRemove, condition } = this.props
    onRemove(condition)
  }

  renderLogicType () {
    const { condition, model } = this.props
    const first = condition === model.props.conditions[0]
    if (first) {
      return (
        <span className={styles.keyword}>if</span>
      )
    }
    return (
      <select
        value={condition.prefix}
        onChange={this.changePrefix}
        className={`form-control ${styles.prefix}`}
      >
        <option value="And">And if</option>
        <option value="Or">Or if</option>
      </select>
    )
  }


  renderConditionType () {
    const { condition } = this.props
    const type = condition.conditionType
    const View = Types[type].Editor || Types.Question.Editor
    return <View {...this.props} />
  }

  renderConditionTypeSelect () {
    const { condition } = this.props
    return (
      <select
        value={condition.conditionType}
        onChange={this.changeConditionType}
        className={`form-control ${styles.condType}`}
      >
        <option value="Question">Question</option>
        <option value="EmbeddedData">Embedded Data</option>
        <option value="DeviceType">Device Type</option>
        <option value="GeoIP">Geo IP Location</option>
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
        <div className={styles.btns}>
          {this.renderRemoveButton()}
          <span onClick={this.add} className={`btn fa fa-plus-circle ${styles.btn}`} style={{ color: 'green' }} />
        </div>
      </div>
    )
  }
}

export default Condition

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlowCondition from 'models/FlowCondition'
import styles from './Branch.scss'
import ConditionList from './ConditionList'
import Controls from '../../Controls'

class Branch extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  initConditions = () => {
    const { model } = this.props
    model.props.conditions.push(new FlowCondition())
    this.forceUpdate()
  }

  update = () => {
    this.forceUpdate()
  }

  renderWarning () {
    return (
      <div className={styles.warning}>
        <span>This branch will not be triggered until you</span>
        <a onClick={this.initConditions}>Add a Condition</a>
      </div>
    )
  }

  renderConditions () {
    const { model } = this.props
    return (
      <div className={styles.listWrapper}>
        <span className={styles.label}>Then Branch If:</span>
        <ConditionList model={model} onRemove={this.update} />
      </div>
    )
  }

  render () {
    const {
      model, onRemove, onAddBelow, onDuplicate, onMove,
    } = this.props
    const hasConditions = model.props.conditions.length
    return (
      <div>
        <div className={styles.row}>
          <div className={styles.iconWrapper}>
            <span className={`fa fa-code-fork fa-rotate-90 ${styles.icon}`} />
          </div>
          {hasConditions ? this.renderConditions() : this.renderWarning()}
        </div>
        <div className={styles.footer}>
          <Controls
            styles={styles}
            onRemove={onRemove}
            onAddBelow={onAddBelow}
            onDuplicate={onDuplicate}
            onMove={onMove}
          />
        </div>
      </div>
    )
  }
}

export default Branch

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'components/ChoicesInput'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeEnableSubmitAfter = (val) => {
    const { model } = this.props
    model.props.enableSubmitAfter = val
    model.update()
    this.forceUpdate()
  }

  changeAutoAdvanceAfter = (val) => {
    const { model } = this.props
    model.props.autoAdvanceAfter = val
    model.update()
    this.forceUpdate()
  }

  changeShowTimer = (e) => {
    const { model } = this.props
    model.props.showTimer = e.currentTarget.checked
    model.update()
    this.forceUpdate()
  }

  changeTimerCountDown = (e) => {
    const { model } = this.props
    model.props.timerCountDown = (e.currentTarget.value === 'true')
    model.update()
    this.forceUpdate()
  }

  changeSeconds = (val) => {
    const { model } = this.props
    model.props.seconds = val
    model.update()
    this.forceUpdate()
  }

  renderEnableSubmitAfter () {
    const { model, model: { props } } = this.props
    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Enable submit after (seconds)</span>
        <ChoicesInput value={props.enableSubmitAfter} model={model} onChange={this.changeEnableSubmitAfter} />
      </div>
    )
  }

  renderAutoAdvanceAfter () {
    const { model, model: { props } } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Auto-advance after (seconds)</span>
          <ChoicesInput value={props.autoAdvanceAfter} model={model} onChange={this.changeAutoAdvanceAfter} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderShowTimer () {
    const { model, model: { props } } = this.props

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Options</div>
        <label className={styles.inputLabel}>
          <input
            checked={props.showTimer === true}
            type="checkbox"
            name={`q_${model.id}_show_timer`}
            onChange={this.changeShowTimer}
            value="true"
          />
          {' '}
          Show Timer
        </label>
      </div>
    )
  }

  renderTimerCountDown () {
    const { model, model: { props } } = this.props

    if (props.showTimer === false) return

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Timer</div>
        <label className={styles.inputLabel}>
          <input
            checked={props.timerCountDown === true}
            type="radio"
            name={`q_${model.id}_count_down`}
            onChange={this.changeTimerCountDown}
            value="true"
          />
          {' '}
          Count Down
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={props.timerCountDown === false}
            type="radio"
            name={`q_${model.id}_count_down`}
            onChange={this.changeTimerCountDown}
            value="false"
          />
          {' '}
          Count Up
        </label>
      </div>
    )
  }

  renderSeconds () {
    const { model, model: { props } } = this.props

    if (props.showTimer === false) return

    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Seconds to Count</span>
        <ChoicesInput maxValue={86400} value={props.seconds} model={model} onChange={this.changeSeconds} />
      </div>
    )
  }

  render () {
    return (
      <div>
        {this.renderEnableSubmitAfter()}
        {this.renderAutoAdvanceAfter()}
        {this.renderShowTimer()}
        {this.renderTimerCountDown()}
        {this.renderSeconds()}
      </div>
    )
  }
}

export default Properties

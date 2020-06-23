import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Timing.scss'

const HOUR = 3600000
const MINUTE = 60000
const SECOND = 1000

export class Timer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    startTimer: PropTypes.bool.isRequired,
    onBodyClick: PropTypes.func.isRequired,
    onEnableSubmit: PropTypes.func.isRequired,
    onAutoAdvance: PropTypes.func.isRequired,
  }

  state = {
    startTime: Date.now(),
    enabledSubmit: false,
    autoAdvance: false,
  }

  componentDidMount () {
    const { startTimer } = this.props
    if (startTimer === true) this.interval = setInterval(() => this.tick(), 100)
    document.addEventListener('click', this.click)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
    document.removeEventListener('click', this.click)
  }

  tick = () => {
    const { startTime, enabledSubmit, autoAdvance } = this.state
    const { model: { props } } = this.props
    const seconds = (Date.now() - startTime) / SECOND

    if (enabledSubmit === false && seconds >= props.enableSubmitAfter) {
      this.setState({ enabledSubmit: true })
      this.enableSubmit()
    }

    if (autoAdvance === false && seconds >= props.autoAdvanceAfter) {
      this.setState({ autoAdvance: true })
      this.autoAdvance()
    }

    this.forceUpdate()
  }

  click = () => {
    const { onBodyClick } = this.props
    const { startTime } = this.state
    const miliseconds = Date.now() - startTime
    onBodyClick(miliseconds)
  }

  enableSubmit = () => {
    const { onEnableSubmit } = this.props
    onEnableSubmit()
  }

  autoAdvance = () => {
    const { onAutoAdvance } = this.props
    onAutoAdvance()
  }

  /* Insert zero before number */
  padZero (num) {
    return num < 10 ? (`0${num}`) : num
  }

  render () {
    const { startTime } = this.state
    const { startTimer, model: { props } } = this.props
    /* If timer is working then we calculate delta */
    let miliseconds = (startTimer === true) ? Date.now() - startTime : 0

    /* Don't render timer if props restrict it */
    if (props.showTimer === false) return (<div />)

    /* If Timer is Count Down */
    if (props.timerCountDown === true) {
      miliseconds = Math.max(0, (props.seconds * SECOND - miliseconds))
    } else {
      miliseconds = Math.min(props.seconds * SECOND, miliseconds)
    }

    /* Parse hours, minutes, seconds from miliseconds */
    const hours = Math.floor(miliseconds / HOUR)
    const minutes = Math.floor((miliseconds % HOUR) / MINUTE)
    const seconds = Math.floor((miliseconds % MINUTE) / SECOND)

    return (
      <div className={styles.timer}>
        <span>{this.padZero(hours)}</span>
        <span className={styles.colon}>:</span>
        <span>{this.padZero(minutes)}</span>
        <span className={styles.colon}>:</span>
        <span>{this.padZero(seconds)}</span>
      </div>
    )
  }
}

export default Timer

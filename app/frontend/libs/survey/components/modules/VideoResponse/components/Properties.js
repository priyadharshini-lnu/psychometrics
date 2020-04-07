import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import Validations, { RequiredValidations } from 'components/Validations'
import NumberInput from 'components/NumberInput'

export class Properties extends Component {
  durations = [
    { value: 10, display: '10s' },
    { value: 30, display: '30s' },
    { value: 60, display: '1min' },
    { value: 120, display: '2min' },
    { value: 180, display: '3min' },
    { value: 300, display: '5min' },
    { value: 600, display: '10min' },
  ]

  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  frameOptions = [
    { value: '', display: 'None' },
    { value: 'upperHalfBody', display: 'Upper Half Body' },
    { value: 'face', display: 'Full Face' },
  ]

  trackerOptions = {
    upperHalfBody: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    },
    face: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    },
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  changeDuration = (e) => {
    const { model } = this.props
    const duration = parseInt(e.currentTarget.value, 10)
    model.changeProps({ duration })
    this.update()
  }

  updateFitInFrame = (e) => {
    const { model } = this.props
    const fitInFrame = e.currentTarget.value
    model.changeProps({ fitInFrame })
    this.update()
  }

  updateTrackerOptions = (key, val) => {
    const { model, model: { props: { fitInFrame, trackerOptions } } } = this.props
    const options = { ...this.trackerOptions, ...trackerOptions }

    options[fitInFrame][key] = val
    model.changeProps({ trackerOptions: options })
    this.update()
  }

  durationFields () {
    const { model } = this.props

    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <span className={styles.label}>Max Duration</span>
        <select className="form-control" value={model.props.duration} onChange={this.changeDuration}>
          {this.durations.map(j => (<option key={j.value} value={j.value}>{`${j.display}`}</option>))}
        </select>
      </div>
    )
  }

  displayTrackerOptions () {
    const { model: { props: { fitInFrame, trackerOptions } } } = this.props

    if (!fitInFrame) return

    const properties = (trackerOptions || this.trackerOptions)[fitInFrame]
    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        {Object.keys(properties).map((key, i) => (
          <NumberInput
            key={i}
            label={key}
            name={key}
            value={properties[key]}
            onChange={this.updateTrackerOptions}
          />
        ))}
      </div>
    )
  }

  frameFields () {
    const { model } = this.props

    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <span className={styles.label}>Fit In Frame</span>
        <select className="form-control" value={model.props.fitInFrame} onChange={this.updateFitInFrame}>
          {this.frameOptions.map(o => (<option key={o.value} value={o.value}>{`${o.display}`}</option>))}
        </select>

        { this.displayTrackerOptions() }
      </div>
    )
  }

  renderVideoFields () {
    return (
      <div>
        { this.durationFields() }
        { this.frameFields() }
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    return (
      <div>
        {this.renderVideoFields()}
        <hr className={styles.divider} />
        {!restricted && (
        <RequiredValidations
          model={model}
          update={() => this.forceUpdate()}
        />
        )}
        {!restricted && (
        <Validations
          model={model}
          update={() => this.forceUpdate()}
        />
        )}
      </div>
    )
  }
}

export default Properties

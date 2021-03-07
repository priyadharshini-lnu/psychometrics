import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ValidationTypes from 'components/ValidationTypes'
import RequiredValidations from 'components/RequiredValidations'

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

  renderVideoFields () {
    const { model } = this.props
    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <span className={styles.label}>Max Duration</span>
        <select className="form-control" value={model.props.duration} onChange={this.changeDuration}>
          {this.durations.map(({ value, display }) => (<option key={value} value={value}>{`${display}s`}</option>))}
        </select>
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
          <ValidationTypes
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}

export default Properties

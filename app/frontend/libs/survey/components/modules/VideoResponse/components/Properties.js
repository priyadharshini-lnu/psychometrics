import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import Validations, { RequiredValidations } from 'components/Validations'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  durations = [10, 20, 30, 40, 50, 60, 90, 120]

  update = () => {
    const { model } = this.props
    model.update()
    PropertyPanelStore.update()
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
          {this.durations.map(j => (<option key={j} value={j}>{`${j}s`}</option>))}
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

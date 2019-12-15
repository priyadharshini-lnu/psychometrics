import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'rb/components/ChoicesInput'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  checkboxHandler = (type, e) => {
    const { model } = this.props
    model.props[type] = e.currentTarget.checked
    this.update()
  }

  changePointWidth = (value) => {
    const { model } = this.props
    model.props.pointWidth = value
    this.update()
  }

  changeGraphicalPosition = (e) => {
    const { model } = this.props
    model.props.graphicalPosition = e.currentTarget.value
    this.update()
  }

  renderPositionOptions () {
    const { model } = this.props
    return (
      <div>
        <span className={styles.label}>Graph Subtype</span>
        <select className="form-control" value={model.props.graphicalPosition} onChange={this.changeGraphicalPosition}>
          {_.map(['Vertical', 'Horizontal'], (name, i) => (<option key={i} value={name}>{name}</option>))}
        </select>
      </div>
    )
  }

  renderAxisOptions () {
    const { model } = this.props
    return (
      <div>
        <div className="margin-top-10">
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.xAxisLinesHide || false}
              onChange={e => this.checkboxHandler('xAxisLinesHide', e)}
            />
            Hide X-axis gridlines
          </label>
        </div>
        <div className="margin-top-10">
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.yAxisLinesHide || false}
              onChange={e => this.checkboxHandler('yAxisLinesHide', e)}
            />
            Hide Y-axis gridlines
          </label>
        </div>
      </div>
    )
  }

  render () {
    const { model } = this.props
    const { pointWidth } = model.props
    return (
      <div>
        {this.renderPositionOptions()}
        <div className={styles.block}>
          Bar weight
          <ChoicesInput
            value={pointWidth}
            onChange={this.changePointWidth}
            minValue={10}
            maxValue={100}
          />
        </div>
        {this.renderAxisOptions()}
      </div>
    )
  }
}

export default Properties

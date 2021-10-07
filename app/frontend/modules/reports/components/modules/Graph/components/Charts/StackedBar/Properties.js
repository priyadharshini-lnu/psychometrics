import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'modules/reports/views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'modules/reports/components/ChoicesInput'

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
    const graphSubtypeOptions = ['Vertical', 'Horizontal']
    return (
      <div>
        <span className={styles.label}>Graph Subtype</span>
        <select className="form-control" value={model.props.graphicalPosition} onChange={this.changeGraphicalPosition}>
          {graphSubtypeOptions.map((subtype, idx) => (<option key={idx} value={subtype}>{subtype}</option>))}
        </select>
      </div>
    )
  }

  renderAxisOptions () {
    const { model } = this.props
    return (
      <div>
        <div className="mt-4">
          <label className="font-normal">
            <input
              type="checkbox"
              checked={model.props.xAxisLinesHide || false}
              onChange={e => this.checkboxHandler('xAxisLinesHide', e)}
            />
            Hide X-axis gridlines
          </label>
        </div>
        <div className="mt-4">
          <label className="font-normal">
            <input
              type="checkbox"
              checked={model.props.yAxisLinesHide || false}
              onChange={e => this.checkboxHandler('yAxisLinesHide', e)}
            />
            Hide Y-axis gridlines
          </label>
        </div>
        <div className="mt-4">
          <label className="font-normal">
            <input
              type="checkbox"
              checked={model.props.xAxisLabelHide || false}
              onChange={e => this.checkboxHandler('xAxisLabelHide', e)}
            />
            Hide X-axis title
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

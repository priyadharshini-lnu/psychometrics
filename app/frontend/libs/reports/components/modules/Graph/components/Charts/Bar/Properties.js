import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import _ from 'lodash'
import AssessmentStore from 'rb/store/AssessmentStore'
import Series from './Series'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeDataFormat = (e) => {
    const { model } = this.props
    model.props.dataFormat = e.currentTarget.value
    this.update()
  }

  change3D = (e) => {
    const { model } = this.props
    model.props.graphicalRepresentation = e.currentTarget.value
    this.update()
  }

  changeGraphicalPosition = (e) => {
    const { model } = this.props
    model.props.graphicalPosition = e.currentTarget.value
    this.update()
  }

  changeLegendPosition = (e) => {
    const { model } = this.props
    model.props.legendPosition = e.currentTarget.value
    this.update()
  }

  changeMaxValue = (e) => {
    const { model } = this.props
    model.props.maxValue = e.currentTarget.value !== '' ? e.currentTarget.value : null
    this.update()
  }

  changeInnerSize = (val) => {
    const { model } = this.props
    model.props.innerSize = val
    this.update()
  }

  checkboxHandler = (type, e) => {
    const { model } = this.props
    model.props[type] = e.currentTarget.checked
    this.update()
  }

  render3DOptions () {
    const { model } = this.props
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Graph Subtype</span>
        <select className="form-control" value={model.props.graphicalRepresentation} onChange={this.change3D}>
          {_.map(['3D', 'Standard'], (name, i) => (<option key={i} value={name}>{name}</option>))}
        </select>
      </div>
    )
  }

  renderLegendPosition () {
    const { model } = this.props
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Legend Position</span>
        <select
          className="form-control"
          value={model.props.legendPosition || 'Bottom Middle'}
          onChange={this.changeLegendPosition}
        >
          {_.map(['Top Left', 'Top Middle', 'Top Right', 'Bottom Left', 'Bottom Middle', 'Bottom Right'], (name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
      </div>
    )
  }

  renderPositionOptions () {
    const { model } = this.props
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Graph Subtype</span>
        <select className="form-control" value={model.props.graphicalPosition} onChange={this.changeGraphicalPosition}>
          {_.map(['Vertical', 'Horizontal'], (name, i) => (<option key={i} value={name}>{name}</option>))}
        </select>
      </div>
    )
  }

  renderMaxValueOptions () {
    const { model } = this.props
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Max Value (number)</span>
        <input
          value={model.props.maxValue || ''}
          onChange={this.changeMaxValue}
          placeholder="Max Value"
          type="number"
          className="form-control"
          min="0"
        />
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

  renderDataFormat () {
    const { model } = this.props
    if (!model.props.source) {
      return null
    }
    let question
    const assessmentId = model.assessment_id
    if (model.props.source && model.props.source.type === 'Question') {
      question = AssessmentStore.questions[assessmentId][model.props.source.id]
      if (!question) {
        return null
      }
    }
    if (!model.getSourceType()) {
      return null
    }
    const seriesFunction = Series[model.getSourceType()].functions
    const funcs = typeof seriesFunction === 'function' ? seriesFunction.call(this, question) : seriesFunction

    return (
      <select className="form-control" value={model.props.dataFormat} onChange={this.changeDataFormat}>
        {_.map(funcs, (name, i) => (<option key={i} value={name}>{name}</option>))}
      </select>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <span className={styles.label}>Data Format</span>
        {this.renderDataFormat()}
        {this.render3DOptions()}
        {this.renderPositionOptions()}
        {this.renderMaxValueOptions()}
        {this.renderAxisOptions()}
        {this.renderLegendPosition()}
        <div className="margin-top-10">
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.showLegend || false}
              onChange={e => this.checkboxHandler('showLegend', e)}
            />
            Show Legend
          </label>
        </div>
      </div>
    )
  }
}

export default Properties

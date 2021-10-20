import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'modules/reports/views/PropertyPanel/components/PropertyPanel.scss'
import { connect } from 'react-redux'
import { getQuestions } from 'modules/reports/core/builder/selectors'
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
    const graphOptions = ['3D', 'Standard']
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Graph Subtype</span>
        <select className="form-control" value={model.props.graphicalRepresentation} onChange={this.change3D}>
          {graphOptions.map((option, idx) => (<option key={idx} value={option}>{option}</option>))}
        </select>
      </div>
    )
  }

  renderLegendPosition () {
    const { model } = this.props
    const positionOptions = ['Top Left', 'Top Middle', 'Top Right', 'Bottom Left', 'Bottom Middle', 'Bottom Right']
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Legend Position</span>
        <select
          className="form-control"
          value={model.props.legendPosition || 'Bottom Middle'}
          onChange={this.changeLegendPosition}
        >
          {positionOptions.map((position, idx) => (
            <option key={idx} value={position}>{position}</option>
          ))}
        </select>
      </div>
    )
  }

  renderPositionOptions () {
    const { model } = this.props
    const graphSubtypeOptions = ['Vertical', 'Horizontal']
    return (
      <div className="margin-top-10">
        <span className={styles.label}>Graph Subtype</span>
        <select className="form-control" value={model.props.graphicalPosition} onChange={this.changeGraphicalPosition}>
          {graphSubtypeOptions.map((subtype, idx) => (<option key={idx} value={subtype}>{subtype}</option>))}
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

  renderDataFormat () {
    const { model, questions } = this.props
    if (!model.props.source) {
      return null
    }
    let question
    if (model.props.source && model.props.source.type === 'Question') {
      question = questions[model.props.source.id]
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
        {funcs.map((name, idx) => (<option key={idx} value={name}>{name}</option>))}
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


export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Properties)

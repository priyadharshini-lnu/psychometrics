import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import _ from 'lodash'
import AssessmentStore from 'rb/store/AssessmentStore'
import ChoicesInput from 'rb/components/ChoicesInput'
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

  checkboxHandler = (type, e) => {
    const { model } = this.props
    model.props[type] = e.currentTarget.checked
    this.update()
  }

  changeDataFormat = (e) => {
    const { model } = this.props
    model.props.dataFormat = e.currentTarget.value
    this.update()
  }

  changeLineWidth = (val) => {
    const { model } = this.props
    model.props.lineWidth = val
    this.update()
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
    const seriesFunction = Series[model.getSourceType()].functions
    const funcs = typeof seriesFunction === 'function' ? seriesFunction.call(this, question) : seriesFunction

    return (
      <select className="form-control" value={model.props.dataFormat} onChange={this.changeDataFormat}>
        {_.map(funcs, (name, i) => (<option key={i} value={name}>{name}</option>))}
      </select>
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
        <div className="margin-top-10">
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.yAxisTitleDisabled || false}
              onChange={e => this.checkboxHandler('yAxisTitleDisabled', e)}
            />
            Hide Y-axis title
          </label>
        </div>
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <span className={styles.label}>Data Format</span>
        {this.renderDataFormat()}
        <div className="margin-top-10">
          Line Width
          <ChoicesInput value={model.props.lineWidth} onChange={this.changeLineWidth} maxValue={10} />
        </div>
        {this.renderAxisOptions()}
      </div>
    )
  }
}

export default Properties

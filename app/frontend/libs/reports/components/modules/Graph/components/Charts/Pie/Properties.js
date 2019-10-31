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

  changeInnerSize = (val) => {
    const { model } = this.props
    model.props.innerSize = val
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

  render () {
    const { model } = this.props
    return (
      <div>
        <span className={styles.label}>Data Format</span>
        {this.renderDataFormat()}
        {this.render3DOptions()}
        <div className="margin-top-10">
          Inner Size
          <ChoicesInput value={model.props.innerSize} onChange={this.changeInnerSize} maxValue={100} />
        </div>
      </div>
    )
  }
}

export default Properties

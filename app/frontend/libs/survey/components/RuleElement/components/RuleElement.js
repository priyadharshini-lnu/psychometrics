import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './RuleElement.scss'
import Types from './types'
import ConditionList from './ConditionList'

class RuleElement extends Component {
  static propTypes = {
    model: PropTypes.object,
  }

  constructor (props) {
    super(props)
    let normUiType = ''
    if (props.model.norm_id) {
      normUiType = 'Norm'
    }
    if (props.model.norm_type) {
      normUiType = 'Norm Type'
    }
    this.state = {
      normUiType,
    }
  }

  changeType = (e) => {
    const { model } = this.props
    model.changeType(e.currentTarget.value)
    this.forceUpdate()
  }

  changeNorm = (e) => {
    const { model } = this.props
    model.norm_id = e.currentTarget.value
    this.forceUpdate()
  }

  changeNormType = (e) => {
    const { model } = this.props
    model.norm_type = e.currentTarget.value
    this.forceUpdate()
  }

  changeNormUiType = (e) => {
    const { model } = this.props
    model.norm_type = null
    model.norm_id = null
    this.setState({
      normUiType: e.currentTarget.value,
    })
  }

  remove = () => {
    const { removeNormRule, model } = this.props
    removeNormRule(model)
    this.forceUpdate()
  }

  renderType () {
    const { model } = this.props
    const View = Types[model.type]
    if (View) {
      return <View model={model} />
    }
  }

  renderTypeOptions () {
    const { model } = this.props
    return (
      <select className={`form-control ${styles.selectType}`} onChange={this.changeType} value={model.type}>
        {_.map(['Question', 'Hris'], type => (<option key={type} value={type}>{type}</option>))}
      </select>
    )
  }

  renderNormOptions () {
    const { normUiType } = this.state
    const { model, norms } = this.props
    if (!norms.length) {
      return (
        <div className="alert alert-danger" style={{ float: 'none' }}>
          You need to add norm for this assessment and relative dimension
        </div>
      )
    }
    return (
      <div>
        <span className={styles.title}>Set Norm or Norm Type:</span>
        <select className={`${styles.select}`} onChange={this.changeNormUiType} value={normUiType || ''}>
          <option>Choice...</option>
          {_.map(['Norm', 'Norm Type'], type => (<option key={type} value={type}>{type}</option>))}
        </select>
        {normUiType === 'Norm' && (
          <select className={styles.select} value={model.norm_id || ''} onChange={this.changeNorm}>
            {!model.norm_id && <option value="">Choose Norm</option>}
            {_.map(norms, norm => (<option key={norm.id} value={norm.id || ''}>{norm.name}</option>))}
          </select>
        )}
        {normUiType === 'Norm Type' && (
          <select className={styles.select} value={model.norm_type || ''} onChange={this.changeNormType}>
            {!model.norm_type && <option value="">Choose Norm Type</option>}
            {_.map(['YTI', 'ETI'], type => (<option key={type} value={type}>{type}</option>))}
          </select>
        )}
      </div>
    )
  }

  renderConditions () {
    const { model, questions } = this.props
    return (
      <ConditionList questions={questions} model={model} onRemove={this.update} />
    )
  }

  render () {
    return (
      <div className={styles.element}>
        <div className={styles.normContainer}>
          {this.renderNormOptions()}
        </div>
        <div className={styles.typeContainer}>
          {this.renderConditions()}
        </div>
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete</a>
        </div>
      </div>
    )
  }
}

export default RuleElement

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InnovationStyleConditionStore from 'rb/store/modals/InnovationStyleConditionStore'
import AppStore from 'rb/store/AppStore'
import styles from './InnovationStyleConditionModal.scss'
import ConditionList from './ConditionList'
import localStyles from './types/Scoring/Scoring.scss'

export class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (type, text) => {
    const { model } = this.props
    model[type] = text
    this.forceUpdate()
  }

  changeSubject = (e) => {
    const { model } = this.props
    model.innovationStyleId = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeStrengths = (e) => {
    this.changeText('strengths', e.currentTarget.value)
  }

  changeBlindspots = (e) => {
    this.changeText('blindspots', e.currentTarget.value)
  }

  remove = () => {
    const { model } = this.props
    InnovationStyleConditionStore.module.removeConditionCollection(model)
    InnovationStyleConditionStore.update()
  }

  update = () => {
    this.forceUpdate()
  }

  renderConditions () {
    const { model } = this.props
    const assessment = _.find(AppStore.assessments, { id: model.module.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    const list = AppStore.innovationStyles[dimensionId]
    return (
      <div className={styles.listWrapper}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>If</span>
          <select
            value={model.innovationStyleId}
            onChange={this.changeSubject}
            className={`form-control ${localStyles.subjectSelect}`}
          >
            {!model.innovationStyleId && <option />}
            {list.map(innovationStyle => (
              <option key={innovationStyle.id} value={innovationStyle.id}>{innovationStyle.name}</option>
            ))}
          </select>
        </div>
        <ConditionList model={model} onRemove={this.update} />
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.filterContainer}>
        {this.renderConditions()}
        Then show the following text:
        <div>
          <strong>Strengths</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.strengths || ''}
            onChange={this.changeStrengths}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div>
          <strong>Blindspots</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.blindspots || ''}
            onChange={this.changeBlindspots}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete</a>
        </div>
      </div>
    )
  }
}

export default ConditionCollection

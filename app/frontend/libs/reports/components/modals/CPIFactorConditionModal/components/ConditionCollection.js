import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CPIFactorConditionStore from 'rb/store/modals/CPIFactorConditionStore'
import AppStore from 'rb/store/AppStore'
import styles from './CPIFactorConditionModal.scss'
import ConditionList from './ConditionList'
import localStyles from './types/Scoring/Scoring.scss'
import ColorPicker from '../../../ColorPicker'

export class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeSubject = (e) => {
    const { model } = this.props
    model.factorId = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeText = (type, text) => {
    const { model } = this.props
    model[type] = text
    this.forceUpdate()
  }

  changeDescription = (e) => {
    this.changeText('text', e.currentTarget.value)
  }

  changeStrengths = (e) => {
    this.changeText('strengths', e.currentTarget.value)
  }

  changeBlindspots = (e) => {
    this.changeText('blindspots', e.currentTarget.value)
  }

  changeWorkstyles = (e) => {
    this.changeText('workstyles', e.currentTarget.value)
  }

  changePossibleRoles = (e) => {
    this.changeText('possibleRoles', e.currentTarget.value)
  }

  changeColor = (color) => {
    const { model } = this.props
    model.color = color.hex
  }

  remove = () => {
    const { model } = this.props
    CPIFactorConditionStore.module.removeConditionCollection(model)
    CPIFactorConditionStore.update()
  }

  update = () => {
    this.forceUpdate()
  }

  renderConditions () {
    const { model } = this.props
    const assessment = _.find(AppStore.assessments, { id: model.module.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    const list = AppStore.factors[dimensionId]
    return (
      <div className={styles.listWrapper}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>If</span>
          <select
            value={model.factorId}
            onChange={this.changeSubject}
            className={`form-control ${localStyles.subjectSelect}`}
          >
            {!model.factorId && <option />}
            {list.map(factor => (
              <option key={factor.id} value={factor.id}>
                {factor.alias}
              </option>
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
          <strong>Description</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.text || ''}
            onChange={this.changeDescription}
          />
        </div>
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
        <div>
          <strong>Workstyles</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.workstyles || ''}
            onChange={this.changeWorkstyles}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div>
          <strong>Possible Roles</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.possibleRoles || ''}
            onChange={this.changePossibleRoles}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <strong>Color</strong>
          <ColorPicker color={model.color || 'rgba(0,0,0,0.0)'} onChange={this.changeColor} onComplete={this.update} />
        </div>
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete</a>
        </div>
      </div>
    )
  }
}

export default ConditionCollection

import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cs from 'classnames'

import { getCampaignFactors } from '~/modules/reports/core/builder/selectors'
import styles from './CampaignFactorConditionModal.less'
import ConditionList from './ConditionList'
import localStyles from './types/Scoring/Scoring.less'
import { ColorPicker } from '~/glint'
const { I18n } = window


export class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeSubject = (e) => {
    const { model } = this.props
    model.campaignFactorCode = e.currentTarget.value
    this.forceUpdate()
  }

  changeText = (type, text) => {
    const { model } = this.props
    model[type] = text
    this.forceUpdate()
  }

  changeTitle = (e) => {
    this.changeText('title', e.currentTarget.value)
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

  changeLabel = (e) => {
    this.changeText('label', e.currentTarget.value)
  }

  changeBaselineScore = (e) => {
    this.changeText('baselineScore', e.currentTarget.value)
  }

  changeColor = (color) => {
    const { model } = this.props
    model.color = color 
    this.forceUpdate()
  }

  remove = () => {
    const { onRemove, model } = this.props
    onRemove(model)
  }

  update = () => {
    this.forceUpdate()
  }

  renderConditions () {
    const { model, campaignFactors } = this.props
    return (
      <div className={styles.listWrapper}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{I18n.t('reports.modules.campaign_factors_table.if')}</span>
          <select
            value={model.campaignFactorCode}
            onChange={this.changeSubject}
            className={`form-control ${localStyles.subjectSelect}`}
          >
            {!model.campaignFactorCode && <option />}
            {campaignFactors.map(campaignFactor => (
              <option key={campaignFactor.code} value={campaignFactor.code}>
                {campaignFactor.name}
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
        {I18n.t('reports.modules.campaign_factors_table.if')}
        <div>
          <strong>{I18n.t('reports.modules.campaign_factors_table.title')}</strong>
          <input
            className="form-control"
            value={model.title || ''}
            onChange={this.changeTitle}
          />
        </div>
        <div>
          <strong>{I18n.t('reports.modules.campaign_factors_table.description')}</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.text || ''}
            onChange={this.changeDescription}
          />
        </div>
        <div>
          <strong>{I18n.t('reports.modules.campaign_factors_table.strengths')}</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.strengths || ''}
            onChange={this.changeStrengths}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div>
          <strong>{I18n.t('reports.modules.campaign_factors_table.blindspots')}</strong>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.blindspots || ''}
            onChange={this.changeBlindspots}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div>
          <strong>{I18n.t('reports.modules.campaign_factors_table.label')}</strong>
          <input
            type="text"
            className="form-control"
            value={model.label || ''}
            onChange={this.changeLabel}
            style={{ width: '100%', display: 'inline-block' }}
          />
        </div>
        <div>
          <strong>{I18n.t('reports.modules.campaign_factors_table.baseline_score')}</strong>
          <input
            type="number"
            className={cs('form-control', styles.smallInput)}
            value={model.baselineScore || ''}
            onChange={this.changeBaselineScore}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <strong>{I18n.t('reports.modules.campaign_factors_table.color')}</strong>
          <ColorPicker
            getValueInHexFormat
            colorPickerPosition="leftBottom"
            value={model.color || 'transparent'}
            
            onChange={
              this.changeColor
            }
          />
        </div>
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>
            {I18n.t('reports.modules.campaign_factors_table.delete')}
          </a>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  campaignFactors: getCampaignFactors(state),
}), {})(ConditionCollection)

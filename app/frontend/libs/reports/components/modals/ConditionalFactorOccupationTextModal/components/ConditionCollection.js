import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'rb/store/modals/ConditionalFactorOccupationTextStore'
import AppStore from 'rb/store/AppStore'
import { FONTS, FONT_MIN_SIZE, FONT_MAX_SIZE } from 'rb/components/PropertyFonts/components/PropertyFonts'
import ColorPicker from 'rb/components/ColorPicker'
import localStyles from './types/Scoring/Scoring.scss'
import ConditionList from './ConditionList'
import styles from './CPIFactorConditionModal.scss'

export class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeSubject = (e) => {
    const { model } = this.props
    model.factorId = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeText = (e) => {
    const { model } = this.props
    model.text = e.currentTarget.value
    this.forceUpdate()
  }

  remove = () => {
    const { model } = this.props
    store.module.removeConditionCollection(model)
    store.update()
  }

  changeFontFamily = (e) => {
    const { model } = this.props
    model.styles.fontFamily = e.currentTarget.value
    this.forceUpdate()
  }

  changeFontSize = (e) => {
    const { model } = this.props
    model.styles.fontSize = e.currentTarget.value
    this.forceUpdate()
  }

  changeFontColor = (value) => {
    const { model } = this.props
    model.styles.fontColor = value.hex
    this.forceUpdate()
  }

  changeBg = (val) => {
    const { model } = this.props
    model.styles.backgroundColor = val.rgb
    this.forceUpdate()
  }

  changeBorder = (val) => {
    const { model } = this.props
    model.styles.borderColor = val.rgb
    this.forceUpdate()
  }

  conditionsOptions () {
    const { model } = this.props
    const assessment = _.find(AppStore.assessments, { id: model.module.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    return AppStore.subfactors[dimensionId].map(factor => (
      <option key={factor.id} value={factor.id}>{factor.alias}</option>
    ))
  }

  renderConditions () {
    const { model } = this.props
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
            {this.conditionsOptions()}
          </select>
        </div>
        <ConditionList model={model} onRemove={this.update} />
      </div>
    )
  }

  renderFontFamily () {
    const { model } = this.props
    const { fontFamily } = model.styles
    return (
      <select className="form-control" value={fontFamily || 'Arial'} onChange={this.changeFontFamily}>
        {_.map(FONTS, (value, key) => (<option key={key} value={value}>{key}</option>))}
      </select>
    )
  }

  renderFontSize () {
    const { model } = this.props
    return (
      <select className="form-control" value={model.styles.fontSize || '100%'} onChange={this.changeFontSize}>
        {_.times(1 + (FONT_MAX_SIZE - FONT_MIN_SIZE) / 10, i => (
          <option key={i} value={`${i * 10 + FONT_MIN_SIZE}%`}>
            {i * 10 + FONT_MIN_SIZE}
            %
          </option>
        ))}
      </select>
    )
  }

  renderFontColor () {
    const { model } = this.props
    const { fontColor } = model.styles
    return (
      <ColorPicker color={fontColor || '#ccc'} onChange={this.changeFontColor} onComplete={this.update} />
    )
  }

  render () {
    const { model } = this.props
    const { fontColor, fontSize, fontFamily } = model.styles
    let { backgroundColor, borderColor } = model.styles
    backgroundColor = backgroundColor || {
      r: '238',
      g: '238',
      b: '238',
      a: '1',
    }

    borderColor = borderColor || {
      r: '170',
      g: '170',
      b: '170',
      a: '1',
    }

    const style = {
      backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
      borderColor: `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`,
      color: fontColor,
      fontSize,
      fontFamily,
    }

    return (
      <div className={styles.filterContainer}>
        {this.renderConditions()}
        Then show the following text:
        <div>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={model.text || ''}
            onChange={this.changeText}
            style={{ width: '100%', display: 'inline-block', ...style }}
          />
        </div>
        <div className={styles.stylesBlock}>
          and apply the following styles:
          <div>
            {this.renderFontFamily()}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              {this.renderFontSize()}
              {this.renderFontColor()}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.block} style={{ position: 'relative' }}>
              Background Color
              <ColorPicker color={backgroundColor} onChange={this.changeBg} onComplete={this.update} />
            </div>
            <div className={styles.block} style={{ position: 'relative' }}>
              Border Color
              <ColorPicker color={borderColor} onChange={this.changeBorder} onComplete={this.update} />
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete</a>
        </div>
      </div>
    )
  }
}

export default ConditionCollection
